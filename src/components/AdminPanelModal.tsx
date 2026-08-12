import React, { useState } from 'react';
import { ToiletLocation } from '../types';
import { ShieldCheck, X, CheckCircle2, Trash2 } from 'lucide-react';

interface AdminPanelModalProps {
  toilets: ToiletLocation[];
  onClose: () => void;
  onToggleVerify: (toiletId: string, isVerified: boolean, note?: string) => void;
  onDeleteStation: (toiletId: string) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  toilets,
  onClose,
  onToggleVerify,
  onDeleteStation,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'unverified' | 'verified'>('unverified');
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});

  const verifiedCount = toilets.filter((t) => t.isVerified).length;
  const unverifiedCount = toilets.filter((t) => !t.isVerified).length;

  const displayedToilets = toilets.filter((t) => {
    if (filterMode === 'unverified') return !t.isVerified;
    if (filterMode === 'verified') return t.isVerified;
    return true;
  });

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-hidden animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden my-auto flex flex-col max-h-[88dvh] sm:max-h-[90vh] text-black">
        
        {/* Header */}
        <div className="p-3.5 sm:p-5 bg-yellow-400 border-b-4 border-black flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="p-1.5 sm:p-2 bg-black text-yellow-400 border-2 border-black">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
            </div>
            <div>
              <h2 className="font-display font-black text-base sm:text-lg text-black uppercase tracking-tight flex items-center gap-1.5 sm:gap-2">
                <span>LOOLOCATOR ADMIN PANEL</span>
                <span className="text-[10px] sm:text-xs bg-black text-yellow-400 px-1.5 sm:px-2 py-0.5 border border-black font-black">
                  ACTIVE
                </span>
              </h2>
              <p className="text-[10px] sm:text-xs font-bold text-black uppercase">Manage Station Verification & Badges</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-black bg-white hover:bg-black hover:text-white border-2 border-black font-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Interactive Stats Filter Cards Bar */}
        <div className="p-2.5 sm:p-4 bg-zinc-100 border-b-4 border-black grid grid-cols-3 gap-2 sm:gap-3 text-center text-[10px] sm:text-xs uppercase font-black shrink-0">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`p-2 sm:p-3 border-2 border-black transition-all flex flex-col items-center justify-center cursor-pointer ${
              filterMode === 'all'
                ? 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(234,179,8,1)] ring-2 ring-black scale-[1.02]'
                : 'bg-white text-black hover:bg-zinc-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
            }`}
            title="Show All Stations"
          >
            <span className="truncate w-full font-black text-[10px] sm:text-xs">TOTAL STATIONS</span>
            <span className="font-display font-black text-lg sm:text-2xl leading-none mt-1">{toilets.length}</span>
            <span className="text-[9px] font-bold opacity-80 mt-0.5">{filterMode === 'all' ? '● Active Filter' : 'Tap to filter'}</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('verified')}
            className={`p-2 sm:p-3 border-2 border-black transition-all flex flex-col items-center justify-center cursor-pointer ${
              filterMode === 'verified'
                ? 'bg-yellow-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ring-2 ring-black scale-[1.02]'
                : 'bg-white text-black hover:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
            }`}
            title="Filter Verified Badges"
          >
            <span className="truncate w-full font-black text-[10px] sm:text-xs">VERIFIED BADGES</span>
            <span className="font-display font-black text-lg sm:text-2xl leading-none mt-1">{verifiedCount}</span>
            <span className="text-[9px] font-bold opacity-80 mt-0.5">{filterMode === 'verified' ? '● Active Filter' : 'Tap to filter'}</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('unverified')}
            className={`p-2 sm:p-3 border-2 border-black transition-all flex flex-col items-center justify-center cursor-pointer ${
              filterMode === 'unverified'
                ? 'bg-yellow-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ring-2 ring-black scale-[1.02]'
                : 'bg-white text-black hover:bg-zinc-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
            }`}
            title="Filter Needs Review"
          >
            <span className="truncate w-full font-black text-[10px] sm:text-xs">NEEDS REVIEW</span>
            <span className="font-display font-black text-lg sm:text-2xl leading-none mt-1">{unverifiedCount}</span>
            <span className="text-[9px] font-bold opacity-80 mt-0.5">{filterMode === 'unverified' ? '● Active Filter' : 'Tap to filter'}</span>
          </button>
        </div>

        {/* Scrollable Toilet Verification Table */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 uppercase font-black text-xs">
          {displayedToilets.length === 0 ? (
            <div className="p-8 text-center text-black space-y-2">
              <CheckCircle2 className="w-8 h-8 text-black mx-auto stroke-[3]" />
              <p className="font-black text-sm">NO STATIONS MATCHING THIS FILTER!</p>
            </div>
          ) : (
            displayedToilets.map((toilet) => (
              <div
                key={toilet.id}
                className={`p-3.5 sm:p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                  toilet.isVerified
                    ? 'bg-yellow-400/20'
                    : 'bg-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-sm text-black truncate">{toilet.name}</h3>
                      {toilet.isVerified ? (
                        <span className="px-2 py-0.5 bg-yellow-400 text-black border border-black text-[10px] font-black">
                          Verified Badge
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-zinc-200 text-black border border-black text-[10px] font-black">
                          Unverified
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-black font-black">
                      Building: {toilet.buildingName} • Floor: {toilet.floor}
                    </p>
                    <p className="text-xs text-zinc-700 font-bold">
                      Location: {toilet.unitWing}
                    </p>
                  </div>

                  {/* Actions for Station */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap pt-1 sm:pt-0">
                    <button
                      onClick={() => {
                        const note = noteMap[toilet.id] || toilet.adminNote || 'Verified by LooLocator Official Admin';
                        onToggleVerify(toilet.id, !toilet.isVerified, note);
                      }}
                      className={`px-3 py-1.5 border-2 border-black text-[11px] font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                        toilet.isVerified
                          ? 'bg-zinc-800 text-white hover:bg-black'
                          : 'bg-yellow-400 text-black hover:bg-black hover:text-yellow-400'
                      }`}
                    >
                      {toilet.isVerified ? 'REVOKE BADGE' : 'GRANT BADGE'}
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to PERMANENTLY DELETE station "${toilet.name}"?`)) {
                          onDeleteStation(toilet.id);
                        }
                      }}
                      className="px-3 py-1.5 bg-red-600 text-white hover:bg-black border-2 border-black text-[11px] font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-1"
                      title="Delete Station"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[3]" />
                      <span>DELETE</span>
                    </button>
                  </div>
                </div>

                {/* Optional Note Field */}
                <div className="mt-3 pt-2 border-t-2 border-black flex items-center gap-2 text-xs">
                  <span className="text-black shrink-0 font-black text-[11px]">ADMIN NOTE:</span>
                  <input
                    type="text"
                    defaultValue={toilet.adminNote || ''}
                    placeholder="Add inspection details e.g. Inspected on Aug 2026..."
                    onChange={(e) => setNoteMap({ ...noteMap, [toilet.id]: e.target.value })}
                    className="flex-1 px-2.5 py-1 bg-white border-2 border-black text-black text-xs font-bold uppercase focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
