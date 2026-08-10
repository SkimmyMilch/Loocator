import React from 'react';
import { ToiletLocation, UserLocation } from '../types';
import { calculateDistanceKm } from '../services/storageService';
import { getBidetLabel, getClosetLabel } from '../utils/formatters';
import { ShieldCheck, MapPin, Navigation, ArrowRight, Accessibility, Star } from 'lucide-react';

interface ToiletCardProps {
  toilet: ToiletLocation;
  isSelected: boolean;
  onSelect: (toilet: ToiletLocation) => void;
  userLocation: UserLocation | null;
  onGetDirections: (toilet: ToiletLocation) => void;
}

export const ToiletCard: React.FC<ToiletCardProps> = ({
  toilet,
  isSelected,
  onSelect,
  userLocation,
  onGetDirections,
}) => {
  const distanceKm = userLocation
    ? calculateDistanceKm(userLocation.lat, userLocation.lng, toilet.coordinates.lat, toilet.coordinates.lng)
    : null;

  const bidetInfo = getBidetLabel(toilet.bidetType);
  const closetInfo = getClosetLabel(toilet.closetType);

  return (
    <div
      onClick={() => onSelect(toilet)}
      className={`group relative p-3.5 border-2 border-black transition-all cursor-pointer ${
        isSelected
          ? 'bg-yellow-300 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
          : 'bg-white hover:bg-zinc-100 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
      }`}
    >
      <div className="flex flex-col gap-2">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-display font-black text-sm text-black uppercase tracking-tight truncate">
                {toilet.name}
              </h3>
              {toilet.isVerified && (
                <span className="inline-flex items-center gap-1 bg-yellow-400 text-black border border-black px-1.5 py-0.5 text-[10px] font-black uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[3]" />
                  <span>VERIFIED</span>
                </span>
              )}
            </div>

            <p className="text-xs font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1 truncate mt-0.5">
              <MapPin className="w-3.5 h-3.5 shrink-0 stroke-[3]" />
              <span>{toilet.buildingName} • LEVEL {toilet.floor}</span>
            </p>
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider truncate">
              {toilet.unitWing}
            </p>
          </div>

          {/* Rating & Fee Badges */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="bg-black text-white px-2 py-1 border-2 border-black font-black text-xs flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 stroke-[2]" />
              <span>{toilet.ratingCleanliness.toFixed(1)}</span>
            </div>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-zinc-100 border border-black text-black">
              {toilet.isPaid ? toilet.costText || 'Paid' : 'Free'}
            </span>
          </div>
        </div>

        {/* Gender Section Ratings Summary Row */}
        <div className="grid grid-cols-3 gap-1.5 my-0.5">
          <div className={`p-1.5 border border-black flex flex-col items-center justify-center text-center ${
            toilet.ratingFemale !== undefined && toilet.ratingFemale >= 4.0
              ? 'bg-pink-100 text-pink-950 font-black'
              : toilet.ratingFemale !== undefined && toilet.ratingFemale <= 2.0
              ? 'bg-red-200 text-red-950 font-black'
              : 'bg-pink-50 text-pink-900'
          }`}>
            <span className="text-[9px] font-black uppercase tracking-wider">♀ FEMALE</span>
            <span className="text-xs font-black">
              {toilet.ratingFemale !== undefined ? toilet.ratingFemale.toFixed(1) : '—'}
            </span>
          </div>

          <div className={`p-1.5 border border-black flex flex-col items-center justify-center text-center ${
            toilet.ratingMale !== undefined && toilet.ratingMale >= 4.0
              ? 'bg-blue-100 text-blue-950 font-black'
              : toilet.ratingMale !== undefined && toilet.ratingMale <= 2.0
              ? 'bg-red-200 text-red-950 font-black'
              : 'bg-blue-50 text-blue-900'
          }`}>
            <span className="text-[9px] font-black uppercase tracking-wider">♂ MALE</span>
            <span className="text-xs font-black">
              {toilet.ratingMale !== undefined ? toilet.ratingMale.toFixed(1) : '—'}
            </span>
          </div>

          <div className={`p-1.5 border border-black flex flex-col items-center justify-center text-center ${
            toilet.ratingUnisex !== undefined && toilet.ratingUnisex >= 4.0
              ? 'bg-purple-100 text-purple-950 font-black'
              : 'bg-purple-50 text-purple-900'
          }`}>
            <span className="text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 justify-center">
              <Accessibility className="w-2.5 h-2.5 stroke-[3]" />
              <span>NEUTRAL</span>
            </span>
            <span className="text-xs font-black">
              {toilet.ratingUnisex !== undefined ? toilet.ratingUnisex.toFixed(1) : toilet.ratingAccessibility.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Quick Specs Chips */}
        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
          <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-zinc-100 border border-black text-black">
            {closetInfo.label}
          </span>

          <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-zinc-100 border border-black text-black">
            {bidetInfo.label}
          </span>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-2 mt-1 pt-2 border-t-2 border-black text-[11px] font-black uppercase">
          <span className="text-zinc-700">
            {distanceKm !== null ? `${distanceKm} KM AWAY` : `${toilet.totalReviews} REVIEWS`}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onGetDirections(toilet);
              }}
              className="px-2.5 py-1 bg-black text-white hover:bg-yellow-400 hover:text-black border-2 border-black font-black text-[10px] uppercase flex items-center gap-1 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <Navigation className="w-3 h-3 stroke-[3]" />
              <span>ROUTE</span>
            </button>

            <span className="text-black group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

