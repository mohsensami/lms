// Site theme (primary colour). Isomorphic on purpose: the admin settings
// page uses the very same functions to live-preview a colour before saving,
// and the root layout uses them to inject the saved colour as CSS variables.

export const DEFAULT_PRIMARY = '#4f46e5';

export const THEME_PRESETS = [
    { name: 'بنفش', value: '#4f46e5' },
    { name: 'آبی', value: '#2563eb' },
    { name: 'فیروزه‌ای', value: '#0d9488' },
    { name: 'سبز', value: '#059669' },
    { name: 'نارنجی', value: '#ea580c' },
    { name: 'قرمز', value: '#e11d48' },
    { name: 'صورتی', value: '#db2777' },
    { name: 'خاکستری', value: '#475569' },
];

const HEX_RE = /^#?([0-9a-f]{6})$/i;

/** Returns "#rrggbb" (lower-case) or null when the input is not a valid colour. */
export function normalizeHex(input) {
    if (typeof input !== 'string') return null;
    const m = HEX_RE.exec(input.trim());
    return m ? `#${m[1].toLowerCase()}` : null;
}

function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function hexToHsl(hex) {
    const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    const d = max - min;
    let h = 0;
    let s = 0;

    if (d !== 0) {
        s = d / (1 - Math.abs(2 * l - 1));
        if (max === r) h = ((g - b) / d) % 6;
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h *= 60;
        if (h < 0) h += 360;
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function luminance(hex) {
    const [r, g, b] = hexToRgb(hex).map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const hsl = (h, s, l) => `${h} ${Math.round(s)}% ${Math.round(l)}%`;

/**
 * Derives every colour token that depends on the brand colour (button,
 * ring, soft backgrounds, hover tints, text on top of the colour) for both
 * light and dark mode. Neutral tokens (background, border, muted...) stay
 * untouched.
 */
export function buildThemeVars(input) {
    const hex = normalizeHex(input) || DEFAULT_PRIMARY;
    const { h, s, l } = hexToHsl(hex);

    // Dark text on very light brand colours, white text otherwise.
    const onPrimary = luminance(hex) > 0.34 ? '240 10% 4%' : '0 0% 100%';
    const darkL = clamp(l, 60, 72);

    return {
        hex,
        light: {
            '--primary': hsl(h, s, l),
            '--primary-foreground': onPrimary,
            '--ring': hsl(h, s, l),
            '--secondary': hsl(h, clamp(s * 0.8, 0, 60), 97),
            '--secondary-foreground': hsl(h, clamp(s * 0.6, 0, 50), 30),
            '--accent': hsl(h, clamp(s, 0, 80), 96),
            '--accent-foreground': hsl(h, clamp(s * 0.93, 0, 75), Math.min(l, 40)),
        },
        dark: {
            '--primary': hsl(h, s, darkL),
            '--primary-foreground': luminance(hex) > 0.5 ? '240 10% 4%' : '0 0% 100%',
            '--ring': hsl(h, s, darkL),
            '--secondary': hsl(h, Math.min(s, 30), 16),
            '--secondary-foreground': '0 0% 98%',
            '--accent': hsl(h, Math.min(s, 35), 18),
            '--accent-foreground': hsl(h, Math.min(s + 10, 90), 85),
        },
    };
}

const toDeclarations = (vars) =>
    Object.entries(vars)
        .map(([name, value]) => `${name}:${value}`)
        .join(';');

/** CSS text for a <style> tag. Built only from parsed numbers — never from raw input. */
export function buildThemeCss(input) {
    const { light, dark } = buildThemeVars(input);
    return `:root{${toDeclarations(light)}}.dark{${toDeclarations(dark)}}`;
}
