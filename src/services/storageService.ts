import { ToiletLocation, Review, FilterState, BidetType, ClosetType, SoapStatus, WetDryType } from '../types';
import { INITIAL_TOILETS, INITIAL_REVIEWS } from '../data/initialToilets';

const STORAGE_KEYS = {
  TOILETS: 'loolocator_toilets_v1',
  REVIEWS: 'loolocator_reviews_v1',
  ADMIN_AUTH: 'loolocator_admin_auth_v1',
};

export const getStoredToilets = (): ToiletLocation[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TOILETS);
    if (!raw) {
      saveToilets(INITIAL_TOILETS);
      return INITIAL_TOILETS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load toilets from storage:', err);
    return INITIAL_TOILETS;
  }
};

export const saveToilets = (toilets: ToiletLocation[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TOILETS, JSON.stringify(toilets));
  } catch (err) {
    console.error('Failed to save toilets:', err);
  }
};

export const getStoredReviews = (): Review[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    if (!raw) {
      saveReviews(INITIAL_REVIEWS);
      return INITIAL_REVIEWS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load reviews from storage:', err);
    return INITIAL_REVIEWS;
  }
};

export const saveReviews = (reviews: Review[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  } catch (err) {
    console.error('Failed to save reviews:', err);
  }
};

export const addToiletLocation = (newToilet: Omit<ToiletLocation, 'id' | 'createdAt' | 'updatedAt' | 'totalReviews' | 'ratingCleanliness' | 'ratingAccessibility'>): ToiletLocation => {
  const toilets = getStoredToilets();
  const now = new Date().toISOString();
  
  const toilet: ToiletLocation = {
    ...newToilet,
    id: `loo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    ratingCleanliness: 4.0, // default starting average
    ratingAccessibility: 4.0,
    totalReviews: 0,
    createdAt: now,
    updatedAt: now,
  };

  const updatedToilets = [toilet, ...toilets];
  saveToilets(updatedToilets);
  return toilet;
};

export const addReviewToToilet = (reviewData: Omit<Review, 'id' | 'createdAt' | 'helpfulCount'>): { review: Review; updatedToilet: ToiletLocation } => {
  const reviews = getStoredReviews();
  const toilets = getStoredToilets();

  const now = new Date().toISOString();
  const review: Review = {
    ...reviewData,
    id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    createdAt: now,
    helpfulCount: 0,
  };

  const updatedReviews = [review, ...reviews];
  saveReviews(updatedReviews);

  // Recalculate toilet rating averages
  const toiletReviews = updatedReviews.filter(r => r.toiletId === reviewData.toiletId);
  const sumCleanliness = toiletReviews.reduce((acc, r) => acc + r.ratingCleanliness, 0);
  const sumAccessibility = toiletReviews.reduce((acc, r) => acc + r.ratingAccessibility, 0);

  const maleReviews = toiletReviews.filter(r => r.genderSection === 'Male');
  const femaleReviews = toiletReviews.filter(r => r.genderSection === 'Female');

  const targetToilet = toilets.find(t => t.id === reviewData.toiletId);
  if (!targetToilet) {
    throw new Error('Toilet not found');
  }

  const updatedMaleRating = maleReviews.length > 0
    ? Number((maleReviews.reduce((acc, r) => acc + r.ratingCleanliness, 0) / maleReviews.length).toFixed(1))
    : targetToilet.ratingMale;

  const updatedFemaleRating = femaleReviews.length > 0
    ? Number((femaleReviews.reduce((acc, r) => acc + r.ratingCleanliness, 0) / femaleReviews.length).toFixed(1))
    : targetToilet.ratingFemale;

  const updatedToilet: ToiletLocation = {
    ...targetToilet,
    totalReviews: toiletReviews.length,
    ratingCleanliness: Number((sumCleanliness / toiletReviews.length).toFixed(1)),
    ratingAccessibility: Number((sumAccessibility / toiletReviews.length).toFixed(1)),
    ratingMale: updatedMaleRating,
    ratingFemale: updatedFemaleRating,
    updatedAt: now,
  };

  const updatedToiletsList = toilets.map(t => t.id === updatedToilet.id ? updatedToilet : t);
  saveToilets(updatedToiletsList);

  return { review, updatedToilet };
};

// Admin Action: Verify or Unverify Toilet
export const toggleAdminVerifyToilet = (toiletId: string, isVerified: boolean, adminNote?: string): ToiletLocation => {
  const toilets = getStoredToilets();
  const targetIndex = toilets.findIndex(t => t.id === toiletId);
  
  if (targetIndex === -1) {
    throw new Error('Toilet not found');
  }

  const now = new Date().toISOString();
  const updatedToilet: ToiletLocation = {
    ...toilets[targetIndex],
    isVerified,
    verifiedAt: isVerified ? now : undefined,
    verifiedBy: isVerified ? 'LooLocator Official Admin' : undefined,
    adminNote: adminNote !== undefined ? adminNote : toilets[targetIndex].adminNote,
    updatedAt: now,
  };

  toilets[targetIndex] = updatedToilet;
  saveToilets(toilets);
  return updatedToilet;
};

// Helper: Calculate distance between two lat/lng points in km (Haversine formula)
export const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

export const filterToilets = (toilets: ToiletLocation[], filters: FilterState, userLat?: number, userLng?: number): ToiletLocation[] => {
  return toilets.filter(toilet => {
    // Search query check (name, building, floor, wing, placeType)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchName = toilet.name.toLowerCase().includes(q);
      const matchBuilding = toilet.buildingName.toLowerCase().includes(q);
      const matchFloor = toilet.floor.toLowerCase().includes(q);
      const matchWing = toilet.unitWing.toLowerCase().includes(q);
      const matchType = toilet.placeType.toLowerCase().includes(q);
      if (!matchName && !matchBuilding && !matchFloor && !matchWing && !matchType) {
        return false;
      }
    }

    // Gender Filter & Gender-Specific Rating Check
    if (filters.genderFilter && filters.genderFilter !== 'any') {
      if (filters.genderFilter === 'Female') {
        const hasFemale = toilet.genderTypes.includes('Female') || toilet.ratingFemale !== undefined;
        if (!hasFemale) return false;
        if (filters.minCleanliness > 0) {
          const rating = toilet.ratingFemale ?? toilet.ratingCleanliness;
          if (rating < filters.minCleanliness) return false;
        }
      } else if (filters.genderFilter === 'Male') {
        const hasMale = toilet.genderTypes.includes('Male') || toilet.ratingMale !== undefined;
        if (!hasMale) return false;
        if (filters.minCleanliness > 0) {
          const rating = toilet.ratingMale ?? toilet.ratingCleanliness;
          if (rating < filters.minCleanliness) return false;
        }
      } else if (filters.genderFilter === 'Neutral/Accessible') {
        const hasNeutral = toilet.genderTypes.some(g => g.includes('Unisex') || g.includes('Family') || g.includes('Accessible')) || toilet.ratingUnisex !== undefined || toilet.accessibilityFeatures.wheelchairStall;
        if (!hasNeutral) return false;
        if (filters.minCleanliness > 0) {
          const rating = toilet.ratingUnisex ?? toilet.ratingCleanliness;
          if (rating < filters.minCleanliness) return false;
        }
      }
    } else {
      // Min Cleanliness (Overall)
      if (filters.minCleanliness > 0 && toilet.ratingCleanliness < filters.minCleanliness) {
        return false;
      }
    }

    // Min Accessibility
    if (filters.minAccessibility > 0 && toilet.ratingAccessibility < filters.minAccessibility) {
      return false;
    }

    // Bidet Type
    if (filters.bidetType !== 'any' && toilet.bidetType !== filters.bidetType) {
      return false;
    }

    // Closet Type
    if (filters.closetType !== 'any') {
      if (filters.closetType === 'both') {
        if (toilet.closetType !== 'both') return false;
      } else {
        if (toilet.closetType !== filters.closetType && toilet.closetType !== 'both') return false;
      }
    }

    // Wet/Dry
    if (filters.wetDry !== 'any' && toilet.wetDry !== filters.wetDry) {
      return false;
    }

    // Soap Status
    if (filters.soapStatus !== 'any') {
      if (filters.soapStatus === 'always' && toilet.soapStatus !== 'always') return false;
      if (filters.soapStatus === 'none' && toilet.soapStatus !== 'none') return false;
    }

    // Is Paid
    if (filters.isPaid === 'free' && toilet.isPaid) return false;
    if (filters.isPaid === 'paid' && !toilet.isPaid) return false;

    // Verified Only
    if (filters.isVerifiedOnly && !toilet.isVerified) return false;

    // Place Type
    if (filters.placeType !== 'any' && toilet.placeType !== filters.placeType) return false;

    // Wheelchair
    if (filters.wheelchairOnly && !toilet.accessibilityFeatures.wheelchairStall) return false;

    // Baby changing
    if (filters.hasBabyChanging && !toilet.hasBabyChanging) return false;

    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'cleanliness') {
      return b.ratingCleanliness - a.ratingCleanliness;
    }
    if (filters.sortBy === 'accessibility') {
      return b.ratingAccessibility - a.ratingAccessibility;
    }
    if (filters.sortBy === 'reviews') {
      return b.totalReviews - a.totalReviews;
    }
    if (filters.sortBy === 'verified') {
      return (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0);
    }
    if (filters.sortBy === 'price') {
      return (a.isPaid ? 1 : 0) - (b.isPaid ? 1 : 0);
    }
    // Default or distance sort
    if (userLat !== undefined && userLng !== undefined) {
      const distA = calculateDistanceKm(userLat, userLng, a.coordinates.lat, a.coordinates.lng);
      const distB = calculateDistanceKm(userLat, userLng, b.coordinates.lat, b.coordinates.lng);
      return distA - distB;
    }
    return 0;
  });
};

export const resetStorageToDefaults = (): void => {
  localStorage.setItem(STORAGE_KEYS.TOILETS, JSON.stringify(INITIAL_TOILETS));
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
};
