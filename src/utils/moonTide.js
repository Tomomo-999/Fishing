// 月齢から潮まわりを計算（天文計算ベース、APIキー不要）
// 新月・満月前後 → 大潮、上弦・下弦前後 → 小潮/長潮/若潮、その他 → 中潮

const LUNAR_CYCLE = 29.530588853; // 朔望月（日）
// 基準となる既知の新月: 2000年1月6日 18:14 UTC
const KNOWN_NEW_MOON_JD = 2451549.5 + 18.233 / 24;

function toJulianDay(date) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() + date.getUTCHours() / 24;
  const A = Math.floor((14 - m) / 12);
  const Y = y + 4800 - A;
  const M = m + 12 * A - 3;
  return d + Math.floor((153 * M + 2) / 5) + 365 * Y + Math.floor(Y / 4)
    - Math.floor(Y / 100) + Math.floor(Y / 400) - 32045;
}

// 月齢を返す（0 = 新月、7.4 = 上弦、14.8 = 満月、22.1 = 下弦）
export function getLunarAge(date) {
  const jd = toJulianDay(date);
  const age = ((jd - KNOWN_NEW_MOON_JD) % LUNAR_CYCLE + LUNAR_CYCLE) % LUNAR_CYCLE;
  return age;
}

// 月齢から潮タイプとスコアを返す
export function getTideFromMoon(date) {
  const age = getLunarAge(date);

  // 大潮: 新月(±2日) または 満月(±2日)
  const nearNewMoon  = age <= 2 || age >= LUNAR_CYCLE - 2;
  const nearFullMoon = Math.abs(age - LUNAR_CYCLE / 2) <= 2;

  // 小潮圏: 上弦(7.4±2) または 下弦(22.1±2)
  const nearFirstQ = Math.abs(age - LUNAR_CYCLE / 4) <= 2;
  const nearLastQ  = Math.abs(age - LUNAR_CYCLE * 3 / 4) <= 2;

  // 長潮: 上弦/下弦の直前（-3日付近）
  const nagashio = (Math.abs(age - LUNAR_CYCLE / 4 + 1) < 0.8) ||
                   (Math.abs(age - LUNAR_CYCLE * 3 / 4 + 1) < 0.8);

  // 若潮: 上弦/下弦の直後（+2〜3日）
  const wakashio = (Math.abs(age - LUNAR_CYCLE / 4 - 2) < 0.8) ||
                   (Math.abs(age - LUNAR_CYCLE * 3 / 4 - 2) < 0.8);

  if (nearNewMoon || nearFullMoon) return { tide_type: '大潮', tide_score: 3, moon_age: age };
  if (nagashio)                    return { tide_type: '長潮', tide_score: 1, moon_age: age };
  if (wakashio)                    return { tide_type: '若潮', tide_score: 1, moon_age: age };
  if (nearFirstQ || nearLastQ)     return { tide_type: '小潮', tide_score: 1, moon_age: age };
  return                                  { tide_type: '中潮', tide_score: 2, moon_age: age };
}

// 月齢から月のフェーズアイコンを返す
export function getMoonIcon(age) {
  const phase = age / LUNAR_CYCLE;
  if (phase < 0.06 || phase >= 0.94) return '🌑';
  if (phase < 0.19) return '🌒';
  if (phase < 0.31) return '🌓';
  if (phase < 0.44) return '🌔';
  if (phase < 0.56) return '🌕';
  if (phase < 0.69) return '🌖';
  if (phase < 0.81) return '🌗';
  return '🌘';
}
