'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Lock } from 'lucide-react';
import LessonPlayer from '@/components/lesson-player';

// Only used for external links we cannot play natively (YouTube, Vimeo, HLS...).
// react-player needs browser APIs.
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

const MAX_REFRESH_RETRIES = 3;
const DIRECT_FILE = /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i;

/** Aparat page links (aparat.com/v/xxxx) can only be shown through their embed player. */
function getAparatEmbedUrl(url) {
    try {
        const { hostname, pathname } = new URL(url);
        if (!/(^|\.)aparat\.com$/.test(hostname)) return null;
        const match = /\/v\/([A-Za-z0-9]+)/.exec(pathname);
        if (match) return `https://www.aparat.com/video/video/embed/videohash/${match[1]}/vt/frame`;
        return pathname.includes('/embed/') ? url : null;
    } catch {
        return null;
    }
}

/**
 * Plays a lesson video WITHOUT the page ever knowing where it lives.
 *
 * It asks /api/video/:lessonId for a short-lived link (the server decides
 * whether this visitor may watch) and plays it in our own player. Because
 * signed links expire, if playback fails it quietly fetches a fresh one and
 * resumes from the same second.
 */
export default function SecureVideo({ lessonId, autoPlay = false, onStart, onEnded, className = '' }) {
    const [source, setSource] = useState(null); // { url, external? }
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const resumeAt = useRef(0);
    const retries = useRef(0);

    const loadSource = useCallback(async () => {
        try {
            const res = await fetch(`/api/video/${lessonId}`, { cache: 'no-store' });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data?.error || 'خطا در دریافت ویدیو.');
            }
            setSource(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'خطا در دریافت ویدیو.');
        } finally {
            setLoading(false);
        }
    }, [lessonId]);

    useEffect(() => {
        setLoading(true);
        setSource(null);
        retries.current = 0;
        resumeAt.current = 0;
        loadSource();
    }, [loadSource]);

    function handlePlaybackError(time) {
        if (retries.current >= MAX_REFRESH_RETRIES) {
            setError('پخش ویدیو با مشکل مواجه شد. صفحه را رفرش کنید.');
            return;
        }
        retries.current += 1;
        resumeAt.current = time || 0;
        loadSource();
    }

    if (loading) {
        return (
            <div className={`flex h-full w-full items-center justify-center bg-slate-950 text-white ${className}`}>
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        );
    }

    if (error || !source?.url) {
        return (
            <div
                className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-950 p-6 text-center text-sm text-white ${className}`}
            >
                <Lock className="h-6 w-6 opacity-70" />
                <p>{error || 'ویدیو در دسترس نیست.'}</p>
            </div>
        );
    }

    if (source.external && !DIRECT_FILE.test(source.url)) {
        const aparatUrl = getAparatEmbedUrl(source.url);
        if (aparatUrl) {
            return (
                <iframe
                    src={aparatUrl}
                    title="ویدیوی درس"
                    className="h-full w-full border-0"
                    allowFullScreen
                    allow="fullscreen; picture-in-picture"
                />
            );
        }

        return (
            <ReactPlayer
                url={source.url}
                width="100%"
                height="100%"
                controls
                playing={autoPlay}
                onStart={onStart}
                onEnded={onEnded}
                config={{ file: { attributes: { controlsList: 'nodownload' } } }}
            />
        );
    }

    // Uploaded videos and direct .mp4/.webm links: our own player.
    return (
        <LessonPlayer
            key={source.url}
            src={source.url}
            storageKey={`lesson:${lessonId}`}
            autoPlay={autoPlay}
            startAt={resumeAt.current}
            onStart={onStart}
            onEnded={onEnded}
            onPlaying={() => {
                retries.current = 0;
                resumeAt.current = 0;
            }}
            onFatalError={handlePlaybackError}
            className={className}
        />
    );
}
