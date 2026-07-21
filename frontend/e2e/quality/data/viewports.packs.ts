/**
 * Viewport packs for Sprint 07 responsive matrix (product breakpoints 640/768/1024).
 */
export type ViewportPack = {
  id: 'mobile' | 'tablet' | 'desktop';
  label: string;
  width: number;
  height: number;
  /** Shell `.portal-nav` is display:flex only at min-width 768px. */
  shellNavVisible: boolean;
};

export const VIEWPORT_PACKS: readonly ViewportPack[] = [
  {
    id: 'mobile',
    label: 'Mobile',
    width: 390,
    height: 844,
    shellNavVisible: false,
  },
  {
    id: 'tablet',
    label: 'Tablet',
    width: 820,
    height: 1180,
    shellNavVisible: true,
  },
  {
    id: 'desktop',
    label: 'Desktop',
    width: 1280,
    height: 720,
    shellNavVisible: true,
  },
] as const;

export const DESKTOP = VIEWPORT_PACKS.find((v) => v.id === 'desktop')!;
export const MOBILE = VIEWPORT_PACKS.find((v) => v.id === 'mobile')!;
