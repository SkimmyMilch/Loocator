import { BidetType, ClosetType, SoapStatus, WetDryType } from '../types';

export const getBidetLabel = (type: BidetType): { label: string; desc: string } => {
  switch (type) {
    case 'washlet':
      return { label: 'Electronic Washlet', desc: 'Auto-bidet with seat warmer & dryer' };
    case 'jet_spray':
      return { label: 'Jet Spray Hose', desc: 'Handheld jet washer with strong spray' };
    case 'gayung':
      return { label: 'Water Pitcher / Gayung', desc: 'Traditional water bucket & ladle' };
    case 'none':
      return { label: 'No Bidet', desc: 'Paper / Dry wipes only' };
  }
};

export const getClosetLabel = (type: ClosetType): { label: string; desc: string } => {
  switch (type) {
    case 'duduk':
      return { label: 'Sitting (Duduk)', desc: 'Standard western sitting toilet bowl' };
    case 'jongkok':
      return { label: 'Squatting (Jongkok)', desc: 'Traditional squatting toilet stall' };
    case 'both':
      return { label: 'Sitting & Squatting', desc: 'Both Duduk & Jongkok stalls available' };
  }
};

export const getSoapLabel = (type: SoapStatus): { label: string; color: string } => {
  switch (type) {
    case 'always':
      return { label: 'Soap Stocked', color: 'text-black bg-yellow-400 border-2 border-black' };
    case 'sanitizer':
      return { label: 'Sanitizer Only', color: 'text-black bg-blue-100 border-2 border-black' };
    case 'sometimes':
      return { label: 'Often Empty', color: 'text-black bg-amber-200 border-2 border-black' };
    case 'none':
      return { label: 'No Soap', color: 'text-white bg-red-600 border-2 border-black' };
  }
};

export const getWetDryLabel = (type: WetDryType): { label: string; color: string } => {
  switch (type) {
    case 'dry':
      return { label: 'Dry Toilet', color: 'text-black bg-zinc-200 border-2 border-black' };
    case 'wet':
      return { label: 'Wet Floor', color: 'text-black bg-blue-200 border-2 border-black' };
  }
};

export const getCleanlinessColor = (rating: number): string => {
  if (rating >= 4.5) return 'bg-yellow-400 text-black border-2 border-black';
  if (rating >= 4.0) return 'bg-black text-white border-2 border-black';
  if (rating >= 3.0) return 'bg-zinc-200 text-black border-2 border-black';
  return 'bg-red-500 text-white border-2 border-black';
};

export const getCleanlinessBadge = (rating: number): { text: string; bg: string; border: string; textCol: string } => {
  if (rating >= 4.5) {
    return { text: 'Pristine Clean', bg: 'bg-yellow-400', border: 'border-black', textCol: 'text-black' };
  }
  if (rating >= 4.0) {
    return { text: 'Very Clean', bg: 'bg-black', border: 'border-black', textCol: 'text-white' };
  }
  if (rating >= 3.0) {
    return { text: 'Average Clean', bg: 'bg-zinc-200', border: 'border-black', textCol: 'text-black' };
  }
  return { text: 'Needs Attention', bg: 'bg-red-500', border: 'border-black', textCol: 'text-white' };
};

