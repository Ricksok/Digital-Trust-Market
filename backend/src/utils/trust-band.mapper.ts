/**
 * Trust Band Mapper
 * Maps between internal trust bands (A-D) and FRD trust bands (T0-T4)
 */

export type InternalTrustBand = 'A' | 'B' | 'C' | 'D';
export type FRDTrustBand = 'T0' | 'T1' | 'T2' | 'T3' | 'T4';

/**
 * Map internal trust band (A-D) to FRD trust band (T0-T4)
 */
export function toFRDBand(internal: InternalTrustBand | string | null | undefined): FRDTrustBand {
  if (!internal) return 'T0';
  
  const mapping: Record<string, FRDTrustBand> = {
    'A': 'T4',
    'B': 'T3',
    'C': 'T2',
    'D': 'T1',
  };
  
  return mapping[internal.toUpperCase()] || 'T0';
}

/**
 * Map FRD trust band (T0-T4) to internal trust band (A-D)
 */
export function toInternalBand(frd: FRDTrustBand | string | null | undefined): InternalTrustBand {
  if (!frd) return 'D';
  
  const mapping: Record<string, InternalTrustBand> = {
    'T4': 'A',
    'T3': 'B',
    'T2': 'C',
    'T1': 'D',
    'T0': 'D',
  };
  
  return mapping[frd.toUpperCase()] || 'D';
}

/**
 * Get trust band description
 */
export function getTrustBandDescription(band: string): string {
  const descriptions: Record<string, string> = {
    'A': 'Preferred - Highest trust level',
    'B': 'Trusted - High trust level',
    'C': 'Reliable - Medium trust level',
    'D': 'Verified - Basic trust level',
    'T4': 'Preferred - Highest trust level',
    'T3': 'Trusted - High trust level',
    'T2': 'Reliable - Medium trust level',
    'T1': 'Verified - Basic trust level',
    'T0': 'Unverified - No trust level',
  };
  
  return descriptions[band.toUpperCase()] || 'Unknown trust level';
}

/**
 * Check if trust band is valid
 */
export function isValidTrustBand(band: string): boolean {
  const validBands = ['A', 'B', 'C', 'D', 'T0', 'T1', 'T2', 'T3', 'T4'];
  return validBands.includes(band.toUpperCase());
}


