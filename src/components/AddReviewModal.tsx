import React, { useState } from 'react';
import { ToiletLocation, Review, BidetType, ClosetType, SoapStatus } from '../types';
import { X, Star, Send, ShieldCheck, UserCheck } from 'lucide-react';

interface AddReviewModalProps {
  toilet: ToiletLocation;
  onClose: () => void;
  onSubmitReview: (review: Omit<Review, 'id' | 'createdAt' | 'helpfulCount'>) => void;
}

export const AddReviewModal: React.FC<AddReviewModalProps> = ({
  toilet,
  onClose,
  onSubmitReview,
}) => {
  const [genderSection, setGenderSection] = useState<'Female' | 'Male' | 'Unisex'>('Female');
  const [ratingCleanliness, setRatingCleanliness] = useState<number>(5);
  const [ratingAccessibility, setRatingAccessibility] = useState<number>(5);
  const [bidetType, setBidetType] = useState<BidetType>(toilet.bidetType);
  const [closetType, setClosetType] = useState<ClosetType>(toilet.closetType);
  const [soapStatus, setSoapStatus] = useState<SoapStatus>(toilet.soapStatus);
  const [isWet, setIsWet] = useState<boolean>(toilet.wetDry === 'wet');
  const [comment, setComment] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMsg('Please write a brief comment about your experience.');
      return;
    }

    onSubmitReview({
      toiletId: toilet.id,
      genderSection,
      ratingCleanliness,
      ratingAccessibility,
      bidetType,
      closetType,
      soapStatus,
      isWet,
      comment: comment.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-hidden animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-[90vh] my-auto text-black">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-yellow-400 border-b-4 border-black flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-display font-black text-lg text-black uppercase tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 stroke-[3]" />
              <span>ANONYMOUS REVIEW SUBMISSION</span>
            </h2>
            <p className="text-xs font-bold text-black uppercase truncate max-w-xs">{toilet.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-black bg-white hover:bg-black hover:text-white border-2 border-black font-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            title="Close Review Modal"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-black">
          {errorMsg && (
            <div className="p-3 bg-red-500 border-2 border-black text-white text-xs font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              ERROR: {errorMsg}
            </div>
          )}

          {/* Anonymous Info Banner */}
          <div className="p-3 bg-zinc-100 border-2 border-black text-xs font-bold uppercase flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <UserCheck className="w-5 h-5 shrink-0 text-black stroke-[3]" />
            <div>
              <p className="font-black text-black">100% ANONYMOUS RATING</p>
              <p className="text-[10px] text-zinc-600">Your review is completely anonymous (no name required).</p>
            </div>
          </div>

          {/* Gender Restroom Section Selector */}
          <div className="p-3 bg-zinc-100 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-1.5">
            <span className="text-xs font-black uppercase text-black block">RESTROOM SECTION VISITED *</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setGenderSection('Female')}
                className={`py-2 text-xs font-black border-2 border-black uppercase transition-all flex items-center justify-center gap-1 ${
                  genderSection === 'Female'
                    ? 'bg-pink-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-black hover:bg-zinc-200'
                }`}
              >
                <span>♀ FEMALE</span>
              </button>
              <button
                type="button"
                onClick={() => setGenderSection('Male')}
                className={`py-2 text-xs font-black border-2 border-black uppercase transition-all flex items-center justify-center gap-1 ${
                  genderSection === 'Male'
                    ? 'bg-blue-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-black hover:bg-zinc-200'
                }`}
              >
                <span>♂ MALE</span>
              </button>
              <button
                type="button"
                onClick={() => setGenderSection('Unisex')}
                className={`py-2 text-xs font-black border-2 border-black uppercase transition-all flex items-center justify-center gap-1 ${
                  genderSection === 'Unisex'
                    ? 'bg-purple-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-black hover:bg-zinc-200'
                }`}
              >
                <span>🚻 UNISEX</span>
              </button>
            </div>
          </div>

          {/* Cleanliness Rating Selector */}
          <div className="p-3 bg-zinc-100 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-1.5">
            <div className="flex justify-between items-center text-xs font-black uppercase">
              <span className="text-black">CLEANLINESS RATING *</span>
              <span className="text-black">{ratingCleanliness} / 5 STARS</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingCleanliness(star)}
                  className={`flex-1 py-2 text-xs font-black border-2 border-black uppercase transition-all flex items-center justify-center gap-1 ${
                    ratingCleanliness >= star
                      ? 'bg-yellow-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-zinc-400 hover:text-black'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-black stroke-[2]" />
                  <span>{star}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility Rating Selector */}
          <div className="p-3 bg-zinc-100 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-1.5">
            <div className="flex justify-between items-center text-xs font-black uppercase">
              <span className="text-black">ACCESSIBILITY RATING *</span>
              <span className="text-black">{ratingAccessibility} / 5 STARS</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingAccessibility(star)}
                  className={`flex-1 py-2 text-xs font-black border-2 border-black uppercase transition-all flex items-center justify-center gap-1 ${
                    ratingAccessibility >= star
                      ? 'bg-blue-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-zinc-400 hover:text-black'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-white stroke-[2]" />
                  <span>{star}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Specs Selectors */}
          <div className="grid grid-cols-2 gap-3 text-xs uppercase font-black">
            {/* Bidet Type Observed */}
            <div className="space-y-1">
              <label className="text-black">Bidet Present</label>
              <select
                value={bidetType}
                onChange={(e) => setBidetType(e.target.value as BidetType)}
                className="w-full px-3 py-2 bg-white border-2 border-black text-black text-xs font-bold uppercase focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <option value="washlet">Electronic Washlet</option>
                <option value="jet_spray">Jet Spray Hose</option>
                <option value="gayung">Water Pitcher / Gayung</option>
                <option value="none">No Bidet / Paper Only</option>
              </select>
            </div>

            {/* Closet Type Observed */}
            <div className="space-y-1">
              <label className="text-black">Closet Type</label>
              <select
                value={closetType}
                onChange={(e) => setClosetType(e.target.value as ClosetType)}
                className="w-full px-3 py-2 bg-white border-2 border-black text-black text-xs font-bold uppercase focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <option value="duduk">Sitting (Duduk)</option>
                <option value="jongkok">Squatting (Jongkok)</option>
                <option value="both">Both Available</option>
              </select>
            </div>
          </div>

          {/* Soap & Floor State */}
          <div className="grid grid-cols-2 gap-3 text-xs uppercase font-black">
            <div className="space-y-1">
              <label className="text-black">Soap Availability</label>
              <select
                value={soapStatus}
                onChange={(e) => setSoapStatus(e.target.value as SoapStatus)}
                className="w-full px-3 py-2 bg-white border-2 border-black text-black text-xs font-bold uppercase focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <option value="always">Soap Stocked</option>
                <option value="sanitizer">Sanitizer Only</option>
                <option value="sometimes">Often Empty</option>
                <option value="none">No Soap</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-black">Floor State</label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsWet(false)}
                  className={`flex-1 py-2 border-2 border-black text-xs font-black uppercase transition-all ${
                    !isWet
                      ? 'bg-yellow-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-zinc-400'
                  }`}
                >
                  Dry Floor
                </button>
                <button
                  type="button"
                  onClick={() => setIsWet(true)}
                  className={`flex-1 py-2 border-2 border-black text-xs font-black uppercase transition-all ${
                    isWet
                      ? 'bg-blue-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-zinc-400'
                  }`}
                >
                  Wet Floor
                </button>
              </div>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-black">ANONYMOUS REVIEW & OBSERVATIONS *</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Write details on cleanliness, stall space, water pressure, or locks..."
              className="w-full p-3 bg-white border-2 border-black text-sm font-medium text-black placeholder-zinc-400 focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              required
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-black text-white hover:bg-yellow-400 hover:text-black border-2 border-black font-black text-xs uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 stroke-[3]" />
              <span>SUBMIT ANONYMOUS REVIEW</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

