import { useEffect, useRef, useState } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';
import COLORS from '../../constants/colors';

/**
 * DeliveryMap — renders the shipment's route on a real Google Map.
 *
 * The origin is a fixed real warehouse coordinate. The destination is the
 * customer's actual address, geocoded in the browser to a real lat/lng (the
 * tracking service only stores mock coordinates, so we resolve the real spot
 * here). The parcel marker animates origin → destination as the order advances
 * dispatched → delivered.
 *
 * Requires VITE_GOOGLE_MAPS_API_KEY. Without it, renders a graceful fallback so
 * the rest of the tracking page still works.
 *
 * @param {{
 *   origin?: {lat:number,lng:number,label?:string},
 *   destination?: {lat:number,lng:number,label?:string},
 *   destinationAddress?: string,
 *   status?: string,
 * }} props
 */

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// How far along origin→destination the parcel sits at each stage.
const STAGE_PROGRESS = {
  pending: 0.0,
  dispatched: 0.08,
  in_transit: 0.5,
  out_for_delivery: 0.85,
  delivered: 1.0,
};

// Cache geocoded addresses (per session) so each address is only looked up
// once — keeps Geocoding API usage minimal across page views.
const _geocodeCache = new Map();

let _mapsPromise = null;

/** Load the Google Maps JS API once. Resolves with window.google or rejects. */
function loadGoogleMaps() {
  if (window.google?.maps) return Promise.resolve(window.google);
  if (_mapsPromise) return _mapsPromise;

  _mapsPromise = new Promise((resolve, reject) => {
    if (!MAPS_KEY) {
      reject(new Error('missing-key'));
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () =>
      window.google?.maps ? resolve(window.google) : reject(new Error('load-failed'));
    script.onerror = () => reject(new Error('load-failed'));
    document.head.appendChild(script);
  });
  return _mapsPromise;
}

/** Geocode an address to a real {lat,lng}, cached. Resolves null on failure. */
function geocodeAddress(google, address) {
  if (!address) return Promise.resolve(null);
  if (_geocodeCache.has(address)) return Promise.resolve(_geocodeCache.get(address));

  return new Promise((resolve) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address, region: 'IN' }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const loc = results[0].geometry.location;
        const point = { lat: loc.lat(), lng: loc.lng() };
        _geocodeCache.set(address, point);
        resolve(point);
      } else {
        _geocodeCache.set(address, null);
        resolve(null);
      }
    });
  });
}

function parcelIcon(google) {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 8,
    fillColor: COLORS.brass || '#b5853a',
    fillOpacity: 1,
    strokeColor: '#fdf6e6',
    strokeWeight: 3,
  };
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function DeliveryMap({ origin, destination, destinationAddress, status }) {
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const markers = useRef({ origin: null, dest: null, parcel: null, line: null });
  const destPoint = useRef(null); // resolved real destination {lat,lng}
  const animRef = useRef(null);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  // Move the parcel to the position implied by `status` (optionally animated).
  function positionParcel(animate) {
    const google = window.google;
    const parcel = markers.current.parcel;
    const dest = destPoint.current;
    if (!google || !parcel || !origin || !dest) return;

    const t = STAGE_PROGRESS[status] ?? 0;
    const target = { lat: lerp(origin.lat, dest.lat, t), lng: lerp(origin.lng, dest.lng, t) };

    if (!animate) {
      parcel.setPosition(target);
      return;
    }
    const start = parcel.getPosition();
    const from = start ? { lat: start.lat(), lng: start.lng() } : target;
    const duration = 1200;
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      parcel.setPosition({
        lat: from.lat + (target.lat - from.lat) * eased,
        lng: from.lng + (target.lng - from.lng) * eased,
      });
      if (p < 1) animRef.current = requestAnimationFrame(step);
    };
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(step);
  }

  // Initialise the map + layers when endpoints/address change.
  useEffect(() => {
    let cancelled = false;
    if (!origin) return undefined;

    loadGoogleMaps()
      .then(async (google) => {
        if (cancelled || !mapRef.current) return;

        // Resolve the real destination: geocode the address, falling back to
        // the (mock) destination point only if geocoding fails.
        let dest = await geocodeAddress(google, destinationAddress);
        if (!dest && destination) dest = { lat: destination.lat, lng: destination.lng };
        if (!dest) dest = origin; // last resort
        if (cancelled) return;
        destPoint.current = dest;

        const map = new google.maps.Map(mapRef.current, {
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'cooperative',
          styles: MAP_STYLE,
        });
        mapObj.current = map;

        const bounds = new google.maps.LatLngBounds();
        bounds.extend(origin);
        bounds.extend(dest);
        map.fitBounds(bounds, 64);

        markers.current.origin = new google.maps.Marker({
          position: origin, map, title: origin.label || 'Fulfilment centre',
          icon: {
            path: google.maps.SymbolPath.CIRCLE, scale: 6,
            fillColor: COLORS.cloth || '#6b4f3a', fillOpacity: 1,
            strokeColor: '#fdf6e6', strokeWeight: 2,
          },
        });
        markers.current.dest = new google.maps.Marker({
          position: dest, map, title: destinationAddress || 'Destination',
          icon: {
            path: 'M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z',
            fillColor: COLORS.error || '#b4452f', fillOpacity: 1,
            strokeColor: '#fdf6e6', strokeWeight: 1.5,
            scale: 1.6, anchor: new google.maps.Point(12, 22),
          },
        });
        markers.current.line = new google.maps.Polyline({
          path: [origin, dest], map, geodesic: true,
          strokeColor: COLORS.brass || '#b5853a',
          strokeOpacity: 0.7, strokeWeight: 3,
        });
        markers.current.parcel = new google.maps.Marker({
          position: origin, map, icon: parcelIcon(google),
          zIndex: 999, title: 'Your parcel',
        });

        positionParcel(false);
        if (!cancelled) setReady(true);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'load-failed');
      });

    return () => {
      cancelled = true;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin?.lat, origin?.lng, destinationAddress]);

  // Animate the parcel forward whenever the stage changes.
  useEffect(() => {
    if (ready) positionParcel(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, ready]);

  // ── Fallbacks ────────────────────────────────────────────
  if (!origin) return null;

  if (error === 'missing-key') {
    return (
      <div
        className="rounded-lg p-4 mb-4 flex items-center gap-2 text-sm"
        style={{ backgroundColor: COLORS.surfaceLight, color: COLORS.text.tertiary, border: `1px dashed ${COLORS.border}` }}
      >
        <MapPin size={15} style={{ color: COLORS.brass }} />
        Map preview unavailable — set VITE_GOOGLE_MAPS_API_KEY to show the live route.
      </div>
    );
  }
  if (error) {
    return (
      <div
        className="rounded-lg p-4 mb-4 flex items-center gap-2 text-sm"
        style={{ backgroundColor: COLORS.surfaceLight, color: COLORS.text.tertiary, border: `1px solid ${COLORS.border}` }}
      >
        <AlertCircle size={15} style={{ color: COLORS.error }} />
        Couldn't load the map right now.
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div
        ref={mapRef}
        className="w-full rounded-lg overflow-hidden"
        style={{ height: 240, border: `1px solid ${COLORS.border}` }}
      />
      <p className="text-xs mt-1.5 flex items-center gap-1.5" style={{ color: COLORS.text.tertiary }}>
        <MapPin size={12} style={{ color: COLORS.brass }} />
        {status === 'delivered'
          ? `Delivered to ${destinationAddress || 'destination'}`
          : status === 'pending'
          ? `Ships from ${origin.label || 'fulfilment centre'}`
          : 'Parcel in transit'}
      </p>
    </div>
  );
}

// Subtle warm/dark map theme to match the Folio palette.
const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#2b2620' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#2b2620' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#b9a88f' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#1f1b16' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#3a332b' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#4a4035' }] },
];

export default DeliveryMap;
