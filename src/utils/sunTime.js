// 緯度経度・日付から日の出・日没時刻を計算（外部APIなし）
// 山口県デフォルト座標: lat=34.18, lng=131.47

export function getSunTimes(lat, lng, date) {
  const n = Math.floor(date.getTime() / 86400000) - Math.floor(new Date('2000-01-01').getTime() / 86400000);
  const L = (280.46 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * Math.PI / 180;
  const lambda = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * Math.PI / 180;
  const sinDec = Math.sin(23.439 * Math.PI / 180) * Math.sin(lambda);
  const dec = Math.asin(sinDec);
  const cosH = (Math.cos(90.833 * Math.PI / 180) - sinDec * Math.sin(lat * Math.PI / 180)) / (Math.cos(dec) * Math.cos(lat * Math.PI / 180));
  if (Math.abs(cosH) > 1) return null;
  const H = Math.acos(cosH) * 180 / Math.PI;
  const RA = Math.atan2(Math.cos(23.439 * Math.PI / 180) * Math.sin(lambda), Math.cos(lambda)) * 180 / Math.PI / 15;
  const noon = 12 - lng / 15 - (RA - L / 15);
  const sunriseUTC = noon - H / 15;
  const sunsetUTC = noon + H / 15;
  const dayStartUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const toDate = h => new Date(dayStartUTC + h * 3600000);
  return { sunrise: toDate(sunriseUTC), sunset: toDate(sunsetUTC) };
}

// 時間帯判定
export function getTimeZone(now, sun) {
  if (!sun) return 'daytime';
  const s = sun.sunrise.getTime(), e = sun.sunset.getTime(), t = now.getTime();
  if (t >= s - 30 * 60000 && t <= s + 60 * 60000) return 'mazume_morning';
  if (t >= e - 90 * 60000 && t <= e + 30 * 60000) return 'mazume_evening';
  if (t > s + 60 * 60000 && t < e - 90 * 60000) return 'daytime';
  return 'night';
}

export function formatTime(d) {
  return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
}
