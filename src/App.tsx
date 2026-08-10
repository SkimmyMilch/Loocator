import React, { useState, useEffect } from 'react';
import { ToiletLocation, Review, FilterState, MapTileStyle, UserLocation } from './types';
import {
  getStoredToilets,
  getStoredReviews,
  addToiletLocation,
  addReviewToToilet,
  toggleAdminVerifyToilet,
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
  const [isAdmin, setIsAdmin] = useState<boolean>(true);

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
  const [toastMessage, setToastMessage] = useState<string | null>('Clean flat map loaded. Tap any station pin for details.');

  // Load Data on Mount
  useEffect(() => {
    const loadedToilets = getStoredToilets();
    const loadedReviews = getStoredReviews();
    setToilets(loadedToilets);
    setReviews(loadedReviews);
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
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(userPos);
          setToastMessage('📍 Located your position on the map!');
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setToastMessage('📍 Using default location (Grand Indonesia Area).');
        }
      );
    }
  };

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

  const handleCreateToilet = (
    data: Omit<ToiletLocation, 'id' | 'createdAt' | 'updatedAt' | 'totalReviews' | 'ratingCleanliness' | 'ratingAccessibility'>
  ) => {
    const newToilet = addToiletLocation(data);
    setToilets(getStoredToilets());
    setSelectedToiletId(newToilet.id);
    setIsDetailModalOpen(true);
    setToastMessage(`✨ Added toilet location: ${newToilet.name}`);
  };

  const handleCreateReview = (
    reviewData: Omit<Review, 'id' | 'createdAt' | 'helpfulCount'>
  ) => {
    const { review, updatedToilet } = addReviewToToilet(reviewData);
    setToilets(getStoredToilets());
    setReviews(getStoredReviews());
    setToastMessage(`💬 Review published for ${updatedToilet.name}! Ratings updated.`);
  };

  const handleAdminToggleVerify = (toiletId: string, isVerified: boolean, note?: string) => {
    const updated = toggleAdminVerifyToilet(toiletId, isVerified, note);
    setToilets(getStoredToilets());
    setToastMessage(
      isVerified
        ? `✔️ Verified Badge granted to ${updated.name}!`
        : `Revoked Verified Badge from ${updated.name}.`
    );
  };

  const handleGetDirections = (toilet: ToiletLocation) => {
    setActiveRouteDestination(toilet);
    setIsDirectionsModalOpen(true);
    setToastMessage(`🚗 Calculating walking route to ${toilet.name}...`);
  };

  const handleResetDemoData = () => {
    resetStorageToDefaults();
    setToilets(getStoredToilets());
    setReviews(getStoredReviews());
    setSelectedToiletId('loo-gi-l3-west');
    setToastMessage('🔄 Demo data reset to initial benchmark toilets.');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      
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
          setIsAdmin(!isAdmin);
          setToastMessage(
            !isAdmin
              ? '🛡️ Admin Mode Enabled! You can now grant/revoke Verified Badges.'
              : 'User Mode Enabled.'
          );
        }}
        onLocateMe={handleLocateMe}
        totalResultsCount={filteredToilets.length}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
      />

      {/* Main Container */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex">
        
        {/* Left Google Maps Style Sidebar Drawer */}
        <div
          className={`absolute sm:relative z-20 top-28 sm:top-0 bottom-0 left-0 w-full sm:w-96 md:w-[420px] bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 shadow-2xl flex flex-col transition-all duration-300 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0 sm:w-0 sm:border-0'
          }`}
        >
          {/* Sidebar Top Status & Sort Bar */}
          <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-200">Nearby Toilet Locations</span>
              <span className="bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-mono text-[10px] border border-sky-500/30">
                {filteredToilets.length} Loos
              </span>
            </div>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="sm:hidden p-1 text-slate-400 hover:text-white"
            >
              <PanelLeftClose className="w-5 h-5" />
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

        {/* Desktop Sidebar Toggle Floating Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden sm:flex absolute z-20 left-3 bottom-8 p-2.5 bg-slate-900/90 border border-slate-700 text-slate-200 hover:text-white rounded-2xl shadow-2xl backdrop-blur-md transition-all hover:scale-105"
          title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
        </button>

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
            isAddPinMode={isAddPinMode}
            onPinDropped={handlePinDroppedOnMap}
            tempPinCoords={tempDroppedPinCoords}
            userLocation={userLocation}
            activeRouteDestination={activeRouteDestination}
            onLocateMe={handleLocateMe}
          />

          {/* Floating Map List Switcher Button */}
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="absolute z-20 bottom-6 left-4 bg-black text-white border-2 border-black font-black text-xs uppercase px-4 py-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 hover:text-black transition-all flex items-center gap-2"
            >
              <ListFilter className="w-4 h-4 stroke-[3]" />
              <span>STATION LIST ({filteredToilets.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-black text-white border-2 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xs font-black uppercase flex items-center gap-2 animate-bounce">
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

      {/* Admin Panel Modal */}
      {isAdminPanelOpen && (
        <AdminPanelModal
          toilets={toilets}
          onClose={() => setIsAdminPanelOpen(false)}
          onToggleVerify={handleAdminToggleVerify}
          onResetData={handleResetDemoData}
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
