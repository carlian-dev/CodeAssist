import * as React from 'react';

export type BlinkMood = 'happy' | 'thinking' | 'celebrate' | 'oops';

export interface BlinkProps extends Omit<React.SVGProps<SVGSVGElement>, 'ref'> {
  /** happy = idle/waving, thinking = loading, celebrate = success, oops = error */
  mood?: BlinkMood;
  /** 'full' = whole body, 'face' = square crop for avatars and buttons */
  variant?: 'full' | 'face';
  /** rendered width in px (height follows the aspect ratio) */
  size?: number;
  /** set false for a static image */
  animated?: boolean;
  /** accessible label */
  title?: string;
}

export const BLINK_MOODS: BlinkMood[];
declare const Blink: React.FC<BlinkProps>;
export default Blink;
