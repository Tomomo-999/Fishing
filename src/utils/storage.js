const MY_SPOTS_KEY = 'fishing_nav_myspots_v1';

export const loadMySpots = () => {
  try { return JSON.parse(localStorage.getItem(MY_SPOTS_KEY) || '[]'); }
  catch (e) { return []; }
};

export const saveMySpots = (spots) => {
  localStorage.setItem(MY_SPOTS_KEY, JSON.stringify(spots));
};

// GoogleマップURL → 緯度経度を解析
export const parseGmapUrl = (url) => {
  const at = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (at) return { lat: parseFloat(at[1]), lng: parseFloat(at[2]) };
  const q = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (q) return { lat: parseFloat(q[1]), lng: parseFloat(q[2]) };
  const ll = url.match(/ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (ll) return { lat: parseFloat(ll[1]), lng: parseFloat(ll[2]) };
  return null;
};
