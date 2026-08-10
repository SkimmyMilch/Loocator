import React, { useState } from 'react';
import { ToiletLocation } from '../types';
import { ShieldCheck, X, CheckCircle2, RotateCcw } from 'lucide-react';

interface AdminPanelModalProps {
  toilets: ToiletLocation[];
  onClose: () => void;
  onToggleVerify: (toiletId: string, isVerified: boolean, note?: string) => void;
  onResetData: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  toilets,
  onClose,
  onToggleVerify,
  onResetData,
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
        <div className="p-4 sm:p-5 bg-yellow-400 border-b-4 border-black flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-black text-yellow-400 border-2 border-black">
              <ShieldCheck className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-black uppercase tracking-tight flex items-center gap-2">
                <span>LOOLOCATOR OFFICIAL ADMIN PANEL</span>
                <span className="text-xs bg-black text-yellow-400 px-2 py-0.5 border border-black font-black">
                  ACTIVE
                </span>
              </h2>
              <p className="text-xs font-bold text-black uppercase">Manage Station Verification & Badges</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-black bg-white hover:bg-black hover:text-white border-2 border-black font-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Stats Summary Bar */}
        <div className="p-4 bg-zinc-100 border-b-4 border-black grid grid-cols-3 gap-3 text-center text-xs uppercase font-black shrink-0">
          <div className="p-2.5 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-black">Total Stations</p>
            <p className="font-display font-black text-lg text-black">{toilets.length}</p>
          </div>

          <div className="p-2.5 bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-black">Verified Badges</p>
            <p className="font-display font-black text-lg text-black">{verifiedCount}</p>
          </div>

          <div className="p-2.5 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-black">Needs Review</p>
            <p className="font-display font-black text-lg text-black">{unverifiedCount}</p>
          </div>
        </div>

        {/* Filter Toggle Pills */}
        <div className="p-3 bg-white border-b-4 border-black flex items-center justify-between shrink-0 text-xs uppercase font-black">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterMode('unverified')}
              className={`px-3 py-1.5 border-2 border-black font-black transition-all ${
                filterMode === 'unverified' ? 'bg-yellow-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-black hover:bg-zinc-100'
              }`}
            >
              Needs Verification ({unverifiedCount})
            </button>

            <button
              onClick={() => setFilterMode('verified')}
              className={`px-3 py-1.5 border-2 border-black font-black transition-all ${
                filterMode === 'verified' ? 'bg-yellow-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-black hover:bg-zinc-100'
              }`}
            >
              Verified ({verifiedCount})
            </button>

            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 border-2 border-black font-black transition-all ${
                filterMode === 'all' ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-black hover:bg-zinc-100'
              }`}
            >
              All ({toilets.length})
            </button>
          </div>

          <button
            onClick={onResetData}
            className="px-3 py-1.5 bg-red-500 text-white border-2 border-black font-black text-xs flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-black transition-all"
            title="Reset All Local Data to Defaults"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[3]" />
            <span>Reset Demo Data</span>
          </button>
        </div>

        {/* Scrollable Toilet Verification Table */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 uppercase font-black text-xs">
          {displayedToilets.length === 0 ? (
            <div className="p-8 text-center text-black space-y-2">
              <CheckCircle2 className="w-8 h-8 text-black mx-auto stroke-[3]" />
              <p className="font-black text-sm">NO TOILETS MATCHING THIS ADMIN FILTER!</p>
            </div>
          ) : (
            displayedToilets.map((toilet) => (
              <div
                key={toilet.id}
                className={`p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                  toilet.isVerified
                    ? 'bg-yellow-400/20'
                    : 'bg-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
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

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => {
                        const note = noteMap[toilet.id] || toilet.adminNote || 'Verified by LooLocator Official Admin';
                        onToggleVerify(toilet.id, !toilet.isVerified, note);
                      }}
                      className={`px-4 py-2 border-2 border-black text-xs font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all ${
                        toilet.isVerified
                          ? 'bg-red-500 text-white hover:bg-black'
                          : 'bg-yellow-400 text-black hover:bg-black hover:text-yellow-400'
                      }`}
                    >
                      {toilet.isVerified ? 'REVOKE VERIFIED BADGE' : 'GRANT VERIFIED BADGE'}
                    </button>
                  </div>
                </div>

                {/* Optional Note Field */}
                <div className="mt-3 pt-2 border-t-2 border-black flex items-center gap-2 text-xs">
                  <span className="text-black shrink-0 font-black">ADMIN NOTE:</span>
                  <input
                    type="text"
                    defaultValue={toilet.adminNote || ''}
                    placeholder="Add inspection details e.g. Inspected on Aug 2026..."
                    onChange={(e) => setNoteMap({ ...noteMap, [toilet.id]: e.target.value })}
                    className="flex-1 px-3 py-1 bg-white border-2 border-black text-black text-xs font-bold uppercase focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
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

