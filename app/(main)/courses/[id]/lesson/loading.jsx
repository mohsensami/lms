export default function LessonLoading() {
    return (
        <div className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8">
            <div className="space-y-6">
                <div className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-sm">
                    <div className="flex flex-col gap-6 animate-pulse">
                        <div className="h-6 w-32 rounded-full bg-sky-100" />
                        <div className="space-y-4">
                            <div className="h-8 w-2/3 rounded-lg bg-slate-200" />
                            <div className="h-4 w-full max-w-3xl rounded bg-slate-100" />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="h-16 rounded-3xl bg-slate-100" />
                            <div className="h-16 rounded-3xl bg-slate-100" />
                            <div className="h-16 rounded-3xl bg-slate-100" />
                        </div>
                    </div>
                </div>

                <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="animate-pulse space-y-4">
                        <div className="h-3 w-24 rounded bg-slate-100" />
                        <div className="h-4 w-40 rounded bg-slate-200" />
                        <div className="mt-4 space-y-3">
                            <div className="h-14 rounded-2xl bg-slate-100" />
                            <div className="h-14 rounded-2xl bg-slate-100" />
                            <div className="h-14 rounded-2xl bg-slate-100" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
