export type BidetType = 'jet_spray' | 'washlet' | 'gayung' | 'none';

export type ClosetType = 'duduk' | 'jongkok' | 'both';

export type WetDryType = 'dry' | 'wet';

export type SoapStatus = 'always' | 'sanitizer' | 'sometimes' | 'none';

export type MapTileStyle = 'standard' | 'satellite' | 'dark' | 'outdoors';

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface Review {
  id: string;
  toiletId: string;
  genderSection?: 'Female' | 'Male' | 'Unisex' | 'Family';
  ratingCleanliness: number; // 1 to 5
  ratingAccessibility: number; // 1 to 5
  bidetType: BidetType;
  closetType: ClosetType;
  soapStatus: SoapStatus;
  isWet: boolean;
  comment: string;
  createdAt: string; // ISO string
  photos?: string[];
  helpfulCount: number;
}

export interface ToiletLocation {
  id: string;
  name: string; // e.g. "Grand Indonesia West Mall Executive Loo"
  buildingName: string; // e.g. "Grand Indonesia Mall"
  floor: string; // e.g. "3rd Floor (L3)"
  unitWing: string; // e.g. "West Wing, near Elevator 4, behind Zara"
  placeType: 'Shopping Mall' | 'Transit Station' | 'Gas Station' | 'Office Building' | 'Public Park' | 'Restaurant & Cafe' | 'Hospital' | 'Other';
  
  coordinates: LocationCoordinates;
  
  // Rating Averages
  ratingCleanliness: number; // 1 - 5 average overall
  ratingMale?: number; // 1 - 5 average for male section
  ratingFemale?: number; // 1 - 5 average for female section
  ratingUnisex?: number; // 1 - 5 average for unisex section
  ratingAccessibility: number; // 1 - 5 average
  totalReviews: number;
  
  // Toilet Specs & Amenities
  bidetType: BidetType;
  closetType: ClosetType;
  wetDry: WetDryType;
  soapStatus: SoapStatus;
  
  // Fee / Pricing
  isPaid: boolean;
  costText?: string; // e.g. "Rp 2,000" or "$0.50"
  paymentMethods?: string[]; // e.g. ["Cash", "QRIS", "Card"]
  
  // Accessibility Features
  accessibilityFeatures: {
    wheelchairStall: boolean;
    grabBars: boolean;
    stepFreeAccess: boolean;
    elevatorNearby: boolean;
    wideDoorway: boolean;
    brailleSignage?: boolean;
  };

  // Facilities
  hasBabyChanging: boolean;
  hasTissuePaper: boolean;
  hasHandDryer: boolean;
  genderTypes: ('Male' | 'Female' | 'Unisex' | 'Family / Accessible')[];

  // Admin Verification
  isVerified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  adminNote?: string;

  // Visuals
  coverImage: string;
  images: string[];
  
  // Directions / Navigation hint
  walkingDirectionsHint?: string;

  createdAt: string;
  updatedAt: string;
}

export interface FilterState {
  searchQuery: string;
  genderFilter: 'any' | 'Female' | 'Male' | 'Neutral/Accessible';
  minCleanliness: number; // 0 means any
  minAccessibility: number; // 0 means any
  bidetType: BidetType | 'any';
  closetType: ClosetType | 'any';
  wetDry: WetDryType | 'any';
  soapStatus: SoapStatus | 'any';
  isPaid: 'any' | 'free' | 'paid';
  isVerifiedOnly: boolean;
  placeType: string | 'any';
  wheelchairOnly: boolean;
  hasBabyChanging: boolean;
  sortBy: 'distance' | 'cleanliness' | 'accessibility' | 'reviews' | 'price' | 'verified';
}

export interface UserLocation {
  lat: number;
  lng: number;
  addressName?: string;
}
