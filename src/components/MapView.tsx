import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ToiletLocation, MapTileStyle, UserLocation } from '../types';
import { Crosshair, Plus, Minus, Layers, Check } from 'lucide-react';

interface MapViewProps {
  toilets: ToiletLocation[];
  selectedToiletId: string | null;
  onSelectToilet: (toilet: ToiletLocation) => void;
  tileStyle: MapTileStyle;
  onChangeTileStyle?: (style: MapTileStyle) => void;
  isAddPinMode: boolean;
  onPinDropped?: (coords: { lat: number; lng: number }) => void;
  tempPinCoords?: { lat: number; lng: number } | null;
  userLocation: UserLocation | null;
  activeRouteDestination: ToiletLocation | null;
  onLocateMe?: () => void;
}

const TILE_URLS: Record<MapTileStyle, { url: string; attribution: string }> = {
  standard: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  satellite: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  outdoors: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
};

// Helper to validate coordinates before passing to Leaflet
const isValidLat = (num: any): num is number =>
  typeof num === 'number' && !isNaN(num) && isFinite(num) && num >= -90 && num <= 90;

const isValidLng = (num: any): num is number =>
  typeof num === 'number' && !isNaN(num) && isFinite(num) && num >= -180 && num <= 180;

export const MapView: React.FC<MapViewProps> = ({
  toilets,
  selectedToiletId,
  onSelectToilet,
  tileStyle,
  onChangeTileStyle,
  isAddPinMode,
  onPinDropped,
  tempPinCoords,
  userLocation,
  activeRouteDestination,
  onLocateMe,
}) => {
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
  const tempPinMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center: Jakarta Pusat (Grand Indonesia area)
    const initialLat = (userLocation && isValidLat(userLocation.lat)) ? userLocation.lat : -6.1953;
    const initialLng = (userLocation && isValidLng(userLocation.lng)) ? userLocation.lng : 106.8208;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 15,
      zoomControl: false,
    });

    const config = TILE_URLS[tileStyle] || TILE_URLS.standard;
    tileLayerRef.current = L.tileLayer(config.url, {
      maxZoom: 19,
      attribution: config.attribution,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Attach ResizeObserver to invalidate map size when container resizes
    const observer = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    if (mapContainerRef.current) {
      observer.observe(mapContainerRef.current);
    }

    return () => {
      observer.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Tile Style changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const config = TILE_URLS[tileStyle] || TILE_URLS.standard;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    tileLayerRef.current = L.tileLayer(config.url, {
      maxZoom: 19,
      attribution: config.attribution,
    }).addTo(mapInstanceRef.current);
  }, [tileStyle]);

  // Handle Map Click (Add pin mode or deselect)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isAddPinMode) {
        const { lat, lng } = e.latlng;
        if (onPinDropped) {
          onPinDropped({ lat, lng });
        }
      } else {
        onSelectToilet(null);
      }
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [isAddPinMode, onPinDropped, onSelectToilet]);

  // Handle temporary dropped pin marker visibility and position updates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!tempPinCoords || !isValidLat(tempPinCoords.lat) || !isValidLng(tempPinCoords.lng)) {
      if (tempPinMarkerRef.current) {
        map.removeLayer(tempPinMarkerRef.current);
        tempPinMarkerRef.current = null;
      }
    } else {
      if (!tempPinMarkerRef.current) {
        const icon = L.divIcon({
          className: 'custom-pin-add',
          html: `
            <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-1/2">
              <div class="bg-yellow-400 text-black font-black px-3 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black text-xs uppercase animate-bounce">
                NEW STATION PIN
              </div>
              <div class="w-6 h-6 bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-0.5"></div>
            </div>
          `,
          iconSize: [0, 0],
        });

        const tempMarker = L.marker([tempPinCoords.lat, tempPinCoords.lng], { icon, draggable: true }).addTo(map);
        tempPinMarkerRef.current = tempMarker;

        tempMarker.on('dragend', (event) => {
          const marker = event.target;
          const position = marker.getLatLng();
          if (onPinDropped && isValidLat(position.lat) && isValidLng(position.lng)) {
            onPinDropped({ lat: position.lat, lng: position.lng });
          }
        });
      } else {
        tempPinMarkerRef.current.setLatLng([tempPinCoords.lat, tempPinCoords.lng]);
      }
    }
  }, [tempPinCoords, onPinDropped]);

  // Handle Toilet Markers Update - Simplified Square Pins with Color Coding
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const currentToiletIds = new Set(toilets.map((t) => t.id));
    markersRef.current.forEach((marker, id) => {
      if (!currentToiletIds.has(id)) {
        map.removeLayer(marker);
        markersRef.current.delete(id);
      }
    });

    toilets.forEach((toilet) => {
      if (!toilet || !toilet.coordinates || !isValidLat(toilet.coordinates.lat) || !isValidLng(toilet.coordinates.lng)) {
        return;
      }

      const isSelected = toilet.id === selectedToiletId;
      
      // Pin Color Code Rules:
      // 1. Blue [verified AND high-rated >= 4.5]
      // 2. Green [high-rated >= 4.0 that are unverified]
      // 3. Yellow [moderate rating 2.1 - 3.9]
      // 4. Red [low rating <= 2.0]
      let pinBgColor = 'bg-yellow-400 text-black';
      if (toilet.isVerified && toilet.ratingCleanliness >= 4.5) {
        pinBgColor = 'bg-blue-600 text-white';
      } else if (toilet.ratingCleanliness >= 4.0) {
        pinBgColor = 'bg-emerald-500 text-black';
      } else if (toilet.ratingCleanliness > 2.0) {
        pinBgColor = 'bg-yellow-400 text-black';
      } else {
        pinBgColor = 'bg-red-600 text-white';
      }

      const scaleClass = isSelected ? 'scale-125 z-50' : 'hover:scale-110';
      const selectionRing = isSelected ? 'ring-4 ring-black ring-offset-2 ring-offset-white' : '';

      const customHtml = `
        <div class="relative cursor-pointer transition-transform duration-200 -translate-x-1/2 -translate-y-1/2 ${scaleClass}">
          <div class="w-9 h-9 ${pinBgColor} border-2 border-black font-black text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${selectionRing} flex items-center justify-center select-none text-center">
            <span class="text-sm font-black leading-none">${toilet.ratingCleanliness ? toilet.ratingCleanliness.toFixed(1) : '4.0'}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-square-pin',
        html: customHtml,
        iconSize: [0, 0],
      });

      let marker = markersRef.current.get(toilet.id);

      if (!marker) {
        marker = L.marker([toilet.coordinates.lat, toilet.coordinates.lng], { icon: customIcon }).addTo(map);

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onSelectToilet(toilet);
        });

        markersRef.current.set(toilet.id, marker);
      } else {
        marker.setIcon(customIcon);
        marker.setLatLng([toilet.coordinates.lat, toilet.coordinates.lng]);
      }
    });
  }, [toilets, selectedToiletId, onSelectToilet]);

  // Center selected toilet
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedToiletId) return;

    const selectedToilet = toilets.find((t) => t.id === selectedToiletId);
    if (selectedToilet && selectedToilet.coordinates && isValidLat(selectedToilet.coordinates.lat) && isValidLng(selectedToilet.coordinates.lng)) {
      map.flyTo([selectedToilet.coordinates.lat, selectedToilet.coordinates.lng], 16, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [selectedToiletId, toilets]);

  // Render User Location
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userLocation && isValidLat(userLocation.lat) && isValidLng(userLocation.lng)) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
            <div class="w-8 h-8 bg-blue-500/30 rounded-full animate-ping absolute"></div>
            <div class="w-7 h-7 bg-blue-500/25 rounded-full absolute border border-blue-400/50"></div>
            <div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md relative z-10"></div>
          </div>
        `,
        iconSize: [0, 0],
      });

      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
      } else {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      }

      // Fly smoothly to user location on update
      map.flyTo([userLocation.lat, userLocation.lng], 16, {
        animate: true,
        duration: 1.2,
      });
    } else if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
  }, [userLocation]);

  // Render Route Polyline if activeRouteDestination
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    if (
      activeRouteDestination &&
      activeRouteDestination.coordinates &&
      isValidLat(activeRouteDestination.coordinates.lat) &&
      isValidLng(activeRouteDestination.coordinates.lng) &&
      userLocation &&
      isValidLat(userLocation.lat) &&
      isValidLng(userLocation.lng)
    ) {
      const start: [number, number] = [userLocation.lat, userLocation.lng];
      const end: [number, number] = [activeRouteDestination.coordinates.lat, activeRouteDestination.coordinates.lng];

      const midLat = (start[0] + end[0]) / 2 + 0.0005;
      const midLng = (start[1] + end[1]) / 2 - 0.0005;

      const polyline = L.polyline([start, [midLat, midLng], end], {
        color: '#000000',
        weight: 5,
        opacity: 0.9,
        dashArray: '8, 8',
        lineCap: 'round',
      }).addTo(map);

      routePolylineRef.current = polyline;

      map.fitBounds(polyline.getBounds(), { padding: [80, 80] });
    }
  }, [activeRouteDestination, userLocation]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-slate-100" />

      {/* Map Controls Group (Style Switcher, Locate Me, Zoom In, Zoom Out) */}
      <div className="absolute right-3.5 sm:right-4 bottom-6 z-10 flex flex-col items-center gap-2 pointer-events-auto">
        {/* Map Tile Style Switcher */}
        {onChangeTileStyle && (
          <div className="relative group">
            <button
              onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)}
              className="w-10 h-10 bg-white text-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center font-black"
              title="Change Map Style"
            >
              <Layers className="w-5 h-5 stroke-[2.5]" />
            </button>
            
            <div className={`absolute right-full top-0 mr-2 ${isStyleMenuOpen ? 'flex' : 'hidden'} group-hover:flex flex-col bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-1.5 w-36 sm:w-40 gap-1 z-50`}>
              {(['dark', 'standard', 'satellite', 'outdoors'] as MapTileStyle[]).map((style) => (
                <button
                  key={style}
                  onClick={() => {
                    onChangeTileStyle(style);
                    setIsStyleMenuOpen(false);
                  }}
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
        )}

        {/* Locate Me Button */}
        {onLocateMe && (
          <button
            onClick={onLocateMe}
            className="w-10 h-10 bg-white text-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center"
            title="Locate My Position"
          >
            <Crosshair className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}

        {/* Zoom In Button */}
        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          className="w-10 h-10 bg-white text-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center font-black"
          title="Zoom In"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Zoom Out Button */}
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          className="w-10 h-10 bg-white text-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center font-black"
          title="Zoom Out"
        >
          <Minus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Add Pin Overlay Notice */}
      {isAddPinMode && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-yellow-400 text-black px-5 py-2.5 border-4 border-black font-black text-xs uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse">
          TAP ANYWHERE ON MAP TO PLACE NEW STATION PIN
        </div>
      )}
    </div>
  );
};


