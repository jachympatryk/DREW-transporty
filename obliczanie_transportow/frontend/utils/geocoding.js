export const fetchLatLng = async (postalCode) => {
  const apiKey = 'AIzaSyCzXWrLKaLQraVh_Hdu101gc7RwOLQb2FY';

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${postalCode},PL&key=${apiKey}`
  );
  const data = await response.json();

  if (data.status === 'OK') {
    const location = data.results[0].geometry.location;
    return {
      lat: location.lat,
      lng: location.lng,
      addressName: data.results[0].formatted_address,
    };
  } else {
    throw new Error('Nie udało się pobrać współrzędnych.');
  }
};
