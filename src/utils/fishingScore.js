import { getTideFromMoon } from './moonTide.js';

// 釣果スコアを計算（1〜5点）
// 潮（1-3）+ 天気（0-2）のみで評価 → 自然に1〜5が分散する
// weatherScore: 0=雨/雷 1=曇り 2=晴れ
export function calcFishingScore(date, fishData, weatherScore = 1) {
  const { tide_score } = getTideFromMoon(date); // 1〜3
  const wScore = Math.min(2, Math.max(0, weatherScore)); // 0〜2
  return tide_score + wScore; // 合計1〜5
}

export function getScoreStars(score) {
  return '★'.repeat(score) + '☆'.repeat(5 - score);
}

// 後方互換：月齢ベースで潮タイプを返す
export function getTideType(date) {
  return getTideFromMoon(date).tide_type;
}
