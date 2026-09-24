import { DM_Sans, Fraunces } from 'next/font/google';

export const bodyFont = DM_Sans({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
export const displayFont = Fraunces({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
export const brandFonts = `${bodyFont.variable} ${displayFont.variable} ${bodyFont.className}`;
