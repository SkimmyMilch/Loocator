import { ToiletLocation, Review, FilterState } from '../types';
import { INITIAL_TOILETS, INITIAL_REVIEWS } from '../data/initialToilets';
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';

const STORAGE_KEYS = {
  TOILETS: 'loolocator_toilets_v1',
  REVIEWS: 'loolocator_reviews_v1',
};

// Local storage caching helpers
export const getStoredToilets = (): ToiletLocation[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TOILETS);
    if (!raw) {
      return INITIAL_TOILETS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load toilets from local storage:', err);
    return INITIAL_TOILETS;
  }
};

export const saveToiletsToLocal = (toilets: ToiletLocation[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TOILETS, JSON.stringify(toilets));
  } catch (err) {
    console.error('Failed to save toilets to local storage:', err);
  }
};

export const getStoredReviews = (): Review[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    if (!raw) {
      return INITIAL_REVIEWS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load reviews from local storage:', err);
    return INITIAL_REVIEWS;
  }
};

export const saveReviewsToLocal = (reviews: Review[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  } catch (err) {
    console.error('Failed to save reviews to local storage:', err);
  }
};

// Seed Firestore with initial data if empty
const seedFirestoreIfEmpty = async () => {
  try {
    const toiletsSnap = await getDocs(collection(db, 'toilets'));
    if (toiletsSnap.empty) {
      console.log('Firestore toilets collection is empty. Seeding initial toilets & reviews...');
      const batch = writeBatch(db);
      
      INITIAL_TOILETS.forEach(t => {
        const ref = doc(db, 'toilets', t.id);
        batch.set(ref, t);
      });

      INITIAL_REVIEWS.forEach(r => {
        const ref = doc(db, 'reviews', r.id);
        batch.set(ref, r);
      });

      await batch.commit();
      console.log('Successfully seeded Firestore with initial dataset!');
    }
  } catch (err) {
    console.error('Error seeding Firestore:', err);
  }
};

// Subscribe to real-time Toilets collection from Firestore
export const subscribeToToilets = (onUpdate: (toilets: ToiletLocation[]) => void) => {
  seedFirestoreIfEmpty();

  const toiletsRef = collection(db, 'toilets');
  return onSnapshot(
    toiletsRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const items: ToiletLocation[] = snapshot.docs.map(doc => doc.data() as ToiletLocation);
        saveToiletsToLocal(items);
        onUpdate(items);
      } else {
        // If snapshot is empty, fallback to local/initial
        onUpdate(getStoredToilets());
      }
    },
    (error) => {
      console.warn('Firestore subscription error for toilets, falling back to local cache:', error);
      onUpdate(getStoredToilets());
    }
  );
};

// Subscribe to real-time Reviews collection from Firestore
export const subscribeToReviews = (onUpdate: (reviews: Review[]) => void) => {
  const reviewsRef = collection(db, 'reviews');
  return onSnapshot(
    reviewsRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const items: Review[] = snapshot.docs.map(doc => doc.data() as Review);
        saveReviewsToLocal(items);
        onUpdate(items);
      } else {
        onUpdate(getStoredReviews());
      }
    },
    (error) => {
      console.warn('Firestore subscription error for reviews, falling back to local cache:', error);
      onUpdate(getStoredReviews());
    }
  );
};

// Add new toilet location
export const addToiletLocation = async (
  newToilet: Omit<ToiletLocation, 'id' | 'createdAt' | 'updatedAt' | 'totalReviews' | 'ratingCleanliness' | 'ratingAccessibility'>
): Promise<ToiletLocation> => {
  const now = new Date().toISOString();
  const id = `loo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  
  const toilet: ToiletLocation = {
    ...newToilet,
    id,
    ratingCleanliness: 4.0, // default starting average
    ratingAccessibility: 4.0,
    totalReviews: 0,
    createdAt: now,
    updatedAt: now,
  };

  // Write to Firestore first
  try {
    await setDoc(doc(db, 'toilets', id), toilet);
  } catch (err) {
    console.error('Failed to save new toilet to Firestore:', err);
  }

  // Fallback update local storage
  const toilets = getStoredToilets();
  const updatedToilets = [toilet, ...toilets];
  saveToiletsToLocal(updatedToilets);

  return toilet;
};

// Add review to toilet and update toilet ratings
export const addReviewToToilet = async (
  reviewData: Omit<Review, 'id' | 'createdAt' | 'helpfulCount'>,
  currentToilets: ToiletLocation[],
  currentReviews: Review[]
): Promise<{ review: Review; updatedToilet: ToiletLocation }> => {
  const now = new Date().toISOString();
  const reviewId = `rev-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const review: Review = {
    ...reviewData,
    id: reviewId,
    createdAt: now,
    helpfulCount: 0,
  };

  const updatedReviews = [review, ...currentReviews];

  // Recalculate target toilet ratings
  const toiletReviews = updatedReviews.filter(r => r.toiletId === reviewData.toiletId);
  const sumCleanliness = toiletReviews.reduce((acc, r) => acc + r.ratingCleanliness, 0);
  const sumAccessibility = toiletReviews.reduce((acc, r) => acc + r.ratingAccessibility, 0);

  const maleReviews = toiletReviews.filter(r => r.genderSection === 'Male');
  const femaleReviews = toiletReviews.filter(r => r.genderSection === 'Female');

  const targetToilet = currentToilets.find(t => t.id === reviewData.toiletId);
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

  // Write review and updated toilet to Firestore
  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'reviews', reviewId), review);
    batch.set(doc(db, 'toilets', updatedToilet.id), updatedToilet);
    await batch.commit();
  } catch (err) {
    console.error('Failed to sync review & toilet rating to Firestore:', err);
  }

  // Update local storage
  saveReviewsToLocal(updatedReviews);
  const updatedToiletsList = currentToilets.map(t => t.id === updatedToilet.id ? updatedToilet : t);
  saveToiletsToLocal(updatedToiletsList);

  return { review, updatedToilet };
};

// Admin Action: Verify or Unverify Toilet
export const toggleAdminVerifyToilet = async (
  toiletId: string,
  isVerified: boolean,
  currentToilets: ToiletLocation[],
  adminNote?: string
): Promise<ToiletLocation> => {
  const target = currentToilets.find(t => t.id === toiletId);
  if (!target) {
    throw new Error('Toilet not found');
  }

  const now = new Date().toISOString();
  const updatedToilet: ToiletLocation = {
    ...target,
    isVerified,
    verifiedAt: isVerified ? now : undefined,
    verifiedBy: isVerified ? 'LooLocator Official Admin' : undefined,
    adminNote: adminNote !== undefined ? adminNote : target.adminNote,
    updatedAt: now,
  };

  try {
    await updateDoc(doc(db, 'toilets', toiletId), {
      isVerified,
      verifiedAt: isVerified ? now : null,
      verifiedBy: isVerified ? 'LooLocator Official Admin' : null,
      adminNote: adminNote !== undefined ? adminNote : (target.adminNote || null),
      updatedAt: now,
    });
  } catch (err) {
    console.error('Failed to update admin verification in Firestore:', err);
  }

  const updatedToilets = currentToilets.map(t => t.id === toiletId ? updatedToilet : t);
  saveToiletsToLocal(updatedToilets);

  return updatedToilet;
};

// Helper: Calculate distance between two lat/lng points in km (Haversine formula)
export const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  if (
    typeof lat1 !== 'number' || typeof lon1 !== 'number' ||
    typeof lat2 !== 'number' || typeof lon2 !== 'number' ||
    isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)
  ) {
    return 0;
  }
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return isNaN(dist) ? 0 : Number(dist.toFixed(2));
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
    if (userLat !== undefined && userLng !== undefined && !isNaN(userLat) && !isNaN(userLng)) {
      const distA = (a.coordinates && !isNaN(a.coordinates.lat) && !isNaN(a.coordinates.lng))
        ? calculateDistanceKm(userLat, userLng, a.coordinates.lat, a.coordinates.lng)
        : 9999;
      const distB = (b.coordinates && !isNaN(b.coordinates.lat) && !isNaN(b.coordinates.lng))
        ? calculateDistanceKm(userLat, userLng, b.coordinates.lat, b.coordinates.lng)
        : 9999;
      return distA - distB;
    }
    return 0;
  });
};

export const resetStorageToDefaults = async (): Promise<void> => {
  saveToiletsToLocal(INITIAL_TOILETS);
  saveReviewsToLocal(INITIAL_REVIEWS);

  try {
    const batch = writeBatch(db);
    INITIAL_TOILETS.forEach(t => {
      batch.set(doc(db, 'toilets', t.id), t);
    });
    INITIAL_REVIEWS.forEach(r => {
      batch.set(doc(db, 'reviews', r.id), r);
    });
    await batch.commit();
  } catch (err) {
    console.error('Failed to reset Firestore to defaults:', err);
  }
};
