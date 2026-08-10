import React from 'react';
import { ToiletLocation, UserLocation } from '../types';
import { calculateDistanceKm } from '../services/storageService';
import { X, Navigation, MapPin, Footprints, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface DirectionsModalProps {
  toilet: ToiletLocation;
  userLocation: UserLocation | null;
  onClose: () => void;
}

export const DirectionsModal: React.FC<DirectionsModalProps> = ({
  toilet,
  userLocation,
  onClose,
}) => {
  const distanceKm = userLocation
    ? calculateDistanceKm(userLocation.lat, userLocation.lng, toilet.coordinates.lat, toilet.coordinates.lng)
    : 0.3; // default approx if location disabled

  const walkingTimeMins = Math.max(1, Math.round(distanceKm * 12)); // approx 12 mins per km walking speed

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-hidden animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-[88dvh] sm:max-h-[90vh] my-auto text-black">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-yellow-400 border-b-4 border-black flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-black text-yellow-400 border-2 border-black">
              <Navigation className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-black uppercase tracking-tight">WALKING DIRECTIONS</h2>
              <p className="text-xs font-bold text-black uppercase">Route to {toilet.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-black bg-white hover:bg-black hover:text-white border-2 border-black font-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            title="Close Directions"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-black">
          
          {/* Quick Route Summary Box */}
          <div className="p-4 bg-zinc-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between uppercase font-black">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-yellow-400 text-black border-2 border-black">
                <Footprints className="w-6 h-6 stroke-[3]" />
              </div>
              <div>
                <p className="text-xs text-black">Estimated Walking Time</p>
                <p className="font-display font-black text-xl text-black">{walkingTimeMins} MIN WALK</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-black">Distance</p>
              <p className="font-display font-black text-lg text-black">{distanceKm} KM</p>
            </div>
          </div>

          {/* Destination Specs Card */}
          <div className="p-3.5 bg-zinc-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-1.5 text-xs uppercase font-black">
            <div className="flex items-center gap-1.5 text-black">
              <MapPin className="w-4 h-4 stroke-[3]" />
              <span>DESTINATION ADDRESS & FLOOR</span>
            </div>
            <p className="font-black text-black text-sm">{toilet.buildingName}</p>
            <p className="text-black bg-yellow-400 inline-block px-2 py-0.5 border border-black">📍 Floor Level: {toilet.floor}</p>
            <p className="text-black">🚪 Unit / Wing: {toilet.unitWing}</p>
          </div>

          {/* Step-by-Step Directions Checklist */}
          <div className="space-y-3 pt-1 uppercase font-black">
            <h3 className="font-black text-xs text-black tracking-wider">
              STEP-BY-STEP INDOOR ROUTE
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex gap-3 p-3 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <div className="w-6 h-6 bg-black text-yellow-400 font-black flex items-center justify-center shrink-0 border border-black">
                  1
                </div>
                <div>
                  <p className="font-black text-black">Head towards {toilet.buildingName}</p>
                  <p className="text-black font-semibold">Follow main pedestrian concourse towards the main entrance.</p>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <div className="w-6 h-6 bg-black text-yellow-400 font-black flex items-center justify-center shrink-0 border border-black">
                  2
                </div>
                <div>
                  <p className="font-black text-black">Navigate to {toilet.floor}</p>
                  <p className="text-black font-semibold">Use main elevator or escalator to reach floor level {toilet.floor}.</p>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <div className="w-6 h-6 bg-black text-yellow-400 font-black flex items-center justify-center shrink-0 border border-black">
                  3
                </div>
                <div>
                  <p className="font-black text-black">Proceed along corridor</p>
                  <p className="text-black font-semibold">{toilet.walkingDirectionsHint || toilet.unitWing}</p>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-yellow-400 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-black">
                <div className="w-6 h-6 bg-black text-white font-black flex items-center justify-center shrink-0 border border-black">
                  ✓
                </div>
                <div>
                  <p className="font-black text-black">Arrive at Restroom Entrance</p>
                  <p className="text-black font-semibold">
                    Look for the LooLocator badge. Cleanliness: ★{toilet.ratingCleanliness.toFixed(1)}. Enjoy your visit!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-3 bg-black text-white hover:bg-yellow-400 hover:text-black border-2 border-black font-black text-xs uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              CLOSE NAVIGATION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
