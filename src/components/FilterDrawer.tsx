import React from 'react';
import { FilterState, BidetType, ClosetType, SoapStatus, WetDryType } from '../types';
import { X, SlidersHorizontal, RotateCcw, Check, Sparkles, Star } from 'lucide-react';

interface FilterDrawerProps {
  filters: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onClose: () => void;
  totalMatchingCount: number;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  onClose,
  totalMatchingCount,
}) => {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-end bg-black/80 backdrop-blur-sm overflow-hidden animate-fadeIn">
      <div className="relative w-full max-w-md h-full max-h-[100dvh] bg-white border-l-4 border-black shadow-[8px_0px_0px_0px_rgba(0,0,0,1)] flex flex-col text-black">
        
        {/* Top Header */}
        <div className="p-4 bg-yellow-400 border-b-4 border-black flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-black stroke-[3]" />
            <h2 className="font-display font-black text-lg text-black uppercase tracking-tight">FILTER & SORT TOILETS</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetFilters}
              className="px-2.5 py-1 text-xs text-black font-black uppercase flex items-center gap-1 border-2 border-black bg-white hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[3]" />
              <span>Reset</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-black bg-white hover:bg-black hover:text-white border-2 border-black font-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <X className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Scrollable Filters Form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs font-black uppercase">
          
          {/* Sort By Option */}
          <div className="space-y-1.5">
            <label className="text-black text-xs font-black tracking-wider">SORT RESULTS BY</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'cleanliness', label: '⭐ Cleanliness' },
                { id: 'accessibility', label: 'Accessibility' },
                { id: 'verified', label: '✔️ Verified First' },
                { id: 'reviews', label: '💬 Most Reviewed' },
                { id: 'price', label: '💵 Free / Cheapest' },
                { id: 'distance', label: '🚗 Nearest Distance' },
              ].map((sortItem) => (
                <button
                  key={sortItem.id}
                  onClick={() => onFilterChange({ sortBy: sortItem.id as FilterState['sortBy'] })}
                  className={`p-2.5 border-2 border-black text-left font-black text-xs uppercase transition-all ${
                    filters.sortBy === sortItem.id
                      ? 'bg-yellow-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  {sortItem.label}
                </button>
              ))}
            </div>
          </div>

          {/* Gender / Restroom Section Filter */}
          <div className="p-3.5 bg-zinc-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-black font-black">RESTROOM SECTION / GENDER</span>
              <span className="text-black font-black bg-yellow-400 px-2 py-0.5 border border-black">
                {filters.genderFilter === 'any' ? 'All Sections' : filters.genderFilter}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'any', label: 'ALL SECTIONS' },
                { id: 'Female', label: 'FEMALE TOILETS' },
                { id: 'Male', label: 'MALE TOILETS' },
                { id: 'Neutral/Accessible', label: 'NEUTRAL / ACCESSIBLE' },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => onFilterChange({ genderFilter: g.id as FilterState['genderFilter'] })}
                  className={`p-2.5 font-black text-xs border-2 border-black transition-all text-left uppercase ${
                    filters.genderFilter === g.id
                      ? 'bg-black text-yellow-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cleanliness Rating Filter */}
          <div className="p-3.5 bg-zinc-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-black font-black">MIN CLEANLINESS RATING</span>
              <span className="text-black font-black bg-yellow-400 px-2 py-0.5 border border-black">
                {filters.minCleanliness === 0 ? 'Any Rating' : `${filters.minCleanliness}+ Stars`}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 3.0, 4.0, 4.5].map((val) => (
                <button
                  key={val}
                  onClick={() => onFilterChange({ minCleanliness: val })}
                  className={`py-2 font-black border-2 border-black transition-all uppercase ${
                    filters.minCleanliness === val
                      ? 'bg-black text-yellow-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  {val === 0 ? 'Any' : `${val}★`}
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility Rating Filter */}
          <div className="p-3.5 bg-zinc-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-black font-black">MIN ACCESSIBILITY RATING</span>
              <span className="text-black font-black bg-yellow-400 px-2 py-0.5 border border-black">
                {filters.minAccessibility === 0 ? 'Any Rating' : `${filters.minAccessibility}+ Stars`}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 3.0, 4.0, 4.5].map((val) => (
                <button
                  key={val}
                  onClick={() => onFilterChange({ minAccessibility: val })}
                  className={`py-2 font-black border-2 border-black transition-all uppercase ${
                    filters.minAccessibility === val
                      ? 'bg-black text-yellow-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  {val === 0 ? 'Any' : `${val}★`}
                </button>
              ))}
            </div>
          </div>

          {/* Closet Type Filter */}
          <div className="space-y-1.5">
            <label className="text-black text-xs font-black">CLOSET TYPE</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'any', label: 'Any Type' },
                { id: 'duduk', label: '🪑 Sitting (Duduk)' },
                { id: 'jongkok', label: '🧘 Squatting (Jongkok)' },
                { id: 'both', label: '✨ Both Available' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onFilterChange({ closetType: item.id as ClosetType | 'any' })}
                  className={`p-2.5 border-2 border-black text-left font-black text-xs uppercase transition-all ${
                    filters.closetType === item.id
                      ? 'bg-yellow-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bidet Type Filter */}
          <div className="space-y-1.5">
            <label className="text-black text-xs font-black">BIDET TYPE</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'any', label: 'Any Bidet' },
                { id: 'washlet', label: '⚡ Washlet' },
                { id: 'jet_spray', label: '💦 Jet Hose' },
                { id: 'gayung', label: '🪣 Gayung/Pitcher' },
                { id: 'none', label: '🧻 Paper Only' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onFilterChange({ bidetType: item.id as BidetType | 'any' })}
                  className={`p-2.5 border-2 border-black text-left font-black text-xs uppercase transition-all ${
                    filters.bidetType === item.id
                      ? 'bg-yellow-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Entry Fee / Pricing Filter */}
          <div className="space-y-1.5">
            <label className="text-black text-xs font-black">ENTRY FEE</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'any', label: 'Any' },
                { id: 'free', label: '🆓 Free Only' },
                { id: 'paid', label: '💵 Paid Only' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onFilterChange({ isPaid: item.id as FilterState['isPaid'] })}
                  className={`py-2 border-2 border-black text-center font-black transition-all ${
                    filters.isPaid === item.id
                      ? 'bg-yellow-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Admin Verified & Special Feature Toggles */}
          <div className="p-3.5 bg-zinc-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3 font-black uppercase text-xs">
            <span className="text-black">SPECIAL FILTERS</span>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-black">✔️ Admin Verified Badge Only</span>
              <input
                type="checkbox"
                checked={filters.isVerifiedOnly}
                onChange={(e) => onFilterChange({ isVerifiedOnly: e.target.checked })}
                className="w-4 h-4 border-2 border-black rounded-none text-black focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-black">Wheelchair Accessible Stall</span>
              <input
                type="checkbox"
                checked={filters.wheelchairOnly}
                onChange={(e) => onFilterChange({ wheelchairOnly: e.target.checked })}
                className="w-4 h-4 border-2 border-black rounded-none text-black focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-black">👶 Baby Changing Station</span>
              <input
                type="checkbox"
                checked={filters.hasBabyChanging}
                onChange={(e) => onFilterChange({ hasBabyChanging: e.target.checked })}
                className="w-4 h-4 border-2 border-black rounded-none text-black focus:ring-0"
              />
            </label>
          </div>

        </div>

        {/* Footer Apply Button */}
        <div className="p-4 bg-white border-t-4 border-black shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-black text-white hover:bg-yellow-400 hover:text-black border-2 border-black font-black text-xs uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2"
          >
            <span>SHOW {totalMatchingCount} TOILET LOCATIONS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
