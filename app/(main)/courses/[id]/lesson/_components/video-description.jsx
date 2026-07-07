'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QuizModal from './quiz-modal';
const quizes = [
    {
        id: 'quiz-1',
        title: 'Quiz title 1',
        description: 'توضیحات آزمون',
        options: [
            { label: 'Option-1', id: 1, isCorrect: true },
            { label: 'Option-2', id: 2, isCorrect: false },
            { label: 'Option-3', id: 3, isCorrect: false },
            { label: 'Option-4', id: 4, isCorrect: true },
        ],
    },
    {
        id: 'quiz-2',
        title: 'Quiz title 2',
        description: 'توضیحات آزمون',
        options: [
            { label: 'Quiz-2 Option-1', id: 1, isCorrect: true },
            { label: 'Quiz-2 Option-2', id: 2, isCorrect: false },
            { label: 'Quiz-2 Option-3', id: 3, isCorrect: false },
            { label: 'Quiz-2 Option-4', id: 4, isCorrect: true },
        ],
    },
];

function VideoDescription({ description }) {
    return (
        <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <Tabs defaultValue="details">
                <TabsList className="gap-2 rounded-3xl bg-slate-50 p-1 border border-slate-200">
                    <TabsTrigger
                        className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-semibold text-slate-700 px-4 py-2 rounded-3xl"
                        value="details"
                    >
                        توضیحات
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="mt-4 text-sm leading-7 text-slate-700">
                    <div>{description}</div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default VideoDescription;
