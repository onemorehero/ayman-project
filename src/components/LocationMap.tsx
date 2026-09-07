import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, ExternalLink, Crosshair, Check } from 'lucide-react';

export interface Coordinates {
  lat: number;
  lng: number;
}

interface Props {
  mode: 'picker' | 'view';
  coordinates?: Coordinates | null;
  onChange?: (coords: Coordinates) => void;
  label?: string;
  addressText?: string;
  heightClass?: string;
  initialAreaName?: string;
}

// Famous Egyptian districts center coordinates
const DISTRICT_COORDS: Record<string, Coordinates> = {
  'الدقي': { lat: 30.0382, lng: 31.2114 },
  'المهندسين': { lat: 30.0571, lng: 31.2007 },
  'العجوزة': { lat: 30.0631, lng: 31.2144 },
  'مدينة نصر': { lat: 30.0561, lng: 31.3301 },
  'مصر الجديدة': { lat: 30.0911, lng: 31.3262 },
  'المعادي': { lat: 29.9602, lng: 31.2569 },
  'التجمع الخامس': { lat: 30.0276, lng: 31.4720 },
  'الشيخ زايد': { lat: 30.0531, lng: 30.9632 },
  'الهرم': { lat: 29.9972, lng: 31.1561 },
  'فيصل': { lat: 30.0101, lng: 31.1712 }
};

// Default Cairo center
const DEFAULT_CAIRO: Coordinates = { lat: 30.0444, lng: 31.2357 };

function createCustomPinIcon(isProviderView = false): L.DivIcon {
  const bgColor = isProviderView ? '#0284c7' : '#f59e0b';
  const svgHtml = `
    <div style="position: relative; width: 36px; height: 42px; transform: translate(-50%, -100%);">
      <svg viewBox="0 0 36 42" width="36" height="42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
        <path d="M18 0C8.05887 0 0 8.05887 0 18C0 27.5 14.5 40.5 17.1 42.8C17.6 43.2 18.4 43.2 18.9 42.8C21.5 40.5 36 27.5 36 18C36 8.05887 27.9411 0 18 0Z" fill="${bgColor}"/>
        <circle cx="18" cy="18" r="7" fill="white"/>
        <circle cx="18" cy="18" r="4" fill="${bgColor}"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-pin',
    iconSize: [36, 42],
    iconAnchor: [18, 42],
    popupAnchor: [0, -42]
  });
}

export function LocationMap({
  mode,
  coordinates,
  onChange,
  label,
  addressText,
  heightClass = 'h-64 sm:h-72',
  initialAreaName
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Fallback coords
  const initialCoord = coordinates || (initialAreaName && DISTRICT_COORDS[initialAreaName]) || DEFAULT_CAIRO;
  const [currentCoords, setCurrentCoords] = useState<Coordinates>(initialCoord);
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Sync internal state when external coordinates prop changes
  useEffect(() => {
    if (coordinates && (coordinates.lat !== currentCoords.lat || coordinates.lng !== currentCoords.lng)) {
      setCurrentCoords(coordinates);
      if (markerRef.current) {
        markerRef.current.setLatLng([coordinates.lat, coordinates.lng]);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo([coordinates.lat, coordinates.lng]);
      }
    }
  }, [coordinates?.lat, coordinates?.lng]);

  // If initialAreaName changes in picker mode, center on that area if no coords chosen
  useEffect(() => {
    if (mode === 'picker' && initialAreaName && DISTRICT_COORDS[initialAreaName] && !coordinates) {
      const areaCoord = DISTRICT_COORDS[initialAreaName];
      setCurrentCoords(areaCoord);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([areaCoord.lat, areaCoord.lng], 14);
      }
      if (markerRef.current) {
        markerRef.current.setLatLng([areaCoord.lat, areaCoord.lng]);
      }
      onChange?.(areaCoord);
    }
  }, [initialAreaName]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Cleanup previous map if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [currentCoords.lat, currentCoords.lng],
      zoom: 14,
      scrollWheelZoom: mode === 'picker' ? true : 'center',
      attributionControl: false
    });

    // Add OpenStreetMap Free Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // Custom attribution badge
    L.control.attribution({ position: 'bottomleft', prefix: 'خرائط OpenStreetMap مفتوحة المصدر' }).addTo(map);

    const icon = createCustomPinIcon(mode === 'view');
    const marker = L.marker([currentCoords.lat, currentCoords.lng], {
      icon,
      draggable: mode === 'picker'
    }).addTo(map);

    if (mode === 'view') {
      const popupContent = `
        <div style="font-family: 'Cairo', sans-serif; text-align: right; padding: 4px;" dir="rtl">
          <p style="font-weight: bold; font-size: 13px; margin: 0 0 4px 0; color: #0f172a;">موقع العميل والطلب 📍</p>
          ${addressText ? `<p style="font-size: 11px; margin: 0 0 6px 0; color: #475569;">${addressText}</p>` : ''}
          <p style="font-size: 10px; margin: 0; color: #94a3b8; direction: ltr; text-align: left;">${currentCoords.lat.toFixed(5)}, ${currentCoords.lng.toFixed(5)}</p>
        </div>
      `;
      marker.bindPopup(popupContent).openPopup();
    }

    if (mode === 'picker') {
      // Map click handler to relocate pin
      map.on('click', (e: L.LeafletMouseEvent) => {
        const newCoords: Coordinates = {
          lat: Number(e.latlng.lat.toFixed(6)),
          lng: Number(e.latlng.lng.toFixed(6))
        };
        setCurrentCoords(newCoords);
        marker.setLatLng([newCoords.lat, newCoords.lng]);
        onChange?.(newCoords);
      });

      // Marker drag handler
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        const newCoords: Coordinates = {
          lat: Number(pos.lat.toFixed(6)),
          lng: Number(pos.lng.toFixed(6))
        };
        setCurrentCoords(newCoords);
        onChange?.(newCoords);
      });
    }

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Trigger invalidateSize after initial render
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, [mode]);

  // Move map to specific district
  const handleJumpToDistrict = (areaName: string) => {
    const target = DISTRICT_COORDS[areaName];
    if (!target || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([target.lat, target.lng], 15);
    setCurrentCoords(target);
    if (markerRef.current) {
      markerRef.current.setLatLng([target.lat, target.lng]);
    }
    onChange?.(target);
  };

  // Browser Geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGeoError('خدمة تحديد الموقع غير مدعومة في متصفحك');
      return;
    }

    setGeoLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos: Coordinates = {
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6))
        };
        setCurrentCoords(userPos);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([userPos.lat, userPos.lng], 16);
        }
        if (markerRef.current) {
          markerRef.current.setLatLng([userPos.lat, userPos.lng]);
        }
        onChange?.(userPos);
        setGeoLocating(false);
      },
      (err) => {
        setGeoLocating(false);
        setGeoError('تعذر تحديد موقعك الحالي تلقائياً. يمكنك النقر على الخريطة مباشرة.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // External Google Maps / Navigation Link for Provider
  const googleMapsUrl = `https://www.google.com/maps?q=${currentCoords.lat},${currentCoords.lng}`;

  return (
    <div className="space-y-2" dir="rtl">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <MapPin className="w-4 h-4 text-amber-600" />
          <span>{label || (mode === 'picker' ? 'تحديد موقع المنزل / العطل على الخريطة' : 'موقع العميل على الخريطة')}</span>
        </div>

        {mode === 'picker' && (
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={geoLocating}
            className="text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 transition-colors flex items-center gap-1"
          >
            <Crosshair className={`w-3.5 h-3.5 ${geoLocating ? 'animate-spin text-amber-600' : ''}`} />
            <span>{geoLocating ? 'جاري التحديد...' : 'موقعي الحالي'}</span>
          </button>
        )}

        {mode === 'view' && (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg border border-sky-200 transition-colors flex items-center gap-1"
          >
            <Navigation className="w-3.5 h-3.5 text-sky-600" />
            <span>فتح في خرائط جوجل / التوجيه</span>
            <ExternalLink className="w-3 h-3 text-sky-500" />
          </a>
        )}
      </div>

      {/* Picker Guidance Banner */}
      {mode === 'picker' && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs">
          <p className="text-slate-600 leading-snug">
            💡 اضغط على الخريطة لتحديد مكان الشارع أو العقار بدقة (Pin Drop)، أو اسحب المؤشر.
          </p>
          <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 dir-ltr shrink-0">
            {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}
          </span>
        </div>
      )}

      {geoError && (
        <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
          {geoError}
        </div>
      )}

      {/* Quick District Buttons for Picker */}
      {mode === 'picker' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
          <span className="text-slate-400 font-medium shrink-0">الانتقال السريع:</span>
          {Object.keys(DISTRICT_COORDS).slice(0, 7).map(area => (
            <button
              key={area}
              type="button"
              onClick={() => handleJumpToDistrict(area)}
              className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-slate-700 shrink-0 transition-colors"
            >
              {area}
            </button>
          ))}
        </div>
      )}

      {/* The Leaflet Map DOM Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xs z-0">
        <div ref={mapContainerRef} className={`w-full ${heightClass} bg-slate-100`} />
      </div>

      {/* Footer hint */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
        <span>مدعوم بواسطة OpenStreetMap (مفتوح المصدر وخالٍ من مفاتيح API)</span>
        {mode === 'view' && addressText && (
          <span className="font-semibold text-slate-600 truncate max-w-[240px]">
            العنوان: {addressText}
          </span>
        )}
      </div>
    </div>
  );
}
