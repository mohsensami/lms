'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Loader2,
    Maximize,
    Minimize,
    Pause,
    PictureInPicture2,
    Play,
    RotateCcw,
    RotateCw,
    Volume1,
    Volume2,
    VolumeX,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Lesson video player (native <video> + our own controls).
 *
 *  - big play button, smooth seek bar with buffered range, hover time preview
 *  - ±10s buttons, double-tap on either side to skip, double-tap centre = fullscreen
 *  - playback speed, volume (remembered), picture-in-picture, fullscreen
 *  - keyboard: Space/K play · ←/→ ±5s · J/L ±10s · ↑/↓ volume · M mute · F fullscreen · 0-9 jump
 *  - resumes where the student stopped (per lesson, in this browser)
 *  - controls auto-hide while playing; spinner while buffering
 *
 * It is direction-aware: on an RTL page the timeline fills from the right.
 */

const RATES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const SKIP = 10;
const NUDGE = 5;
const HIDE_AFTER = 2800;

const toFa = (text) => String(text).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);

function formatTime(seconds) {
    const total = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    return toFa(h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`);
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function readJson(key) {
    try {
        return JSON.parse(window.localStorage.getItem(key) || 'null');
    } catch {
        return null;
    }
}
function writeJson(key, value) {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // storage can be unavailable (private mode) — the player still works
    }
}
function removeKey(key) {
    try {
        window.localStorage.removeItem(key);
    } catch {
        // ignore
    }
}

export default function LessonPlayer({
    src,
    storageKey,
    autoPlay = false,
    startAt = 0,
    onStart,
    onEnded,
    onPlaying,
    onFatalError,
    className,
}) {
    const containerRef = useRef(null);
    const videoRef = useRef(null);
    const barRef = useRef(null);
    const fillRef = useRef(null);
    const thumbRef = useRef(null);
    const rafRef = useRef(0);
    const hideTimer = useRef(null);
    const tapTimer = useRef(null);
    const lastTap = useRef({ time: 0, zone: null });
    const draggingRef = useRef(false);
    const lastSaved = useRef(0);
    const rtlRef = useRef(true);

    const [playing, setPlaying] = useState(false);
    const [started, setStarted] = useState(false);
    const [waiting, setWaiting] = useState(true);
    const [current, setCurrent] = useState(0);
    const [duration, setDuration] = useState(0);
    const [bufferedPct, setBufferedPct] = useState(0);
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);
    const [rate, setRate] = useState(1);
    const [fullscreen, setFullscreen] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [hover, setHover] = useState(null); // { pct, time }
    const [scrubbing, setScrubbing] = useState(false);
    const [flash, setFlash] = useState(null); // { side, key }
    const [resumeInfo, setResumeInfo] = useState(null); // seconds resumed from
    const [canPip, setCanPip] = useState(false);

    const positionKey = storageKey ? `lp:pos:${storageKey}` : null;

    // ---- visual progress (written straight to the DOM, so it is perfectly smooth)
    const paint = useCallback((time) => {
        const video = videoRef.current;
        const total = video?.duration;
        if (!total || !Number.isFinite(total)) return;
        const pct = clamp((time / total) * 100, 0, 100);
        if (fillRef.current) fillRef.current.style.width = `${pct}%`;
        if (thumbRef.current) thumbRef.current.style.insetInlineStart = `${pct}%`;
    }, []);

    useEffect(() => {
        let alive = true;
        const loop = () => {
            if (!alive) return;
            const video = videoRef.current;
            if (video && !draggingRef.current) paint(video.currentTime);
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
        return () => {
            alive = false;
            cancelAnimationFrame(rafRef.current);
        };
    }, [paint]);

    // ---- setup: stored preferences, direction, capabilities
    useEffect(() => {
        rtlRef.current = (document.documentElement.dir || 'ltr') === 'rtl';
        setCanPip(Boolean(document.pictureInPictureEnabled));

        const prefs = readJson('lp:prefs');
        const video = videoRef.current;
        if (prefs && video) {
            if (typeof prefs.volume === 'number') video.volume = clamp(prefs.volume, 0, 1);
            if (typeof prefs.muted === 'boolean') video.muted = prefs.muted;
            if (typeof prefs.rate === 'number' && RATES.includes(prefs.rate)) video.playbackRate = prefs.rate;
        }
    }, []);

    useEffect(() => {
        const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, []);

    // close the speed menu when clicking elsewhere
    useEffect(() => {
        if (!menuOpen) return undefined;
        const close = (event) => {
            if (!event.target.closest?.('[data-lp-menu]')) setMenuOpen(false);
        };
        document.addEventListener('pointerdown', close);
        return () => document.removeEventListener('pointerdown', close);
    }, [menuOpen]);

    useEffect(() => () => {
        clearTimeout(hideTimer.current);
        clearTimeout(tapTimer.current);
    }, []);

    // ---- controls auto-hide
    const wake = useCallback(() => {
        setControlsVisible(true);
        clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => {
            if (!videoRef.current?.paused) setControlsVisible(false);
        }, HIDE_AFTER);
    }, []);

    // ---- actions
    const togglePlay = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused || video.ended) video.play().catch(() => {});
        else video.pause();
    }, []);

    const seekTo = useCallback(
        (time) => {
            const video = videoRef.current;
            if (!video || !Number.isFinite(video.duration)) return;
            video.currentTime = clamp(time, 0, video.duration);
            setCurrent(video.currentTime);
            paint(video.currentTime);
        },
        [paint],
    );

    const skip = useCallback(
        (delta, showFlash = true) => {
            const video = videoRef.current;
            if (!video) return;
            seekTo(video.currentTime + delta);
            if (showFlash) {
                // On an RTL page "forward" is towards the left.
                const forward = delta > 0;
                const side = (forward ? rtlRef.current : !rtlRef.current) ? 'left' : 'right';
                setFlash({ side, key: Date.now(), forward });
                setTimeout(() => setFlash(null), 650);
            }
        },
        [seekTo],
    );

    const changeVolume = useCallback((next) => {
        const video = videoRef.current;
        if (!video) return;
        const value = clamp(next, 0, 1);
        video.volume = value;
        video.muted = value === 0;
    }, []);

    const toggleMute = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        if (video.muted || video.volume === 0) {
            video.muted = false;
            if (video.volume === 0) video.volume = 0.6;
        } else {
            video.muted = true;
        }
    }, []);

    const setPlaybackRate = useCallback((next) => {
        const video = videoRef.current;
        if (video) video.playbackRate = next;
        setMenuOpen(false);
    }, []);

    const toggleFullscreen = useCallback(() => {
        const container = containerRef.current;
        const video = videoRef.current;
        if (document.fullscreenElement) {
            document.exitFullscreen?.();
        } else if (container?.requestFullscreen) {
            container.requestFullscreen().catch(() => {});
        } else if (video?.webkitEnterFullscreen) {
            video.webkitEnterFullscreen(); // iPhone Safari
        }
    }, []);

    const togglePip = useCallback(async () => {
        const video = videoRef.current;
        try {
            if (document.pictureInPictureElement) await document.exitPictureInPicture();
            else await video?.requestPictureInPicture();
        } catch {
            // not available
        }
    }, []);

    // ---- seek bar (pointer based: mouse, touch and pen)
    const ratioFromEvent = (event) => {
        const rect = barRef.current.getBoundingClientRect();
        const raw = rtlRef.current ? (rect.right - event.clientX) / rect.width : (event.clientX - rect.left) / rect.width;
        return clamp(raw, 0, 1);
    };

    const onBarDown = (event) => {
        const video = videoRef.current;
        if (!video || !Number.isFinite(video.duration)) return;
        event.preventDefault();
        barRef.current.setPointerCapture(event.pointerId);
        draggingRef.current = true;
        setScrubbing(true);
        const time = ratioFromEvent(event) * video.duration;
        paint(time);
        setCurrent(time);
        wake();
    };

    const onBarMove = (event) => {
        const video = videoRef.current;
        if (!video || !Number.isFinite(video.duration)) return;
        const ratio = ratioFromEvent(event);
        setHover({ pct: ratio * 100, time: ratio * video.duration });
        if (draggingRef.current) {
            paint(ratio * video.duration);
            setCurrent(ratio * video.duration);
        }
    };

    const onBarUp = (event) => {
        const video = videoRef.current;
        if (!draggingRef.current || !video) return;
        draggingRef.current = false;
        setScrubbing(false);
        seekTo(ratioFromEvent(event) * video.duration);
    };

    // ---- click / double-tap on the picture
    const onSurfaceClick = (event) => {
        if (event.target.closest('[data-lp-controls]')) return;
        containerRef.current?.focus({ preventScroll: true });

        const rect = containerRef.current.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const zone = x < 0.33 ? 'left' : x > 0.67 ? 'right' : 'center';
        const now = Date.now();
        const isDouble = now - lastTap.current.time < 300 && lastTap.current.zone === zone;

        clearTimeout(tapTimer.current);

        if (isDouble) {
            lastTap.current = { time: 0, zone: null };
            if (zone === 'center') toggleFullscreen();
            else {
                const forward = rtlRef.current ? zone === 'left' : zone === 'right';
                skip(forward ? SKIP : -SKIP);
            }
            return;
        }

        lastTap.current = { time: now, zone };
        tapTimer.current = setTimeout(() => {
            togglePlay();
            lastTap.current = { time: 0, zone: null };
        }, 260);
    };

    // ---- keyboard
    const onKeyDown = (event) => {
        if (event.target.closest?.('input, [data-lp-menu] button')) {
            if (event.key !== 'Escape') return;
        }
        const rtl = rtlRef.current;
        const video = videoRef.current;
        let handled = true;

        switch (event.key) {
            case ' ':
            case 'k':
            case 'K':
                togglePlay();
                break;
            case 'ArrowRight':
                skip(rtl ? -NUDGE : NUDGE);
                break;
            case 'ArrowLeft':
                skip(rtl ? NUDGE : -NUDGE);
                break;
            case 'j':
            case 'J':
                skip(-SKIP);
                break;
            case 'l':
            case 'L':
                skip(SKIP);
                break;
            case 'ArrowUp':
                changeVolume((video?.volume ?? 1) + 0.1);
                break;
            case 'ArrowDown':
                changeVolume((video?.volume ?? 1) - 0.1);
                break;
            case 'm':
            case 'M':
                toggleMute();
                break;
            case 'f':
            case 'F':
                toggleFullscreen();
                break;
            case '>':
                setPlaybackRate(RATES[Math.min(RATES.length - 1, RATES.indexOf(video?.playbackRate ?? 1) + 1)]);
                break;
            case '<':
                setPlaybackRate(RATES[Math.max(0, RATES.indexOf(video?.playbackRate ?? 1) - 1)]);
                break;
            case 'Escape':
                setMenuOpen(false);
                handled = false;
                break;
            default:
                if (/^[0-9]$/.test(event.key) && video?.duration) {
                    seekTo((Number(event.key) / 10) * video.duration);
                } else {
                    handled = false;
                }
        }

        if (handled) {
            event.preventDefault();
            wake();
        }
    };

    // ---- <video> events
    const onLoadedMetadata = () => {
        const video = videoRef.current;
        setDuration(video.duration);
        setWaiting(false);

        if (startAt > 0) {
            video.currentTime = Math.min(startAt, video.duration - 1);
            return;
        }
        const saved = positionKey ? readJson(positionKey) : null;
        if (saved?.t > 15 && saved.t < video.duration - 20) {
            video.currentTime = saved.t;
            setResumeInfo(saved.t);
            setTimeout(() => setResumeInfo(null), 8000);
        }
    };

    const onTimeUpdate = () => {
        const video = videoRef.current;
        setCurrent(video.currentTime);
        if (!draggingRef.current) paint(video.currentTime);

        // save the position every ~4s
        if (positionKey && Math.abs(video.currentTime - lastSaved.current) > 4) {
            lastSaved.current = video.currentTime;
            writeJson(positionKey, { t: Math.floor(video.currentTime), d: Math.floor(video.duration || 0) });
        }
    };

    const onProgress = () => {
        const video = videoRef.current;
        const { buffered, currentTime, duration: total } = video;
        if (!total) return;
        for (let i = 0; i < buffered.length; i += 1) {
            if (buffered.start(i) <= currentTime + 0.5 && buffered.end(i) >= currentTime) {
                setBufferedPct(clamp((buffered.end(i) / total) * 100, 0, 100));
                return;
            }
        }
    };

    const onVolumeChange = () => {
        const video = videoRef.current;
        setVolume(video.volume);
        setMuted(video.muted);
        writeJson('lp:prefs', { volume: video.volume, muted: video.muted, rate: video.playbackRate });
    };

    const onRateChange = () => {
        const video = videoRef.current;
        setRate(video.playbackRate);
        writeJson('lp:prefs', { volume: video.volume, muted: video.muted, rate: video.playbackRate });
    };

    const handlePlay = () => {
        setPlaying(true);
        if (!started) {
            setStarted(true);
            onStart?.();
        }
        wake();
    };

    const handleEnded = () => {
        setPlaying(false);
        setControlsVisible(true);
        if (positionKey) removeKey(positionKey);
        onEnded?.();
    };

    const showControls = controlsVisible || !playing || menuOpen || scrubbing;
    const effectiveMuted = muted || volume === 0;
    const VolumeIcon = effectiveMuted ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

    return (
        <div
            ref={containerRef}
            tabIndex={0}
            role="region"
            aria-label="پخش‌کننده‌ی ویدیو"
            onKeyDown={onKeyDown}
            onPointerMove={wake}
            onPointerLeave={() => playing && setControlsVisible(false)}
            onClick={onSurfaceClick}
            onContextMenu={(event) => event.preventDefault()}
            className={cn(
                'group/player relative h-full w-full select-none overflow-hidden bg-black text-white outline-none',
                !showControls && playing && 'cursor-none',
                className,
            )}
        >
            <video
                ref={videoRef}
                src={src}
                className="h-full w-full bg-black object-contain"
                playsInline
                autoPlay={autoPlay}
                preload="metadata"
                controlsList="nodownload noremoteplayback"
                disablePictureInPicture={!canPip}
                onLoadedMetadata={onLoadedMetadata}
                onDurationChange={(e) => setDuration(e.currentTarget.duration)}
                onTimeUpdate={onTimeUpdate}
                onProgress={onProgress}
                onPlay={handlePlay}
                onPause={() => {
                    setPlaying(false);
                    setControlsVisible(true);
                }}
                onPlaying={() => {
                    setWaiting(false);
                    onPlaying?.();
                }}
                onWaiting={() => setWaiting(true)}
                onCanPlay={() => setWaiting(false)}
                onSeeked={onProgress}
                onVolumeChange={onVolumeChange}
                onRateChange={onRateChange}
                onEnded={handleEnded}
                onError={() => onFatalError?.(videoRef.current?.currentTime || 0)}
            />

            {/* buffering spinner */}
            {waiting && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-white/90 drop-shadow" />
                </div>
            )}

            {/* big play button */}
            {!playing && !waiting && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-black/40 transition-transform group-hover/player:scale-110 sm:h-20 sm:w-20">
                        <Play className="h-7 w-7 fill-current sm:h-8 sm:w-8" />
                    </span>
                </div>
            )}

            {/* double-tap skip feedback */}
            {flash && (
                <div
                    key={flash.key}
                    className={cn(
                        'pointer-events-none absolute top-1/2 flex h-24 w-24 -translate-y-1/2 animate-in fade-in zoom-in-90 flex-col items-center justify-center rounded-full bg-black/55 text-sm font-bold',
                        flash.side === 'left' ? 'left-[12%]' : 'right-[12%]',
                    )}
                >
                    {flash.forward ? <RotateCw className="mb-1 h-6 w-6" /> : <RotateCcw className="mb-1 h-6 w-6" />}
                    {toFa(SKIP)} ثانیه
                </div>
            )}

            {/* resume banner */}
            {resumeInfo && (
                <div
                    data-lp-controls
                    className="absolute start-3 top-3 flex items-center gap-3 rounded-full bg-black/70 py-1.5 pe-1.5 ps-4 text-xs backdrop-blur"
                >
                    <span>ادامه از {formatTime(resumeInfo)}</span>
                    <button
                        type="button"
                        className="rounded-full bg-primary px-3 py-1 font-semibold text-primary-foreground"
                        onClick={() => {
                            seekTo(0);
                            setResumeInfo(null);
                        }}
                    >
                        از اول
                    </button>
                </div>
            )}

            {/* controls */}
            <div
                data-lp-controls
                className={cn(
                    'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pb-2 pt-12 transition-opacity duration-200 sm:px-4',
                    showControls ? 'opacity-100' : 'pointer-events-none opacity-0',
                )}
            >
                {/* seek bar */}
                <div
                    ref={barRef}
                    role="slider"
                    aria-label="موقعیت پخش"
                    aria-valuemin={0}
                    aria-valuemax={Math.floor(duration) || 0}
                    aria-valuenow={Math.floor(current)}
                    aria-valuetext={`${formatTime(current)} از ${formatTime(duration)}`}
                    className="group/bar relative flex h-5 w-full cursor-pointer touch-none items-center"
                    onPointerDown={onBarDown}
                    onPointerMove={onBarMove}
                    onPointerUp={onBarUp}
                    onPointerCancel={onBarUp}
                    onPointerLeave={() => !draggingRef.current && setHover(null)}
                >
                    <div className="relative h-1 w-full rounded-full bg-white/25 transition-[height] group-hover/bar:h-1.5">
                        <div
                            className="absolute inset-y-0 rounded-full bg-white/35"
                            style={{ insetInlineStart: 0, width: `${bufferedPct}%` }}
                        />
                        <div
                            ref={fillRef}
                            className="absolute inset-y-0 rounded-full bg-primary"
                            style={{ insetInlineStart: 0, width: '0%' }}
                        />
                        <div
                            ref={thumbRef}
                            className={cn(
                                'absolute top-1/2 h-3.5 w-3.5 rounded-full bg-primary shadow transition-transform',
                                'ltr:-translate-x-1/2 rtl:translate-x-1/2 -translate-y-1/2',
                                scrubbing ? 'scale-125' : 'scale-0 group-hover/bar:scale-100',
                            )}
                            style={{ insetInlineStart: '0%' }}
                        />
                    </div>

                    {hover && (
                        <div
                            className="pointer-events-none absolute -top-7 rounded bg-black/80 px-2 py-0.5 text-xs ltr:-translate-x-1/2 rtl:translate-x-1/2"
                            style={{ insetInlineStart: `${hover.pct}%` }}
                        >
                            {formatTime(hover.time)}
                        </div>
                    )}
                </div>

                {/* buttons */}
                <div className="mt-1 flex items-center gap-1 sm:gap-2">
                    <ControlButton label={playing ? 'توقف' : 'پخش'} onClick={togglePlay}>
                        {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
                    </ControlButton>

                    <ControlButton label={`${toFa(SKIP)} ثانیه عقب`} onClick={() => skip(-SKIP)} className="hidden sm:flex">
                        <RotateCcw className="h-5 w-5" />
                    </ControlButton>
                    <ControlButton label={`${toFa(SKIP)} ثانیه جلو`} onClick={() => skip(SKIP)} className="hidden sm:flex">
                        <RotateCw className="h-5 w-5" />
                    </ControlButton>

                    <div className="group/vol flex items-center">
                        <ControlButton label={effectiveMuted ? 'باز کردن صدا' : 'بی‌صدا'} onClick={toggleMute}>
                            <VolumeIcon className="h-5 w-5" />
                        </ControlButton>
                        {/* wrapper clips the slider (and its thumb) while collapsed */}
                        <div className="hidden w-0 overflow-hidden transition-all duration-200 group-hover/vol:ms-1 group-hover/vol:w-20 group-focus-within/vol:ms-1 group-focus-within/vol:w-20 sm:block">
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.02"
                                value={effectiveMuted ? 0 : volume}
                                onChange={(e) => changeVolume(Number(e.target.value))}
                                aria-label="میزان صدا"
                                className="block h-1 w-20 cursor-pointer accent-primary"
                            />
                        </div>
                    </div>

                    <span className="ms-1 whitespace-nowrap text-xs tabular-nums text-white/90 sm:text-sm">
                        {formatTime(current)} <span className="text-white/50">/</span> {formatTime(duration)}
                    </span>

                    <div className="flex-1" />

                    <div className="relative" data-lp-menu>
                        <button
                            type="button"
                            onClick={() => setMenuOpen((open) => !open)}
                            aria-label="سرعت پخش"
                            aria-expanded={menuOpen}
                            className="flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm font-bold tabular-nums transition hover:bg-white/15"
                        >
                            <bdi dir="ltr">{toFa(rate)}×</bdi>
                        </button>
                        {menuOpen && (
                            <div className="absolute bottom-11 end-0 z-10 min-w-28 overflow-hidden rounded-lg bg-black/90 py-1 text-sm shadow-xl backdrop-blur">
                                {RATES.map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setPlaybackRate(value)}
                                        className={cn(
                                            'flex w-full items-center justify-between gap-6 px-4 py-1.5 text-start transition hover:bg-white/15',
                                            value === rate && 'font-bold text-primary',
                                        )}
                                    >
                                        <span>{value === 1 ? 'عادی' : <bdi dir="ltr">{toFa(value)}×</bdi>}</span>
                                        {value === rate && <span aria-hidden>●</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {canPip && (
                        <ControlButton label="تصویر در تصویر" onClick={togglePip} className="hidden sm:flex">
                            <PictureInPicture2 className="h-5 w-5" />
                        </ControlButton>
                    )}

                    <ControlButton label={fullscreen ? 'خروج از تمام‌صفحه' : 'تمام‌صفحه'} onClick={toggleFullscreen}>
                        {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                    </ControlButton>
                </div>
            </div>
        </div>
    );
}

function ControlButton({ label, onClick, children, className }) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={onClick}
            className={cn('flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-white/15', className)}
        >
            {children}
        </button>
    );
}
