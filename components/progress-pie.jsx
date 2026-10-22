import { PROGRESS_STATUS, PROGRESS_STATUS_LABEL } from '@/lib/progress';

// Segment colours (hex so they also work as SVG stroke colours).
const COLORS = {
    [PROGRESS_STATUS.COMPLETED]: '#10b981',
    [PROGRESS_STATUS.IN_PROGRESS]: '#6366f1',
    [PROGRESS_STATUS.NOT_STARTED]: '#cbd5e1',
};
const ORDER = [PROGRESS_STATUS.COMPLETED, PROGRESS_STATUS.IN_PROGRESS, PROGRESS_STATUS.NOT_STARTED];

const toFa = (n) => Number(n).toLocaleString('fa-IR');

/**
 * Donut/pie chart of a student's courses by status. Pure SVG (no chart
 * library), server-component safe.
 * counts: { completed, 'in-progress', 'not-started' }  — number of courses.
 */
export function ProgressPie({ counts, total, size = 220 }) {
    const stroke = 34;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const center = size / 2;

    // A single full-circle segment would draw as a hairline gap-free ring,
    // which is what we want; multiple segments get a small visual gap.
    const visible = ORDER.filter((key) => counts[key] > 0);
    const gap = visible.length > 1 ? 3 : 0;
    let offset = 0;

    const segments = visible.map((key) => {
        const length = (counts[key] / total) * c;
        const seg = { key, dash: Math.max(length - gap, 0.5), offset };
        offset += length;
        return seg;
    });

    return (
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
            <div className="relative shrink-0" style={{ width: size, height: size }}>
                <svg
                    viewBox={`0 0 ${size} ${size}`}
                    width={size}
                    height={size}
                    role="img"
                    aria-label={`نمودار دایره‌ای پیشرفت: ${ORDER.map((k) => `${PROGRESS_STATUS_LABEL[k]} ${counts[k]}`).join('، ')}`}
                >
                    <circle cx={center} cy={center} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
                    {total > 0 &&
                        segments.map((seg) => (
                            <circle
                                key={seg.key}
                                cx={center}
                                cy={center}
                                r={r}
                                fill="none"
                                stroke={COLORS[seg.key]}
                                strokeWidth={stroke}
                                strokeDasharray={`${seg.dash} ${c - seg.dash}`}
                                strokeDashoffset={-seg.offset}
                                transform={`rotate(-90 ${center} ${center})`}
                            />
                        ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-extrabold text-foreground">{toFa(counts[PROGRESS_STATUS.COMPLETED])}</span>
                    <span className="text-xs text-muted-foreground">از {toFa(total)} دوره گذرانده</span>
                </div>
            </div>

            <ul className="w-full max-w-xs space-y-3">
                {ORDER.map((key) => (
                    <li key={key} className="flex items-center justify-between gap-3 text-sm">
                        <span className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[key] }} />
                            {PROGRESS_STATUS_LABEL[key]}
                        </span>
                        <span className="font-bold">
                            {toFa(counts[key])}
                            <span className="mr-1 text-xs font-normal text-muted-foreground">
                                ({toFa(total ? Math.round((counts[key] / total) * 100) : 0)}٪)
                            </span>
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export { COLORS as PROGRESS_COLORS };
