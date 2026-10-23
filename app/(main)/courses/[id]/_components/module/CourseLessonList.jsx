import React from 'react';
import CourseLessonPreview from './CourseLessonPreview';

// `lesson` is the full Lesson row from getCourseDetails() (see
// queries/courses.js). CourseLessonPreview is a CLIENT component, so
// anything passed here is serialized into the page HTML. Video storage
// details (bucket key, provider, external URL) must never cross that
// boundary — the client only learns *whether* a video exists and then asks
// /api/video/:lessonId, which checks access and returns a signed link.
const CourseLessonList = ({ courseId, moduleSlug, lesson, isEnrolled, autoOpen }) => {
    const { video_url, videoKey, videoUrl, videoProvider, videoName, videoSize, videoContentType, ...publicLesson } = lesson;

    const clientLesson = {
        ...publicLesson,
        hasVideo: lesson.hasVideo ?? Boolean(videoKey || video_url),
    };

    return (
        <CourseLessonPreview
            courseId={courseId}
            moduleSlug={moduleSlug}
            lesson={clientLesson}
            isEnrolled={isEnrolled}
            autoOpen={autoOpen}
        />
    );
};

export default CourseLessonList;
