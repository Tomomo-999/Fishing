// 気象庁 無料天気予報API（APIキー不要）
// 山口県コード: 350000
// 山口県沿岸エリアコード: 350010（山口・周南）, 350020（萩・長門）, 350030（下関・宇部）

const JMA_URL = 'https://www.jma.go.jp/bosai/forecast/data/forecast/350000.json';
const CACHE_KEY = 'jma_weather_cache_v1';
const CACHE_TTL = 3 * 60 * 60 * 1000; // 3時間

const WEATHER_CODE_MAP = {
  '100': { label: '晴れ',        icon: '☀️',  score: 2 },
  '101': { label: '晴れ時々曇り', icon: '🌤',  score: 2 },
  '102': { label: '晴れ一時雨',  icon: '🌦',  score: 1 },
  '110': { label: '晴れのち曇り', icon: '⛅',  score: 2 },
  '111': { label: '晴れのち曇り', icon: '⛅',  score: 2 },
  '112': { label: '晴れのち雨',  icon: '🌦',  score: 1 },
  '200': { label: '曇り',        icon: '☁️',  score: 1 },
  '201': { label: '曇り時々晴れ', icon: '🌤',  score: 2 },
  '202': { label: '曇り一時雨',  icon: '🌧',  score: 0 },
  '210': { label: '曇りのち晴れ', icon: '🌤',  score: 2 },
  '211': { label: '曇りのち晴れ', icon: '🌤',  score: 2 },
  '212': { label: '曇りのち雨',  icon: '🌧',  score: 0 },
  '300': { label: '雨',          icon: '🌧',  score: 0 },
  '301': { label: '雨時々晴れ',  icon: '🌦',  score: 1 },
  '302': { label: '雨時々止む',  icon: '🌧',  score: 0 },
  '303': { label: '雨時々雪',    icon: '🌨',  score: 0 },
  '313': { label: '雨のち曇り',  icon: '🌦',  score: 1 },
  '400': { label: '雪',          icon: '❄️',  score: 0 },
  '500': { label: '雷雨',        icon: '⛈',  score: 0 },
};

function parseWeatherCode(code) {
  return WEATHER_CODE_MAP[code] || { label: '—', icon: '🌡', score: 1 };
}

// キャッシュから読み出し
function loadCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch { return null; }
}

function saveCache(data) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

// 気象庁APIを叩いて天気を取得
// 返り値: Map<'YYYY-MM-DD', { icon, label, score, wind, wave }>
export async function fetchJmaWeather() {
  const cached = loadCache();
  if (cached) return cached;

  const res = await fetch(JMA_URL);
  if (!res.ok) throw new Error('JMA API error');
  const json = await res.json();

  // json[0] = 短期（3日）、json[1] = 週間（7日）
  const result = {};

  // --- 短期予報（3日分、詳細あり）---
  const short = json[0];
  const shortSeries = short.timeSeries;

  // timeSeries[0]: 天気コード・天気・風・波
  const ts0 = shortSeries[0];
  const times0 = ts0.timeDefines;
  // 山口県のエリアを探す（複数ある場合は最初のエリアを使用）
  const area0 = ts0.areas[0];

  times0.forEach((t, i) => {
    const date = t.slice(0, 10);
    const code = area0.weatherCodes?.[i] || '';
    const weather = parseWeatherCode(code);
    const wind = area0.winds?.[i] || '';
    const wave = area0.waves?.[i] || '';
    result[date] = { ...weather, wind, wave, code };
  });

  // --- 週間予報（7日分）---
  const weekly = json[1];
  if (weekly?.timeSeries) {
    const wts = weekly.timeSeries;
    // timeSeries[0]: 天気コード
    const wts0 = wts[0];
    const wtimes = wts0.timeDefines;
    const warea = wts0.areas[0];
    wtimes.forEach((t, i) => {
      const date = t.slice(0, 10);
      if (!result[date]) {
        const code = warea.weatherCodes?.[i] || '';
        result[date] = { ...parseWeatherCode(code), wind: '', wave: '', code };
      }
    });

    // timeSeries[1]: 気温（最低/最高）
    const wts1 = wts[1];
    if (wts1) {
      const tarea = wts1.areas[0];
      wts1.timeDefines.forEach((t, i) => {
        const date = t.slice(0, 10);
        const lo = tarea.tempsMin?.[i];
        const hi = tarea.tempsMax?.[i];
        if (result[date] && (lo || hi)) {
          result[date].tempMin = lo ? `${lo}°` : '';
          result[date].tempMax = hi ? `${hi}°` : '';
        }
      });
    }
  }

  saveCache(result);
  return result;
}

// 天気スコア（晴れ=2、曇り=1、雨/雷=0）を返す
export function getWeatherScore(weatherMap, date) {
  const key = date.toISOString().slice(0, 10);
  return weatherMap?.[key]?.score ?? 1;
}
