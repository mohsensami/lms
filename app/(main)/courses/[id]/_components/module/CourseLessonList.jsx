import React from 'react';
import CourseLessonPreview from './CourseLessonPreview';

// `lesson` here is already the full Lesson object returned inside
// getCourseDetails()'s `module.lessonIds` (see queries/courses.js).
const CourseLessonList = ({ courseId, moduleSlug, lesson, isEnrolled, autoOpen }) => {
    return (
        <CourseLessonPreview
            courseId={courseId}
            moduleSlug={moduleSlug}
            lesson={lesson}
            isEnrolled={isEnrolled}
            autoOpen={autoOpen}
        />
    );
};

export default CourseLessonList;
