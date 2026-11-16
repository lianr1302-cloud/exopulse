export interface SpherExBand {
  id: number;
  label: string;
  wavelength_um: number;
}

export const SPHEREX_MIN_BAND = 1;
export const SPHEREX_MAX_BAND = 102;

export function wavelengthUmForSpherexBand(bandId: number): number {
  const channel = Math.min(SPHEREX_MAX_BAND, Math.max(SPHEREX_MIN_BAND, Math.round(bandId)));
  return 0.75 + ((channel - 1) / (SPHEREX_MAX_BAND - 1)) * (5.0 - 0.75);
}

export function bandIdFromWavelengthUm(wavelength_um: number): number {
  const t = (wavelength_um - 0.75) / (5.0 - 0.75);
  return Math.round(1 + t * (SPHEREX_MAX_BAND - 1));
}

export function getSpherExBandFromChannel(bandId: number): SpherExBand {
  const channel = Math.min(SPHEREX_MAX_BAND, Math.max(SPHEREX_MIN_BAND, Math.round(bandId)));
  return {
    id: channel,
    label: `Band ${channel}`,
    wavelength_um: wavelengthUmForSpherexBand(channel),
  };
}

export const SPHEREX_ANCHOR_BANDS = [1, 25, 50, 102] as const;