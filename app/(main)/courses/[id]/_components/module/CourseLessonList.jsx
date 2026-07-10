import React from 'react';
import { getLesson } from '@/queries/lessons';
import CourseLessonPreview from './CourseLessonPreview';

const CourseLessonList = async ({ lessonId }) => {
    const lesson = await getLesson(lessonId);

    return <CourseLessonPreview lesson={lesson} />;
};

export default CourseLessonList;
