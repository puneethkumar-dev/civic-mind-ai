const fallbackIpLocation = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
      throw new Error('IP geolocation request failed');
    }
    const data = await response.json();
    if (data && data.latitude && data.longitude) {
      return {
        latitude: data.latitude,
        longitude: data.longitude,
      };
    }
  } catch (err) {
    console.error('IP Geolocation fallback failed:', err.message);
  }
  throw new Error('IP geolocation failed.');
};

export const getCurrentCoordinates = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      fallbackIpLocation().then(resolve).catch(reject);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      async (error) => {
        console.warn('Browser geolocation failed, attempting IP fallback:', error.message);
        try {
          const ipCoords = await fallbackIpLocation();
          resolve(ipCoords);
        } catch (ipErr) {
          let msg = 'Could not retrieve coordinates.';
          if (error.code === 1) msg = 'Location permission denied by user.';
          else if (error.code === 2) msg = 'Position unavailable on this device.';
          else if (error.code === 3) msg = 'Location request timed out.';
          reject(new Error(msg));
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  });
};

export const reverseGeocode = async (latitude, longitude) => {
  const mapsKey = import.meta.env.VITE_MAPS_API_KEY;
  const isGoogleKeyValid = mapsKey && mapsKey !== 'YOUR_MAPS_API_KEY' && mapsKey !== '';

  if (isGoogleKeyValid) {
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${mapsKey}`);
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          return data.results[0].formatted_address;
        }
      }
    } catch (googleErr) {
      console.warn('Google reverse geocoding failed, falling back to OpenStreetMap:', googleErr.message);
    }
  }

  // Fallback to free OpenStreetMap Nominatim API
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, {
      headers: {
        'User-Agent': 'CivicMind-AI-App'
      }
    });
    if (response.ok) {
      const data = await response.json();
      if (data && data.display_name) {
        return data.display_name;
      }
    }
  } catch (osmErr) {
    console.warn('OSM reverse geocoding failed, using mock:', osmErr.message);
  }

  // Final fallback to mock regional location
  return `Near Sector 4, Indiranagar (GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
};
