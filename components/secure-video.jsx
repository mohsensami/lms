'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Lock } from 'lucide-react';

// Only used for legacy lessons that still point at an external link
// (YouTube, plain .mp4, ...). react-player needs browser APIs.
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

const MAX_REFRESH_RETRIES = 3;

/**
 * Plays a lesson video WITHOUT the page ever knowing where it lives.
 *
 * It asks /api/video/:lessonId for a short-lived signed URL (the server
 * decides whether this visitor may watch), plays it, and — because signed
 * URLs expire — quietly fetches a fresh one and resumes from the same
 * position if playback fails mid-way.
 */
export default function SecureVideo({ lessonId, autoPlay = false, onStart, onEnded, className = '' }) {
    const [source, setSource] = useState(null); // { url, external? }
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const videoRef = useRef(null);
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

    function handlePlaybackError() {
        if (retries.current >= MAX_REFRESH_RETRIES) {
            setError('پخش ویدیو با مشکل مواجه شد. صفحه را رفرش کنید.');
            return;
        }
        retries.current += 1;
        resumeAt.current = videoRef.current?.currentTime || 0;
        loadSource();
    }

    function handleLoadedMetadata() {
        const video = videoRef.current;
        if (video && resumeAt.current > 0) {
            video.currentTime = resumeAt.current;
            resumeAt.current = 0;
            video.play().catch(() => {});
        }
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

    if (source.external) {
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

    return (
        <video
            ref={videoRef}
            key={source.url}
            src={source.url}
            className={`h-full w-full bg-black ${className}`}
            controls
            playsInline
            autoPlay={autoPlay}
            preload="metadata"
            controlsList="nodownload"
            onContextMenu={(event) => event.preventDefault()}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => onStart?.()}
            onPlaying={() => {
                retries.current = 0;
            }}
            onEnded={() => onEnded?.()}
            onError={handlePlaybackError}
        />
    );
}
