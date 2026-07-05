'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player'; // حذف /youtube

export const LessonVideo = ({ courseId, lesson, module }) => {
    const [hasWindow, setHasWindow] = useState(false);
    const [started, setStarted] = useState(false);
    const [ended, setEnded] = useState(false);
    const [duration, setDuration] = useState(0);

    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setHasWindow(true);
        }
    }, []);

    useEffect(() => {
        async function updateLessonWatch() {
            const response = await fetch('/api/lesson-watch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    courseId: courseId,
                    lessonId: lesson.id,
                    moduleSlug: module,
                    state: 'started',
                    lastTime: 0,
                }),
            });
            if (response.status === 200) {
                const result = await response.text();
                console.log(result);
                setStarted(false);
            }
        }
        started && updateLessonWatch();
    }, [started, courseId, lesson.id, module]);

    useEffect(() => {
        async function updateLessonWatch() {
            const response = await fetch('/api/lesson-watch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    courseId: courseId,
                    lessonId: lesson.id,
                    moduleSlug: module,
                    state: 'completed',
                    lastTime: duration,
                }),
            });
            if (response.status === 200) {
                const result = await response.text();
                setEnded(false);
                router.refresh();
            }
        }
        ended && updateLessonWatch();
    }, [ended, courseId, lesson.id, module, duration, router]);

    function handleOnStart() {
        console.log('handleOnStart');
        setStarted(true);
    }

    function handleOnEnded() {
        console.log('handleOnEnded');
        setEnded(true);
    }

    function handleOnDuration(duration) {
        // اینجا duration رو به عنوان پارامتر بگیر
        console.log('handleOnDuration', duration);
        setDuration(duration);
    }

    function handleOnProgress(state) {
        // می‌تونی زمان فعلی رو اینجا داشته باشی: state.playedSeconds
        // console.log("پیشرفت:", state.playedSeconds);
    }

    return (
        <>
            {hasWindow && (
                <ReactPlayer
                    url={lesson.video_url} // اینجا هر لینکی می‌تونه باشه (MP4, ویدیوهای معمولی)
                    width="100%"
                    height="470px"
                    controls={true}
                    onStart={handleOnStart}
                    onDuration={handleOnDuration} // تابع درست استفاده شده
                    onProgress={handleOnProgress}
                    onEnded={handleOnEnded}
                    config={{
                        file: {
                            attributes: {
                                controlsList: 'nodownload', // اختیاری: جلوگیری از دانلود
                            },
                        },
                    }}
                />
            )}
        </>
    );
};
