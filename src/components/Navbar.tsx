import React from 'react';
import { FilterState, MapTileStyle } from '../types';
import { Search, SlidersHorizontal, Plus, Shield, ShieldCheck, Layers, Crosshair, Sparkles, Check } from 'lucide-react';

interface NavbarProps {
  filters: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  onOpenFilterDrawer: () => void;
  onOpenAddToiletModal: () => void;
  isAddPinMode: boolean;
  onToggleAddPinMode: () => void;
  tileStyle: MapTileStyle;
  onChangeTileStyle: (style: MapTileStyle) => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  onLocateMe: () => void;
  totalResultsCount: number;
  onOpenAdminPanel: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  filters,
  onFilterChange,
  onOpenFilterDrawer,
  onOpenAddToiletModal,
  isAddPinMode,
  onToggleAddPinMode,
  tileStyle,
  onChangeTileStyle,
  isAdmin,
  onToggleAdmin,
  onLocateMe,
  totalResultsCount,
  onOpenAdminPanel,
}) => {
  // Calculate active filter count excluding search
  const activeFiltersCount = [
    filters.genderFilter !== 'any',
    filters.minCleanliness > 0,
    filters.minAccessibility > 0,
    filters.bidetType !== 'any',
    filters.closetType !== 'any',
    filters.wetDry !== 'any',
    filters.soapStatus !== 'any',
    filters.isPaid !== 'any',
    filters.isVerifiedOnly,
    filters.wheelchairOnly,
    filters.hasBabyChanging,
  ].filter(Boolean).length;

  return (
    <div className="absolute top-0 left-0 right-0 z-30 p-3 sm:p-4 flex flex-col gap-2.5 pointer-events-none bg-transparent">
      {/* Main Top Bar */}
      <div className="flex items-center justify-between gap-2.5 max-w-7xl mx-auto w-full pointer-events-auto">
        
        {/* Brand & Logo Card */}
        <div className="flex items-center gap-2 bg-white border-2 border-black p-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-black text-white border border-black flex items-center justify-center font-black text-lg">
            🚽
          </div>
          <div className="pr-1.5 hidden sm:block">
            <h1 className="text-lg font-black tracking-tighter text-black uppercase leading-none">
              LOO.LOCATOR
            </h1>
            <p className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">
              MAP FINDER
            </p>
          </div>
        </div>

        {/* Floating Search Input Card */}
        <div className="flex-1 max-w-xl relative">
          <div className="relative flex items-center bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus-within:bg-yellow-300 transition-colors">
            <Search className="w-4 h-4 ml-3 text-black shrink-0 stroke-[2.5]" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              placeholder="SEARCH STATIONS, MALLS, FLOORS..."
              className="w-full pl-2 py-2 bg-transparent text-xs sm:text-sm font-bold text-black placeholder-zinc-500 uppercase focus:outline-none"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onFilterChange({ searchQuery: '' })}
                className="absolute right-2 font-black text-xs text-black bg-yellow-400 border-2 border-black px-1.5 py-0.5"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Action Controls & Admin Switch */}
        <div className="flex items-center gap-2">
          
          {/* Add Loo Button */}
          <button
            onClick={onToggleAddPinMode}
            className={`px-3 py-2 border-2 border-black font-black text-xs uppercase transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5 ${
              isAddPinMode
                ? 'bg-yellow-400 text-black ring-2 ring-black animate-pulse'
                : 'bg-black text-white hover:bg-yellow-400 hover:text-black'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden md:inline">{isAddPinMode ? 'PIN ON MAP' : 'ADD STATION'}</span>
          </button>

          {/* Admin Mode Toggle */}
          <button
            onClick={onToggleAdmin}
            title={isAdmin ? 'Admin Mode Active' : 'Switch to Admin Mode'}
            className={`px-2.5 py-2 border-2 border-black text-xs font-black uppercase flex items-center gap-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all ${
              isAdmin
                ? 'bg-blue-600 text-white'
                : 'bg-white text-black hover:bg-zinc-200'
            }`}
          >
            {isAdmin ? <ShieldCheck className="w-4 h-4 stroke-[2.5]" /> : <Shield className="w-4 h-4 stroke-[2.5]" />}
            <span className="hidden lg:inline">{isAdmin ? 'ADMIN ACTIVE' : 'ADMIN'}</span>
          </button>

          {isAdmin && (
            <button
              onClick={onOpenAdminPanel}
              className="px-2.5 py-2 bg-yellow-400 text-black border-2 border-black font-black text-xs uppercase flex items-center gap-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-yellow-400 transition-all"
              title="Admin Dashboard"
            >
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">VERIFY LOG</span>
            </button>
          )}

          {/* Map Tile Style Switcher */}
          <div className="relative group">
            <button
              className="p-2 bg-white text-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 transition-all flex items-center gap-1"
              title="Map Style"
            >
              <Layers className="w-4 h-4 stroke-[2.5]" />
            </button>
            
            <div className="absolute right-0 top-full mt-2 hidden group-hover:flex flex-col bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-1.5 w-40 gap-1 z-50">
              {(['dark', 'standard', 'satellite', 'outdoors'] as MapTileStyle[]).map((style) => (
                <button
                  key={style}
                  onClick={() => onChangeTileStyle(style)}
                  className={`px-3 py-1.5 text-xs font-black uppercase text-left flex items-center justify-between border-2 border-transparent ${
                    tileStyle === style ? 'bg-black text-white border-black' : 'text-black hover:bg-yellow-300'
                  }`}
                >
                  <span>{style}</span>
                  {tileStyle === style && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category Quick Filter Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-7xl mx-auto w-full pointer-events-auto no-scrollbar">
        
        {/* Full Filter Drawer Toggle Button */}
        <button
          onClick={onOpenFilterDrawer}
          className={`px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all shrink-0 ${
            activeFiltersCount > 0
              ? 'bg-yellow-400 text-black'
              : 'bg-black text-white hover:bg-yellow-400 hover:text-black'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>FILTERS</span>
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 bg-black text-white font-black text-[10px] flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Gender Pills */}
        <button
          onClick={() => onFilterChange({ genderFilter: filters.genderFilter === 'Female' ? 'any' : 'Female' })}
          className={`px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0 transition-all ${
            filters.genderFilter === 'Female'
              ? 'bg-pink-500 text-white'
              : 'bg-white text-black hover:bg-pink-100'
          }`}
        >
          <span>♀ FEMALE</span>
        </button>

        <button
          onClick={() => onFilterChange({ genderFilter: filters.genderFilter === 'Male' ? 'any' : 'Male' })}
          className={`px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0 transition-all ${
            filters.genderFilter === 'Male'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-black hover:bg-blue-100'
          }`}
        >
          <span>♂ MALE</span>
        </button>

        <button
          onClick={() => onFilterChange({ genderFilter: filters.genderFilter === 'Neutral/Accessible' ? 'any' : 'Neutral/Accessible' })}
          className={`px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0 transition-all ${
            filters.genderFilter === 'Neutral/Accessible'
              ? 'bg-purple-600 text-white'
              : 'bg-white text-black hover:bg-purple-100'
          }`}
        >
          <span>♿ NEUTRAL / ACCESSIBLE</span>
        </button>

        {/* Cleanliness 4.5+ Pill */}
        <button
          onClick={() => onFilterChange({ minCleanliness: filters.minCleanliness === 4.5 ? 0 : 4.5 })}
          className={`px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0 transition-all ${
            filters.minCleanliness >= 4.5
              ? 'bg-emerald-500 text-white'
              : 'bg-white text-black hover:bg-yellow-300'
          }`}
        >
          <span>HIGH RATED (&gt; 4.5)</span>
        </button>

        {/* Verified Only Pill */}
        <button
          onClick={() => onFilterChange({ isVerifiedOnly: !filters.isVerifiedOnly })}
          className={`px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0 transition-all ${
            filters.isVerifiedOnly
              ? 'bg-blue-600 text-white'
              : 'bg-white text-black hover:bg-yellow-300'
          }`}
        >
          <span>VERIFIED ONLY</span>
        </button>

        {/* Bidet Type Washlet / Jet Spray */}
        <button
          onClick={() => onFilterChange({ bidetType: filters.bidetType === 'washlet' ? 'any' : 'washlet' })}
          className={`px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0 transition-all ${
            filters.bidetType === 'washlet'
              ? 'bg-yellow-400 text-black'
              : 'bg-white text-black hover:bg-yellow-300'
          }`}
        >
          <span>ELECTRONIC WASH</span>
        </button>

        <button
          onClick={() => onFilterChange({ bidetType: filters.bidetType === 'jet_spray' ? 'any' : 'jet_spray' })}
          className={`px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0 transition-all ${
            filters.bidetType === 'jet_spray'
              ? 'bg-yellow-400 text-black'
              : 'bg-white text-black hover:bg-yellow-300'
          }`}
        >
          <span>JET SPRAY</span>
        </button>

        {/* Closet Type Sitting / Squatting */}
        <button
          onClick={() => onFilterChange({ closetType: filters.closetType === 'duduk' ? 'any' : 'duduk' })}
          className={`px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0 transition-all ${
            filters.closetType === 'duduk'
              ? 'bg-yellow-400 text-black'
              : 'bg-white text-black hover:bg-yellow-300'
          }`}
        >
          <span>SEATED (DUDUK)</span>
        </button>

        <button
          onClick={() => onFilterChange({ closetType: filters.closetType === 'jongkok' ? 'any' : 'jongkok' })}
          className={`px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0 transition-all ${
            filters.closetType === 'jongkok'
              ? 'bg-yellow-400 text-black'
              : 'bg-white text-black hover:bg-yellow-300'
          }`}
        >
          <span>SQUAT (JONGKOK)</span>
        </button>

        {/* Free / Non-paying */}
        <button
          onClick={() => onFilterChange({ isPaid: filters.isPaid === 'free' ? 'any' : 'free' })}
          className={`px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0 transition-all ${
            filters.isPaid === 'free'
              ? 'bg-emerald-500 text-white'
              : 'bg-white text-black hover:bg-yellow-300'
          }`}
        >
          <span>NON-PAYING</span>
        </button>

        {/* Wheelchair Accessible */}
        <button
          onClick={() => onFilterChange({ wheelchairOnly: !filters.wheelchairOnly })}
          className={`px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0 transition-all ${
            filters.wheelchairOnly
              ? 'bg-blue-600 text-white'
              : 'bg-white text-black hover:bg-yellow-300'
          }`}
        >
          <span>ACCESSIBLE</span>
        </button>

        {/* Results Counter Pill */}
        <div className="ml-auto shrink-0 bg-black text-white px-3 py-1.5 border-2 border-black text-xs font-black uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <span>{totalResultsCount} STATIONS FOUND</span>
        </div>
      </div>
    </div>
  );
};
