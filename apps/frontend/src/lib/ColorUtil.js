// /src/lib/ColorUtil.js

import { assertType, assertValueRange } from "./Assert";

const generateRandomNumber = (min, max) => {
    assertType(min, 'number');
    assertType(max, 'number');
    return Math.random() * (max - min) + min;
};

export const generateBaseColor = () => {
    let h;
    // Define pleasing color ranges
    const colorRanges = [
        { min: 180, max: 220 }, // Blues
        { min: 220, max: 280 }, // Purples
        { min: 80, max: 150 },  // Greens
        { min: 340, max: 360 }  // Soft reds
    ];

    // Select a random range
    const selectedRange = colorRanges[Math.floor(Math.random() * colorRanges.length)];
    h = generateRandomNumber(selectedRange.min, selectedRange.max);

    return {
        h,
        s: generateRandomNumber(0.30, 0.45), // Slightly reduced saturation range
        l: generateRandomNumber(0.50, 0.65)  // Adjusted lightness for better visibility
    };
};

// export const generateBaseColor = () => ({
//     h: generateRandomNumber(0, 360),
//     s: generateRandomNumber(0.45, 0.85),
//     l: generateRandomNumber(0.45, 0.65)
// });

// format hsla to string for use as a css color value
export const formatHSL = (color, alpha = 1) => `hsl(${color.h} ${color.s}% ${color.l}% / ${alpha})`;


// const adjustColorForDarkTheme = (color) => {
//     if (!color) return;
//     console.log(color)
//     return {
//         h: color.h,
//         s: Math.min(color.s + 0.15, 0.90),   // boost saturation
//         l: Math.max(0.30, Math.min(0.85, 0.100 - color.l))  // invert lightness with bounds
//     }
// };

const adjustColorForDarkTheme = (color, role) => {
    if (!color) return;

    let newColor = { ...color };

    switch (role) {
        case 'base':
            newColor = {
                h: color.h,
                s: Math.min(color.s + 0.10, 0.55),
                l: 0.45
            };
            break;
        case 'light':
            newColor = {
                h: (color.h + 5) % 360, // Slight hue shift
                s: Math.max(color.s - 0.05, 0.30),
                l: 0.60
            };
            break;
        case 'dark':
            newColor = {
                h: (color.h - 5) % 360, // Slight hue shift
                s: Math.min(color.s + 0.15, 0.60),
                l: 0.35
            };
            break;
        case 'complement':
            newColor = {
                h: (color.h + 137.5) % 360, // Golden angle
                s: Math.min(color.s + 0.05, 0.50),
                l: 0.50
            };
            break;
        case 'accent':
            newColor = {
                h: (color.h + 275) % 360, // Double golden angle
                s: Math.min(color.s + 0.10, 0.55),
                l: 0.55
            };
            break;
        default:
            return color;
    }

    return newColor;
};


export const convertPaletteToComplementDarkTheme = (palette) => {
    if (!palette) return;
    return {
        base: adjustColorForDarkTheme(palette.base),
        light: adjustColorForDarkTheme(palette.light),
        dark: adjustColorForDarkTheme(palette.dark),
        complement: adjustColorForDarkTheme(palette.complement),
        accent: adjustColorForDarkTheme(palette.accent),
    }
};


export const generateColorPalette = (color) => {
    if (!color) return;
    assertValueRange(color.h, 0, 359);
    assertValueRange(color.s, 0, 1);
    assertValueRange(color.l, 0, 1);

    const base = color;

    // Calculate golden ratio for more harmonious hue shifts
    const goldenAngle = 137.5;

    return {
        base: color,
        // Lighter variant with reduced saturation
        light: {
            h: base.h,
            s: Math.max(base.s - 0.15, 0.25),
            l: Math.min(base.l + 0.20, 0.80)
        },
        // Darker variant with slightly increased saturation
        dark: {
            h: base.h,
            s: Math.min(base.s + 0.10, 0.55),
            l: Math.max(base.l - 0.20, 0.35)
        },
        // Complement using golden angle for more interesting combinations
        complement: {
            h: (base.h + goldenAngle) % 360,
            s: Math.min(base.s + 0.05, 0.50),
            l: Math.min(base.l + 0.05, 0.70)
        },
        // Accent using another golden angle shift
        accent: {
            h: (base.h + goldenAngle * 2) % 360,
            s: Math.min(base.s + 0.10, 0.50),
            l: Math.max(base.l - 0.05, 0.45)
        }
    };
};

// export const generateColorPalette = (color) => {
//     if (!color) return;
//     assertValueRange(color.h, 0, 359);
//     assertValueRange(color.s, 0, 1);
//     assertValueRange(color.l, 0, 1);
//     const base = color;

//     return {
//         base: color,
//         light: { h: base.h, s: Math.max(base.s - 0.15, 0.30), l: Math.min(base.l + 0.25, 0.90) },
//         dark: { h: base.h, s: Math.min(base.s + 0.10, 0.90), l: Math.max(base.l - 0.25, 0.20) },
//         complement: { h: (base.h + 180) % 360, s: base.s, l: base.l },
//         accent: { h: (base.h + 90) % 360, s: Math.min(base.s + 0.05, 0.90), l: Math.min(base.l + 0.05, 0.85) }
//     }
// };

// see: https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_RGB_alternative
export const hslToRgb = (hslColor) => {
    if (!hslColor) return;
    const h = hslColor.h;
    const s = hslColor.s;
    const l = hslColor.l;
    const alpha = hslColor.a;
    assertValueRange(h, 0, 359);
    assertValueRange(s, 0, 1);
    assertValueRange(l, 0, 1);

    const k = (n) => {
        assertType(n, 'number');
        return (n + h / 30) % 12;
    }
    const a = s * Math.min(l, 1 - l);
    const f = (n) => {
        assertType(n, 'number');
        return l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
    };

    const r = Math.round(255 * f(0));
    const g = Math.round(255 * f(8));
    const b = Math.round(255 * f(4));

    return rgbToString(r, g, b, alpha);
};

const rgbToString = (r, g, b, a = 1) => {
    assertType(a, 'number');
    return `rgba(${r},${g},${b},${a})`;
};

