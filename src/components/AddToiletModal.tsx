import React, { useState } from 'react';
import { ToiletLocation, BidetType, ClosetType, SoapStatus, WetDryType } from '../types';
import { X, MapPin, Plus, Building, ShieldCheck } from 'lucide-react';

interface AddToiletModalProps {
  initialCoords?: { lat: number; lng: number } | null;
  onClose: () => void;
  onSubmitToilet: (toiletData: Omit<ToiletLocation, 'id' | 'createdAt' | 'updatedAt' | 'totalReviews' | 'ratingCleanliness' | 'ratingAccessibility'>) => void;
}

export const AddToiletModal: React.FC<AddToiletModalProps> = ({
  initialCoords,
  onClose,
  onSubmitToilet,
}) => {
  const [name, setName] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [floor, setFloor] = useState('');
  const [unitWing, setUnitWing] = useState('');
  const [placeType, setPlaceType] = useState<ToiletLocation['placeType']>('Shopping Mall');

  const [lat, setLat] = useState<number>(initialCoords?.lat ?? -6.1953);
  const [lng, setLng] = useState<number>(initialCoords?.lng ?? 106.8208);

  const [closetType, setClosetType] = useState<ClosetType>('duduk');
  const [bidetType, setBidetType] = useState<BidetType>('jet_spray');
  const [wetDry, setWetDry] = useState<WetDryType>('dry');
  const [soapStatus, setSoapStatus] = useState<SoapStatus>('always');

  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [costText, setCostText] = useState<string>('Free');
  const [paymentMethodsStr, setPaymentMethodsStr] = useState<string>('QRIS, Cash');

  // Accessibility
  const [wheelchairStall, setWheelchairStall] = useState(true);
  const [grabBars, setGrabBars] = useState(true);
  const [stepFreeAccess, setStepFreeAccess] = useState(true);
  const [elevatorNearby, setElevatorNearby] = useState(true);

  // Extras
  const [hasBabyChanging, setHasBabyChanging] = useState(false);
  const [hasTissuePaper, setHasTissuePaper] = useState(true);
  const [hasHandDryer, setHasHandDryer] = useState(true);

  const [walkingDirectionsHint, setWalkingDirectionsHint] = useState('');

  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter toilet name');
      return;
    }
    if (!buildingName.trim()) {
      setError('Please enter building name');
      return;
    }
    if (!floor.trim()) {
      setError('Please enter floor level');
      return;
    }
    if (!unitWing.trim()) {
      setError('Please enter exact unit or wing description');
      return;
    }

    const paymentMethods = paymentMethodsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    onSubmitToilet({
      name: name.trim(),
      buildingName: buildingName.trim(),
      floor: floor.trim(),
      unitWing: unitWing.trim(),
      placeType,
      coordinates: { lat, lng },
      bidetType,
      closetType,
      wetDry,
      soapStatus,
      isPaid,
      costText: isPaid ? costText.trim() : 'Free',
      paymentMethods: isPaid ? paymentMethods : [],
      accessibilityFeatures: {
        wheelchairStall,
        grabBars,
        stepFreeAccess,
        elevatorNearby,
        wideDoorway: wheelchairStall,
        brailleSignage: false,
      },
      hasBabyChanging,
      hasTissuePaper,
      hasHandDryer,
      genderTypes: ['Male', 'Female', 'Family / Accessible'],
      isVerified: false,
      coverImage: '',
      images: [],
      walkingDirectionsHint: walkingDirectionsHint.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-hidden animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-[88dvh] sm:max-h-[90vh] my-auto text-black">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-yellow-400 border-b-4 border-black flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-black text-yellow-400 border-2 border-black">
              <MapPin className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-black uppercase tracking-tight">ADD NEW TOILET STATION</h2>
              <p className="text-xs font-bold text-black uppercase">Pin exact building, floor, unit, bidet & fee details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-black bg-white hover:bg-black hover:text-white border-2 border-black font-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            title="Close Modal"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-black">
          {error && (
            <div className="p-3 bg-red-500 border-2 border-black text-white text-xs font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              ERROR: {error}
            </div>
          )}

          {/* Location & Building Info */}
          <div className="p-4 bg-zinc-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-black uppercase tracking-wider">
              <Building className="w-4 h-4 stroke-[3]" />
              <span>BUILDING & LOCATION DETAILS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs uppercase font-black">
              <div className="space-y-1">
                <label className="text-black">Toilet Listing Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. West Mall L3 Executive Restroom"
                  className="w-full px-3 py-2 bg-white border-2 border-black text-black text-xs font-bold uppercase focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-black">Building / Facility Name *</label>
                <input
                  type="text"
                  value={buildingName}
                  onChange={(e) => setBuildingName(e.target.value)}
                  placeholder="e.g. Grand Indonesia Mall"
                  className="w-full px-3 py-2 bg-white border-2 border-black text-black text-xs font-bold uppercase focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-black">Floor Level *</label>
                <input
                  type="text"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="e.g. 3rd Floor (L3) or Concourse B1"
                  className="w-full px-3 py-2 bg-white border-2 border-black text-black text-xs font-bold uppercase focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-black">Place Type</label>
                <select
                  value={placeType}
                  onChange={(e) => setPlaceType(e.target.value as ToiletLocation['placeType'])}
                  className="w-full px-3 py-2 bg-white border-2 border-black text-black text-xs font-bold uppercase focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <option value="Shopping Mall">Shopping Mall</option>
                  <option value="Transit Station">Transit Station / MRT / Train</option>
                  <option value="Gas Station">Gas Station (SPBU)</option>
                  <option value="Public Park">Public Park</option>
                  <option value="Office Building">Office Building</option>
                  <option value="Restaurant & Cafe">Restaurant & Cafe</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-black">Exact Wing / Unit / Corridor *</label>
                <input
                  type="text"
                  value={unitWing}
                  onChange={(e) => setUnitWing(e.target.value)}
                  placeholder="e.g. West Wing, behind Zara, next to Service Elevator 2"
                  className="w-full px-3 py-2 bg-white border-2 border-black text-black text-xs font-bold uppercase focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  required
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-black">Walking Navigation Tip (Optional)</label>
                <input
                  type="text"
                  value={walkingDirectionsHint}
                  onChange={(e) => setWalkingDirectionsHint(e.target.value)}
                  placeholder="e.g. Take escalator near Starbucks up to 3rd floor, turn left past Zara."
                  className="w-full px-3 py-2 bg-white border-2 border-black text-black text-xs font-bold uppercase focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>
            </div>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-3 text-xs uppercase font-black">
            <div className="space-y-1">
              <label className="text-black">Latitude</label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-white border-2 border-black text-black font-mono text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-black">Longitude</label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-white border-2 border-black text-black font-mono text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>
          </div>

          {/* Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs uppercase font-black">
            <div className="space-y-1">
              <label className="text-black">Closet Type</label>
              <select
                value={closetType}
                onChange={(e) => setClosetType(e.target.value as ClosetType)}
                className="w-full px-2.5 py-2 bg-white border-2 border-black text-black text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <option value="duduk">Sitting (Duduk)</option>
                <option value="jongkok">Squatting (Jongkok)</option>
                <option value="both">Both Available</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-black">Bidet Spray</label>
              <select
                value={bidetType}
                onChange={(e) => setBidetType(e.target.value as BidetType)}
                className="w-full px-2.5 py-2 bg-white border-2 border-black text-black text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <option value="washlet">Electronic Washlet</option>
                <option value="jet_spray">Jet Spray Hose</option>
                <option value="gayung">Water Pitcher / Gayung</option>
                <option value="none">No Bidet / Paper Only</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-black">Floor State</label>
              <select
                value={wetDry}
                onChange={(e) => setWetDry(e.target.value as WetDryType)}
                className="w-full px-2.5 py-2 bg-white border-2 border-black text-black text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <option value="dry">Dry Floor</option>
                <option value="wet">Wet Floor</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-black">Soap Status</label>
              <select
                value={soapStatus}
                onChange={(e) => setSoapStatus(e.target.value as SoapStatus)}
                className="w-full px-2.5 py-2 bg-white border-2 border-black text-black text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <option value="always">Always Stocked</option>
                <option value="sanitizer">Sanitizer Only</option>
                <option value="sometimes">Often Empty</option>
                <option value="none">No Soap</option>
              </select>
            </div>
          </div>

          {/* Pricing & Fee Section */}
          <div className="p-3.5 bg-zinc-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-2 text-xs uppercase font-black">
            <div className="flex items-center justify-between">
              <span className="text-black font-black">ENTRY FEE & PAYMENT</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPaid(false);
                    setCostText('Free');
                  }}
                  className={`px-3 py-1 border-2 border-black font-black uppercase transition-all ${
                    !isPaid ? 'bg-yellow-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-zinc-400'
                  }`}
                >
                  Free
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPaid(true);
                    if (costText === 'Free') setCostText('Rp 2,000');
                  }}
                  className={`px-3 py-1 border-2 border-black font-black uppercase transition-all ${
                    isPaid ? 'bg-yellow-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-zinc-400'
                  }`}
                >
                  Paid Entry
                </button>
              </div>
            </div>

            {isPaid && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-black font-black">Cost / Price Tag</label>
                  <input
                    type="text"
                    value={costText}
                    onChange={(e) => setCostText(e.target.value)}
                    placeholder="e.g. Rp 2,000 or $0.50"
                    className="w-full px-3 py-1.5 bg-white border-2 border-black text-black text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-black font-black">Payment Methods</label>
                  <input
                    type="text"
                    value={paymentMethodsStr}
                    onChange={(e) => setPaymentMethodsStr(e.target.value)}
                    placeholder="e.g. QRIS, Cash, Card"
                    className="w-full px-3 py-1.5 bg-white border-2 border-black text-black text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Accessibility Feature Toggles */}
          <div className="p-3.5 bg-zinc-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-2 text-xs uppercase font-black">
            <span className="text-black">ACCESSIBILITY & AMENITIES CHECKLIST</span>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wheelchairStall}
                  onChange={(e) => setWheelchairStall(e.target.checked)}
                  className="w-4 h-4 border-2 border-black rounded-none text-black focus:ring-0"
                />
                <span className="text-black">Wheelchair Stall</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={grabBars}
                  onChange={(e) => setGrabBars(e.target.checked)}
                  className="w-4 h-4 border-2 border-black rounded-none text-black focus:ring-0"
                />
                <span className="text-black">Grab Bars</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stepFreeAccess}
                  onChange={(e) => setStepFreeAccess(e.target.checked)}
                  className="w-4 h-4 border-2 border-black rounded-none text-black focus:ring-0"
                />
                <span className="text-black">Step-free Access</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasBabyChanging}
                  onChange={(e) => setHasBabyChanging(e.target.checked)}
                  className="w-4 h-4 border-2 border-black rounded-none text-black focus:ring-0"
                />
                <span className="text-black">Baby Changing Table</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-black text-white hover:bg-yellow-400 hover:text-black border-2 border-black font-black text-xs uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>PUBLISH TOILET LOCATION</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

