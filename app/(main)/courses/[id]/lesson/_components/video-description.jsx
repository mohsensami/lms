'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
