import {
  FileText,
  Image,
  Video,
  Music2,
  Type,
  Square,
  QrCode,
  type LucideIcon,
} from 'lucide-react';

/**
 * Single source of truth for the icon + colour + label of each content/step
 * type, used by the control panel and the scenario step list.
 */
export type StepStyleType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'heading'
  | 'blank'
  | 'qrcode';

interface StepStyle {
  icon: LucideIcon;
  /** Tailwind text + bg classes */
  color: string;
  label: string;
}

export const STEP_STYLES: Record<StepStyleType, StepStyle> = {
  text: { icon: FileText, color: 'text-emerald-400 bg-emerald-500/10', label: 'Tekst' },
  image: { icon: Image, color: 'text-purple-400 bg-purple-500/10', label: 'Obraz' },
  video: { icon: Video, color: 'text-pink-400 bg-pink-500/10', label: 'Wideo' },
  audio: { icon: Music2, color: 'text-amber-400 bg-amber-500/10', label: 'Audio' },
  heading: { icon: Type, color: 'text-blue-400 bg-blue-500/10', label: 'Nagłówek' },
  blank: { icon: Square, color: 'text-gray-400 bg-gray-500/10', label: 'Pusty slajd' },
  qrcode: { icon: QrCode, color: 'text-cyan-400 bg-cyan-500/10', label: 'Kod QR' },
};

export function getStepStyle(type: StepStyleType): StepStyle {
  return STEP_STYLES[type];
}
