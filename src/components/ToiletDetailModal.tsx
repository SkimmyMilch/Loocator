import React, { useState } from 'react';
import { ToiletLocation, Review, UserLocation } from '../types';
import { getBidetLabel, getClosetLabel, getSoapLabel, getWetDryLabel } from '../utils/formatters';
import { calculateDistanceKm } from '../services/storageService';
import {
  X, Star, ShieldCheck, ShieldAlert, MapPin, Navigation, Compass, CheckCircle2,
  XCircle, MessageSquare, Plus, UserCheck, Trash2
} from 'lucide-react';

interface ToiletDetailModalProps {
  toilet: ToiletLocation;
  reviews: Review[];
  onClose: () => void;
  onOpenAddReviewModal: () => void;
  onGetDirections: (toilet: ToiletLocation) => void;
  isAdmin: boolean;
  onAdminToggleVerify: (toiletId: string, isVerified: boolean, note?: string) => void;
  onDeleteStation?: (toiletId: string) => void;
  userLocation: UserLocation | null;
}

export const ToiletDetailModal: React.FC<ToiletDetailModalProps> = ({
  toilet,
  reviews,
  onClose,
  onOpenAddReviewModal,
  onGetDirections,
  isAdmin,
  onAdminToggleVerify,
  onDeleteStation,
  userLocation,
}) => {
  const [adminNoteInput, setAdminNoteInput] = useState(toilet.adminNote || '');

  const toiletReviews = reviews.filter((r) => r.toiletId === toilet.id);
  const distanceKm = userLocation
    ? calculateDistanceKm(userLocation.lat, userLocation.lng, toilet.coordinates.lat, toilet.coordinates.lng)
    : null;

  const bidetInfo = getBidetLabel(toilet.bidetType);
  const closetInfo = getClosetLabel(toilet.closetType);
  const soapInfo = getSoapLabel(toilet.soapStatus);
  const wetDryInfo = getWetDryLabel(toilet.wetDry);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-hidden animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-[88dvh] sm:max-h-[92vh] my-auto">
        
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 bg-yellow-400 border-b-4 border-black flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {toilet.isVerified ? (
                <div className="bg-black text-yellow-400 border-2 border-black px-2.5 py-1 text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <ShieldCheck className="w-4 h-4 stroke-[3]" />
                  <span>VERIFIED STATION</span>
                </div>
              ) : (
                <div className="bg-white text-black border-2 border-black px-2.5 py-1 text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <ShieldAlert className="w-4 h-4 stroke-[3]" />
                  <span>UNVERIFIED</span>
                </div>
              )}
              <span className="bg-black text-white border-2 border-black px-2 py-0.5 text-xs font-black uppercase">
                {toilet.placeType}
              </span>
            </div>

            <h2 className="font-display font-black text-xl sm:text-2xl text-black uppercase tracking-tight truncate">
              {toilet.name}
            </h2>
            <p className="text-xs font-black text-black uppercase tracking-wide flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-4 h-4 shrink-0 stroke-[3]" />
              <span>{toilet.buildingName} - LEVEL {toilet.floor}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-black text-white border-2 border-black px-3 py-1.5 text-sm font-black uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 stroke-[2]" />
              <span>{toilet.ratingCleanliness.toFixed(1)}</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 bg-white hover:bg-black hover:text-white text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <X className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-white text-black">
          
          {/* Admin Verification Control Box */}
          {isAdmin && (
            <div className="p-4 bg-yellow-300 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-black font-black text-xs uppercase">
                  <ShieldCheck className="w-4 h-4 stroke-[3]" />
                  <span>ADMIN VERIFICATION PANEL</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      onAdminToggleVerify(toilet.id, !toilet.isVerified, adminNoteInput);
                    }}
                    className={`px-3 py-1 border-2 border-black text-xs font-black uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                      toilet.isVerified
                        ? 'bg-zinc-800 text-white hover:bg-black'
                        : 'bg-black text-white hover:bg-yellow-400 hover:text-black'
                    }`}
                  >
                    {toilet.isVerified ? 'REVOKE STATUS' : 'GRANT STATUS'}
                  </button>

                  {onDeleteStation && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to PERMANENTLY DELETE station "${toilet.name}"?`)) {
                          onDeleteStation(toilet.id);
                          onClose();
                        }
                      }}
                      className="px-3 py-1 bg-red-600 text-white border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-black transition-all flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[3]" />
                      <span>DELETE</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Admin Note Input */}
              <div className="flex flex-col gap-1 text-xs font-bold uppercase">
                <label className="text-black">Official Admin Note:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={adminNoteInput}
                    onChange={(e) => setAdminNoteInput(e.target.value)}
                    placeholder="e.g. Inspected and confirmed clean."
                    className="flex-1 px-3 py-1.5 bg-white border-2 border-black text-black text-xs font-bold uppercase focus:outline-none focus:bg-yellow-100"
                  />
                  <button
                    onClick={() => {
                      onAdminToggleVerify(toilet.id, toilet.isVerified, adminNoteInput);
                    }}
                    className="px-3 py-1.5 bg-black text-white font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 hover:text-black shrink-0"
                  >
                    SAVE NOTE
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Exact Location & Floor Details Box */}
          <div className="p-4 bg-zinc-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-2">
            <div className="flex items-center justify-between text-xs font-black uppercase text-black border-b-2 border-black pb-2">
              <span className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 stroke-[3]" />
                <span>LOCATION DETAILS</span>
              </span>
              {distanceKm !== null && <span>{distanceKm} KM AWAY</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs uppercase font-bold">
              <div>
                <p className="text-[10px] text-zinc-500 font-black">Building / Facility</p>
                <p className="font-black text-black text-sm">{toilet.buildingName}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 font-black">Floor Level</p>
                <p className="font-black text-blue-600 text-sm">LEVEL {toilet.floor}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-[10px] text-zinc-500 font-black">Unit / Wing / Corridor</p>
                <p className="font-black text-black">{toilet.unitWing}</p>
              </div>
              {toilet.walkingDirectionsHint && (
                <div className="sm:col-span-2 bg-white p-2.5 border-2 border-black text-xs font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="font-black text-blue-600">DIRECTIONS TIP: </span>
                  {toilet.walkingDirectionsHint}
                </div>
              )}
            </div>
          </div>

          {/* Gender Section Ratings Breakdown Box */}
          <div className="p-4 bg-zinc-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-2.5">
            <div className="flex items-center justify-between text-xs font-black uppercase text-black border-b-2 border-black pb-2">
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-black stroke-[2]" />
                <span>GENDER SECTION RATINGS</span>
              </span>
              <span className="text-[10px] text-zinc-600">SPECIFIC SECTION RATINGS</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-pink-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-pink-900 uppercase">FEMALE RESTROOM</p>
                  <p className="text-xs font-bold text-pink-950">
                    {toilet.ratingFemale !== undefined
                      ? toilet.ratingFemale >= 4.0 ? 'Decent / Clean' : toilet.ratingFemale <= 2.0 ? 'Needs Attention' : 'Moderate'
                      : 'No Ratings'}
                  </p>
                </div>
                <div className={`px-2.5 py-1 border-2 border-black font-black text-sm shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                  toilet.ratingFemale !== undefined && toilet.ratingFemale >= 4.0
                    ? 'bg-emerald-400 text-black'
                    : toilet.ratingFemale !== undefined && toilet.ratingFemale <= 2.0
                    ? 'bg-red-500 text-white'
                    : 'bg-yellow-400 text-black'
                }`}>
                  {toilet.ratingFemale ? toilet.ratingFemale.toFixed(1) : 'N/A'}
                </div>
              </div>

              <div className="p-3 bg-blue-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-blue-900 uppercase">MALE RESTROOM</p>
                  <p className="text-xs font-bold text-blue-950">
                    {toilet.ratingMale !== undefined
                      ? toilet.ratingMale >= 4.0 ? 'Decent / Clean' : toilet.ratingMale <= 2.0 ? 'Needs Attention' : 'Moderate'
                      : 'No Ratings'}
                  </p>
                </div>
                <div className={`px-2.5 py-1 border-2 border-black font-black text-sm shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                  toilet.ratingMale !== undefined && toilet.ratingMale >= 4.0
                    ? 'bg-emerald-400 text-black'
                    : toilet.ratingMale !== undefined && toilet.ratingMale <= 2.0
                    ? 'bg-red-500 text-white'
                    : 'bg-yellow-400 text-black'
                }`}>
                  {toilet.ratingMale ? toilet.ratingMale.toFixed(1) : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onGetDirections(toilet)}
              className="py-3 px-4 bg-black text-white hover:bg-yellow-400 hover:text-black border-2 border-black font-black text-xs uppercase flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <Navigation className="w-4 h-4 stroke-[3]" />
              <span>GET DIRECTIONS</span>
            </button>

            <button
              onClick={onOpenAddReviewModal}
              className="py-3 px-4 bg-yellow-400 text-black hover:bg-yellow-300 border-2 border-black font-black text-xs uppercase flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>WRITE REVIEW</span>
            </button>
          </div>

          {/* Specifications Matrix Grid */}
          <div className="space-y-3">
            <h3 className="font-display font-black text-xs text-black uppercase tracking-wider">
              FACILITIES & SPECIFICATIONS
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              
              {/* Closet Type */}
              <div className="p-3 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-1">
                <p className="text-[10px] font-black uppercase text-zinc-500">Closet Type</p>
                <p className="font-black text-xs text-black uppercase">{closetInfo.label}</p>
              </div>

              {/* Bidet Type */}
              <div className="p-3 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-1">
                <p className="text-[10px] font-black uppercase text-zinc-500">Bidet Spray</p>
                <p className="font-black text-xs text-black uppercase">{bidetInfo.label}</p>
              </div>

              {/* Soap Availability */}
              <div className="p-3 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-1">
                <p className="text-[10px] font-black uppercase text-zinc-500">Soap Status</p>
                <p className="font-black text-xs text-black uppercase">{soapInfo.label}</p>
              </div>

              {/* Wet / Dry */}
              <div className="p-3 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-1">
                <p className="text-[10px] font-black uppercase text-zinc-500">Floor State</p>
                <p className="font-black text-xs text-black uppercase">{wetDryInfo.label}</p>
              </div>

              {/* Pricing / Fee */}
              <div className="p-3 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-1">
                <p className="text-[10px] font-black uppercase text-zinc-500">Cost / Fee</p>
                <p className="font-black text-xs text-black uppercase">
                  {toilet.isPaid ? toilet.costText || 'Paid' : 'Free Entry'}
                </p>
              </div>

              {/* Accessibility Score */}
              <div className="p-3 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-1">
                <p className="text-[10px] font-black uppercase text-zinc-500">Accessibility Score</p>
                <p className="font-black text-xs text-black uppercase">{toilet.ratingAccessibility.toFixed(1)} / 5.0</p>
              </div>
            </div>
          </div>

          {/* Accessibility Checklist Features */}
          <div className="p-3.5 bg-zinc-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-2">
            <p className="text-xs font-black uppercase text-black flex items-center gap-1.5">
              <span>ACCESSIBILITY CHECKLIST</span>
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold uppercase">
              <div className="flex items-center gap-1.5">
                {toilet.accessibilityFeatures.wheelchairStall ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 stroke-[3] shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-zinc-400 stroke-[3] shrink-0" />
                )}
                <span className={toilet.accessibilityFeatures.wheelchairStall ? 'text-black font-black' : 'text-zinc-400 line-through'}>
                  Wheelchair Stall
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {toilet.accessibilityFeatures.grabBars ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 stroke-[3] shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-zinc-400 stroke-[3] shrink-0" />
                )}
                <span className={toilet.accessibilityFeatures.grabBars ? 'text-black font-black' : 'text-zinc-400 line-through'}>
                  Safety Grab Bars
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {toilet.accessibilityFeatures.stepFreeAccess ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 stroke-[3] shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-zinc-400 stroke-[3] shrink-0" />
                )}
                <span className={toilet.accessibilityFeatures.stepFreeAccess ? 'text-black font-black' : 'text-zinc-400 line-through'}>
                  Step-free Ramp
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {toilet.hasBabyChanging ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 stroke-[3] shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-zinc-400 stroke-[3] shrink-0" />
                )}
                <span className={toilet.hasBabyChanging ? 'text-black font-black' : 'text-zinc-400 line-through'}>
                  Baby Changing Table
                </span>
              </div>
            </div>
          </div>

          {/* User Reviews Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-xs text-black uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 stroke-[3]" />
                <span>ANONYMOUS USER REVIEWS ({toiletReviews.length})</span>
              </h3>
              <button
                onClick={onOpenAddReviewModal}
                className="text-xs font-black uppercase text-blue-600 hover:underline"
              >
                + WRITE REVIEW
              </button>
            </div>

            {toiletReviews.length === 0 ? (
              <div className="p-6 text-center bg-zinc-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-2">
                <p className="text-xs font-black uppercase text-black">NO REVIEWS YET FOR THIS STATION.</p>
                <button
                  onClick={onOpenAddReviewModal}
                  className="px-4 py-2 bg-yellow-400 text-black border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-300 transition-all"
                >
                  BE THE FIRST TO REVIEW!
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {toiletReviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {rev.genderSection === 'Female' && (
                          <span className="px-2 py-0.5 bg-pink-100 text-pink-900 border-2 border-black text-[10px] font-black uppercase">
                            FEMALE RESTROOM
                          </span>
                        )}
                        {rev.genderSection === 'Male' && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-900 border-2 border-black text-[10px] font-black uppercase">
                            MALE RESTROOM
                          </span>
                        )}
                        {rev.genderSection === 'Unisex' && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-900 border-2 border-black text-[10px] font-black uppercase">
                            🚻 UNISEX RESTROOM
                          </span>
                        )}
                        {!rev.genderSection && (
                          <span className="px-2 py-0.5 bg-zinc-200 text-black border-2 border-black text-[10px] font-black uppercase">
                            ANONYMOUS REVIEW
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 bg-yellow-400 text-black border border-black font-black uppercase">
                          CLEAN {rev.ratingCleanliness}/5
                        </span>
                        <span className="text-[10px] px-2 py-0.5 bg-blue-600 text-white border border-black font-black uppercase">
                          ACC {rev.ratingAccessibility}/5
                        </span>
                      </div>
                    </div>

                    <p className="text-xs font-medium text-black">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

