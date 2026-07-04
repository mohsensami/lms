export default function DashboardLoading() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center px-6 py-12">
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-background/80 px-8 py-6 shadow-sm">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm font-medium text-muted-foreground">در حال دریافت اطلاعات...</p>
            </div>
        </div>
    );
}
