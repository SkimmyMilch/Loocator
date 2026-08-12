import React, { useState, useEffect } from 'react';
import { ToiletLocation, Review, FilterState, MapTileStyle, UserLocation } from './types';
import {
  getStoredToilets,
  getStoredReviews,
  subscribeToToilets,
  subscribeToReviews,
  addToiletLocation,
  addReviewToToilet,
  toggleAdminVerifyToilet,
  deleteToiletStation,
  filterToilets,
  resetStorageToDefaults,
} from './services/storageService';
import { MapView } from './components/MapView';
import { Navbar } from './components/Navbar';
import { ToiletCard } from './components/ToiletCard';
import { ToiletDetailModal } from './components/ToiletDetailModal';
import { AddReviewModal } from './components/AddReviewModal';
import { AddToiletModal } from './components/AddToiletModal';
import { FilterDrawer } from './components/FilterDrawer';
import { AdminPanelModal } from './components/AdminPanelModal';
import { DirectionsModal } from './components/DirectionsModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import {
  ListFilter, PanelLeftClose, PanelLeft, MapPin, Sparkles, Navigation, Plus, ShieldCheck, RefreshCw
} from 'lucide-react';

export default function App() {
  const [toilets, setToilets] = useState<ToiletLocation[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    genderFilter: 'any',
    minCleanliness: 0,
    minAccessibility: 0,
    bidetType: 'any',
    closetType: 'any',
    wetDry: 'any',
    soapStatus: 'any',
    isPaid: 'any',
    isVerifiedOnly: false,
    placeType: 'any',
    wheelchairOnly: false,
    hasBabyChanging: false,
    sortBy: 'distance',
  });

  // Map & App States
  const [selectedToiletId, setSelectedToiletId] = useState<string | null>(null);
  const [tileStyle, setTileStyle] = useState<MapTileStyle>('standard');
  const [isAddPinMode, setIsAddPinMode] = useState<boolean>(false);
  const [tempDroppedPinCoords, setTempDroppedPinCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Admin Mode
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('loo_is_admin_authenticated') === 'true';
  });
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);

  // User Geolocation
  const [userLocation, setUserLocation] = useState<UserLocation | null>({
    lat: -6.1953,
    lng: 106.8208,
    addressName: 'Grand Indonesia Area, Jakarta',
  });

  // Active Route
  const [activeRouteDestination, setActiveRouteDestination] = useState<ToiletLocation | null>(null);

  // Modals & Drawers - Open straight to map (sidebar closed by default)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);
  const [isAddToiletModalOpen, setIsAddToiletModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState<boolean>(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  const [isDirectionsModalOpen, setIsDirectionsModalOpen] = useState<boolean>(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>('Tap any station pin for details.');

  // Load Data & Subscribe to Firestore Real-time Updates on Mount
  useEffect(() => {
    // Initial local cache load
    setToilets(getStoredToilets());
    setReviews(getStoredReviews());

    // Subscribe to Firestore changes across all devices
    const unsubscribeToilets = subscribeToToilets((updatedToilets) => {
      setToilets(updatedToilets);
    });

    const unsubscribeReviews = subscribeToReviews((updatedReviews) => {
      setReviews(updatedReviews);
    });

    return () => {
      unsubscribeToilets();
      unsubscribeReviews();
    };
  }, []);

  // Auto-hide Toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Handle Geolocation
  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      setToastMessage('🛰️ Requesting device GPS location...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos?.coords?.latitude;
          const lng = pos?.coords?.longitude;
          if (
            typeof lat === 'number' &&
            !isNaN(lat) &&
            isFinite(lat) &&
            typeof lng === 'number' &&
            !isNaN(lng) &&
            isFinite(lng)
          ) {
            setUserLocation({
              lat,
              lng,
              addressName: 'Your Device Location',
            });
            setToastMessage(`📍 Located your device at (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          } else {
            setToastMessage('⚠️ Device GPS returned invalid coordinates.');
          }
        },
        (err) => {
          console.warn('Geolocation error:', err);
          let errMsg = 'Location permission denied or unavailable.';
          if (err.code === err.PERMISSION_DENIED) {
            errMsg = 'Location permission denied. Please allow location access in browser.';
          } else if (err.code === err.TIMEOUT) {
            errMsg = 'Location request timed out. Please try again.';
          }
          setToastMessage(`⚠️ ${errMsg}`);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      setToastMessage('⚠️ Geolocation is not supported by your browser.');
    }
  };

  // Auto-detect device location on mount if allowed
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos?.coords?.latitude;
          const lng = pos?.coords?.longitude;
          if (
            typeof lat === 'number' &&
            !isNaN(lat) &&
            isFinite(lat) &&
            typeof lng === 'number' &&
            !isNaN(lng) &&
            isFinite(lng)
          ) {
            setUserLocation({
              lat,
              lng,
              addressName: 'Your Device Location',
            });
          }
        },
        (err) => {
          console.log('Initial location permission prompt response:', err.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);

  // Filter Toilets
  const filteredToilets = filterToilets(
    toilets,
    filters,
    userLocation?.lat,
    userLocation?.lng
  );

  const selectedToilet = toilets.find((t) => t.id === selectedToiletId) || toilets[0] || null;

  // Handlers
  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      genderFilter: 'any',
      minCleanliness: 0,
      minAccessibility: 0,
      bidetType: 'any',
      closetType: 'any',
      wetDry: 'any',
      soapStatus: 'any',
      isPaid: 'any',
      isVerifiedOnly: false,
      placeType: 'any',
      wheelchairOnly: false,
      hasBabyChanging: false,
      sortBy: 'distance',
    });
    setToastMessage('Reset all filters to defaults.');
  };

  const handleSelectToilet = (toilet: ToiletLocation) => {
    setSelectedToiletId(toilet.id);
    setIsDetailModalOpen(true);
  };

  const handlePinDroppedOnMap = (coords: { lat: number; lng: number }) => {
    setTempDroppedPinCoords(coords);
    setIsAddToiletModalOpen(true);
    setIsAddPinMode(false);
  };

  const handleCreateToilet = async (
    data: Omit<ToiletLocation, 'id' | 'createdAt' | 'updatedAt' | 'totalReviews' | 'ratingCleanliness' | 'ratingAccessibility'>
  ) => {
    const newToilet = await addToiletLocation(data);
    setSelectedToiletId(newToilet.id);
    setIsDetailModalOpen(true);
    setToastMessage(`✨ Added toilet location: ${newToilet.name}`);
  };

  const handleCreateReview = async (
    reviewData: Omit<Review, 'id' | 'createdAt' | 'helpfulCount'>
  ) => {
    const { review, updatedToilet } = await addReviewToToilet(reviewData, toilets, reviews);
    setToastMessage(`💬 Review published for ${updatedToilet.name}! Ratings updated.`);
  };

  const handleAdminToggleVerify = async (toiletId: string, isVerified: boolean, note?: string) => {
    const updated = await toggleAdminVerifyToilet(toiletId, isVerified, toilets, note);
    setToastMessage(
      isVerified
        ? `✔️ Verified Badge granted to ${updated.name}!`
        : `Revoked Verified Badge from ${updated.name}.`
    );
  };

  const handleDeleteToiletStation = async (toiletId: string) => {
    const deletedToilet = toilets.find((t) => t.id === toiletId);
    const updatedToilets = await deleteToiletStation(toiletId, toilets);
    setToilets(updatedToilets);
    if (selectedToiletId === toiletId) {
      setSelectedToiletId(null);
      setIsDetailModalOpen(false);
    }
    setToastMessage(`🗑️ Station "${deletedToilet?.name || 'Toilet'}" deleted.`);
  };

  const handleGetDirections = (toilet: ToiletLocation) => {
    setActiveRouteDestination(toilet);
    setIsDirectionsModalOpen(true);
    setToastMessage(`🚗 Calculating walking route to ${toilet.name}...`);
  };

  const handleResetDemoData = async () => {
    await resetStorageToDefaults();
    setSelectedToiletId('loo-gi-l3-west');
    setToastMessage('🔄 Demo data reset to initial benchmark toilets.');
  };

  return (
    <div className="relative w-full h-[100dvh] max-w-full overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      
      {/* Top Navbar */}
      <Navbar
        filters={filters}
        onFilterChange={handleFilterChange}
        onOpenFilterDrawer={() => setIsFilterDrawerOpen(true)}
        onOpenAddToiletModal={() => {
          setTempDroppedPinCoords(userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null);
          setIsAddToiletModalOpen(true);
        }}
        isAddPinMode={isAddPinMode}
        onToggleAddPinMode={() => {
          setIsAddPinMode(!isAddPinMode);
          if (!isAddPinMode) {
            setToastMessage('📍 Drop Pin Mode enabled! Tap anywhere on the map.');
          }
        }}
        tileStyle={tileStyle}
        onChangeTileStyle={setTileStyle}
        isAdmin={isAdmin}
        onToggleAdmin={() => {
          if (isAdmin) {
            setIsAdmin(false);
            localStorage.removeItem('loo_is_admin_authenticated');
            setToastMessage('🔒 Admin mode logged out. Switched to User Mode.');
          } else {
            setIsAdminAuthModalOpen(true);
          }
        }}
        onLocateMe={handleLocateMe}
        totalResultsCount={filteredToilets.length}
        onOpenAdminPanel={() => {
          if (isAdmin) {
            setIsAdminPanelOpen(true);
          } else {
            setIsAdminAuthModalOpen(true);
          }
        }}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Container below Header */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex">
        
        {/* Left Google Maps Style Sidebar Panel */}
        <div
          className={`h-full bg-slate-900 border-r-4 border-black shadow-2xl flex flex-col transition-all duration-300 z-20 shrink-0 overflow-hidden ${
            isSidebarOpen
              ? 'absolute sm:relative inset-y-0 left-0 w-full sm:w-80 md:w-[380px] lg:w-[420px] translate-x-0 opacity-100'
              : 'absolute sm:relative inset-y-0 left-0 w-0 -translate-x-full opacity-0 pointer-events-none border-r-0'
          }`}
        >
          {/* Sidebar Top Status & Sort Bar */}
          <div className="p-3 bg-slate-950 border-b-2 border-black flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-black text-white uppercase tracking-tight">Nearby Stations</span>
              <span className="bg-yellow-400 text-black px-2 py-0.5 font-black text-[10px] border border-black">
                {filteredToilets.length} STATIONS
              </span>
            </div>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 bg-yellow-400 text-black border border-black hover:bg-white transition-all font-black flex items-center gap-1 text-xs"
              title="Hide Panel"
            >
              <PanelLeftClose className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline font-black text-[10px] uppercase">HIDE</span>
            </button>
          </div>

          {/* Toilet Cards Scrollable List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredToilets.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/50 border border-slate-800 rounded-2xl space-y-3 my-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-amber-400 flex items-center justify-center text-2xl mx-auto">
                  🚽
                </div>
                <h3 className="font-bold text-sm text-slate-200">No toilets found matching filters</h3>
                <p className="text-xs text-slate-400">Try broadening your cleanliness, bidet, or price filters.</p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-semibold hover:bg-sky-500/30 transition-all"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredToilets.map((toilet) => (
                <ToiletCard
                  key={toilet.id}
                  toilet={toilet}
                  isSelected={toilet.id === selectedToiletId}
                  onSelect={handleSelectToilet}
                  userLocation={userLocation}
                  onGetDirections={handleGetDirections}
                />
              ))
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 shrink-0 text-[11px] text-slate-400 flex items-center justify-between">
            <span>LooLocator v1.0 • verified toilet reviews</span>
            <button
              onClick={handleResetDemoData}
              className="text-slate-500 hover:text-slate-300 underline"
            >
              Reset Data
            </button>
          </div>
        </div>

        {/* Map View Canvas */}
        <div className="flex-1 w-full h-full relative">
          <MapView
            toilets={filteredToilets}
            selectedToiletId={selectedToiletId}
            onSelectToilet={(t) => {
              if (t) {
                setSelectedToiletId(t.id);
                setIsDetailModalOpen(true);
              } else {
                setSelectedToiletId(null);
                setIsDetailModalOpen(false);
              }
            }}
            tileStyle={tileStyle}
            onChangeTileStyle={setTileStyle}
            isAddPinMode={isAddPinMode}
            onPinDropped={handlePinDroppedOnMap}
            tempPinCoords={tempDroppedPinCoords}
            userLocation={userLocation}
            activeRouteDestination={activeRouteDestination}
            onLocateMe={handleLocateMe}
          />

          {/* Floating Map List Switcher Button at Bottom when Sidebar is Closed */}
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="absolute z-20 bottom-6 left-4 sm:left-6 bg-yellow-400 text-black border-2 border-black font-black text-xs uppercase px-4 py-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-yellow-400 transition-all flex items-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
              title="Show Stations Panel"
            >
              <PanelLeft className="w-4 h-4 stroke-[3] shrink-0" />
              <span>SHOW STATIONS ({filteredToilets.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="absolute bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 bg-black text-white border-2 border-black px-3.5 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[11px] sm:text-xs font-black uppercase flex items-center gap-2 animate-bounce max-w-[85vw] text-center justify-center pointer-events-none">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedToilet && (
        <ToiletDetailModal
          toilet={selectedToilet}
          reviews={reviews}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedToiletId(null);
          }}
          onOpenAddReviewModal={() => setIsAddReviewModalOpen(true)}
          onGetDirections={handleGetDirections}
          isAdmin={isAdmin}
          onAdminToggleVerify={handleAdminToggleVerify}
          onDeleteStation={handleDeleteToiletStation}
          userLocation={userLocation}
        />
      )}

      {/* Write Review Modal */}
      {isAddReviewModalOpen && selectedToilet && (
        <AddReviewModal
          toilet={selectedToilet}
          onClose={() => setIsAddReviewModalOpen(false)}
          onSubmitReview={handleCreateReview}
        />
      )}

      {/* Add Toilet Modal */}
      {isAddToiletModalOpen && (
        <AddToiletModal
          initialCoords={tempDroppedPinCoords}
          onClose={() => {
            setIsAddToiletModalOpen(false);
            setTempDroppedPinCoords(null);
          }}
          onSubmitToilet={(data) => {
            handleCreateToilet(data);
            setTempDroppedPinCoords(null);
            setIsAddToiletModalOpen(false);
          }}
        />
      )}

      {/* Filter Drawer */}
      {isFilterDrawerOpen && (
        <FilterDrawer
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          onClose={() => setIsFilterDrawerOpen(false)}
          totalMatchingCount={filteredToilets.length}
        />
      )}

      {/* Admin Auth Password Modal */}
      {isAdminAuthModalOpen && (
        <AdminAuthModal
          onClose={() => setIsAdminAuthModalOpen(false)}
          onSuccess={() => {
            setIsAdmin(true);
            setIsAdminAuthModalOpen(false);
            setToastMessage('🛡️ Admin Mode Unlocked! Password verified.');
          }}
        />
      )}

      {/* Admin Panel Modal */}
      {isAdminPanelOpen && (
        <AdminPanelModal
          toilets={toilets}
          onClose={() => setIsAdminPanelOpen(false)}
          onToggleVerify={handleAdminToggleVerify}
          onDeleteStation={handleDeleteToiletStation}
        />
      )}

      {/* Walking Directions Modal */}
      {isDirectionsModalOpen && activeRouteDestination && (
        <DirectionsModal
          toilet={activeRouteDestination}
          userLocation={userLocation}
          onClose={() => {
            setIsDirectionsModalOpen(false);
            setActiveRouteDestination(null);
          }}
        />
      )}
    </div>
  );
}
