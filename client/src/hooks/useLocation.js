import { useState, useCallback } from 'react';
import { getCurrentCoordinates, reverseGeocode } from '../services/locationService';

export function useLocation() {
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const position = await getCurrentCoordinates();
      setCoords(position);
      const addr = await reverseGeocode(position.latitude, position.longitude);
      setAddress(addr);
      return { coords: position, address: addr };
    } catch (err) {
      console.error('Error fetching GPS coords:', err);
      setError(err.message || 'Location permission denied or timed out.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const setManualLocation = useCallback((neighborhoodName) => {
    const coordinatesMap = {
      'Indiranagar': { latitude: 12.9719, longitude: 77.6412 },
      'MG Road': { latitude: 12.9743, longitude: 77.6110 },
      'Gandhi Nagar': { latitude: 12.9815, longitude: 77.5750 },
      'Market Area': { latitude: 12.9620, longitude: 77.5780 },
    };

    const position = coordinatesMap[neighborhoodName] || { latitude: 12.9716, longitude: 77.5946 };
    setCoords(position);
    setAddress(`${neighborhoodName}, Bengaluru`);
    setError(null);
  }, []);

  const updateCoordinates = useCallback(async (latitude, longitude) => {
    setLoading(true);
    setError(null);
    const position = { latitude, longitude };
    setCoords(position);
    try {
      const addr = await reverseGeocode(latitude, longitude);
      setAddress(addr);
      return { coords: position, address: addr };
    } catch (err) {
      console.error('Error reverse geocoding custom coordinates:', err);
      const fallbackAddr = `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      setAddress(fallbackAddr);
      return { coords: position, address: fallbackAddr };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetLocation = useCallback(() => {
    setCoords(null);
    setAddress('');
    setError(null);
    setLoading(false);
  }, []);

  return {
    coords,
    address,
    loading,
    error,
    fetchLocation,
    setManualLocation,
    updateCoordinates,
    resetLocation,
  };
}
