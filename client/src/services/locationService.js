export const getCurrentCoordinates = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let msg = 'Could not retrieve coordinates.';
        if (error.code === 1) msg = 'Location permission denied by user.';
        else if (error.code === 2) msg = 'Position unavailable on this device.';
        else if (error.code === 3) msg = 'Location request timed out.';
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  });
};

export const reverseGeocode = async (latitude, longitude) => {
  // Mock reverse geocoder returns a readable local region layout
  await new Promise((resolve) => setTimeout(resolve, 500));
  return `Near Sector 4, Indiranagar (GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
};
