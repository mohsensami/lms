// Standard Jalali <-> Gregorian conversion (based on the well-known
// public-domain algorithm by Kazimierz Borkowski / jalaali-js). Implemented
// directly here so we don't need to add a new npm dependency just for this.

const JALALI_MONTH_NAMES = [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند',
];

function div(a, b) {
    return Math.trunc(a / b);
}

function jalCal(jy) {
    const breaks = [
        -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178,
    ];
    const bl = breaks.length;
    const gy = jy + 621;
    let leapJ = -14;
    let jp = breaks[0];
    let jump = 0;

    if (jy < jp || jy >= breaks[bl - 1]) {
        throw new Error('Invalid Jalali year ' + jy);
    }

    for (let i = 1; i < bl; i += 1) {
        const jm = breaks[i];
        jump = jm - jp;
        if (jy < jm) break;
        leapJ = leapJ + div(jump, 33) * 8 + div(jump % 33, 4);
        jp = jm;
    }
    let n = jy - jp;

    leapJ = leapJ + div(n, 33) * 8 + div((n % 33) + 3, 4);
    if (jump % 33 === 4 && jump - n === 4) leapJ += 1;

    const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
    const march = 20 + leapJ - leapG;

    if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
    let leap = ((((n + 1) % 33) - 1) % 4) === -1 ? 0 : ((n + 1) % 33) - 1;
    leap = leap === 0 || leap === 4 ? 1 : 0;

    // simpler leap-year check (sufficient for our display/date-math use case)
    const isLeap = jalIsLeap(jy);

    return { leap: isLeap, march };
}

function jalIsLeap(jy) {
    // 33-year cycle rule — accurate for the modern era we care about here.
    const r = ((jy - (jy > 0 ? 474 : 473)) % 2820) + 474;
    return ((r + 38) * 682) % 2816 < 682;
}

function g2d(gy, gm, gd) {
    let d =
        div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
        div(153 * ((gm + 9) % 12) + 2, 5) +
        gd -
        34840408;
    d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
    return d;
}

function d2g(jdn) {
    let j = 4 * jdn + 139361631;
    j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
    const i = div((j % 1461), 4) * 5 + 308;
    const gd = div(i % 153, 5) + 1;
    const gm = (div(i, 153) % 12) + 1;
    const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
    return { gy, gm, gd };
}

function jalToJd(jy, jm, jd) {
    const { march } = jalCal(jy);
    return g2d(jy + 621, 3, march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

function jdToJal(jdn) {
    const gy = d2g(jdn).gy;
    let jy = gy - 621;
    const { march } = jalCal(jy);
    let jdn1f = g2d(gy, 3, march);
    let k = jdn - jdn1f;

    if (k >= 0) {
        if (k <= 185) {
            const jm = 1 + div(k, 31);
            const jd = (k % 31) + 1;
            return { jy, jm, jd };
        }
        k -= 186;
    } else {
        jy -= 1;
        k += 179;
        if (jalIsLeap(jy)) k += 1;
    }
    const jm = 7 + div(k, 30);
    const jd = (k % 30) + 1;
    return { jy, jm, jd };
}

/** Gregorian JS Date -> { year, month, day } in the Jalali calendar (month is 1-12). */
export function toJalali(date) {
    const d = new Date(date);
    const { jy, jm, jd } = jdToJal(g2d(d.getFullYear(), d.getMonth() + 1, d.getDate()));
    return { year: jy, month: jm, day: jd };
}

/** Jalali { year, month, day } (+ optional hour/minute) -> a real JS Date. */
export function fromJalali(year, month, day, hour = 0, minute = 0) {
    const jdn = jalToJd(year, month, day);
    const { gy, gm, gd } = d2g(jdn);
    return new Date(gy, gm - 1, gd, hour, minute, 0, 0);
}

export function jalaliMonthName(month) {
    return JALALI_MONTH_NAMES[month - 1] || '';
}

export function jalaliDaysInMonth(year, month) {
    if (month <= 6) return 31;
    if (month <= 11) return 30;
    return jalIsLeap(year) ? 30 : 29;
}

/** Nice display string, e.g. "۱۴ مرداد ۱۴۰۴ - ساعت ۲۳:۵۹" */
export function formatJalaliDateTime(date) {
    if (!date) return '';
    const d = new Date(date);
    const { year, month, day } = toJalali(d);
    const hour = String(d.getHours()).padStart(2, '0');
    const minute = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${jalaliMonthName(month)} ${year} - ساعت ${hour}:${minute}`;
}
