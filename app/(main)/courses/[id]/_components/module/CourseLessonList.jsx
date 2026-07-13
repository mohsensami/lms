import React from 'react';
import CourseLessonPreview from './CourseLessonPreview';

// `lesson` here is already the full Lesson object returned inside
// getCourseDetails()'s `module.lessonIds` (see queries/courses.js).
// We used to re-fetch it again via getLesson(lessonId), which meant one
// extra DB round-trip PER LESSON, fired in parallel for every lesson in
// every module on the course page. On a course with, say, 20 lessons that
// is 20 simultaneous Prisma connections on top of everything else the page
// already queries — a common cause of Neon's
// "Can't reach database server" errors under load / after cold start.
// We already have the data, so we just render it directly, no query.
const CourseLessonList = ({ lesson, isEnrolled }) => {
    return <CourseLessonPreview lesson={lesson} isEnrolled={isEnrolled} />;
};

export default CourseLessonList;
