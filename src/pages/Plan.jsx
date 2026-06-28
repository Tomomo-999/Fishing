import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import fishData from '../data/fish.json';
import spotsData from '../data/spots.json';
import { calcFishingScore, getTideType } from '../utils/fishingScore';
import { getTideFromMoon, getMoonIcon } from '../utils/moonTide';
import { getSunTimes, formatTime } from '../utils/sunTime';
import { fetchJmaWeather, getWeatherScore } from '../utils/jmaWeather';
import { loadMySpots } from '../utils/storage';

const LAT = 34.18, LNG = 131.47;
const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];
const SCORE_COLORS = {
  5: { bg: '#D5F5E3', color: '#2D6A4F', label: '絶好調' },
  4: { bg: '#EAFAF1', color: '#2D6A4F', label: '好調'   },
  3: { bg: '#FEF3CD', color: '#7D6608', label: '普通'   },
  2: { bg: '#FEF9E7', color: '#B7770D', label: 'やや悪' },
  1: { bg: '#F2F3F4', color: '#AAB7B8', label: '不向き' },
};

const Plan = () => {
  const navigate = useNavigate();
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const [selectedDay, setSelectedDay] = useState(null);
  const [weatherMap, setWeatherMap] = useState({});
  const [weatherError, setWeatherError] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [mySpots, setMySpots] = useState([]);
  const detailRef = useRef(null);

  // JMA天気データを取得
  useEffect(() => {
    fetchJmaWeather()
      .then(map => { setWeatherMap(map); setWeatherLoading(false); })
      .catch(() => { setWeatherError(true); setWeatherLoading(false); });
  }, []);

  // マイスポットを読み込む
  useEffect(() => { setMySpots(loadMySpots()); }, []);

  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateKey = d.toISOString().slice(0, 10);
    const wData = weatherMap[dateKey] || null;
    const wScore = wData ? wData.score : 1;
    const score = calcFishingScore(d, fishData, wScore);
    const tideInfo = getTideFromMoon(d);
    const sun = getSunTimes(LAT, LNG, d);
    const dow = d.getDay();
    return { date: d, score, tideInfo, sun, isWeekend: dow === 0 || dow === 6, dow, wData };
  }), [today, weatherMap]);

  const selected = selectedDay !== null ? days[selectedDay] : null;
  const peakFish = selected ? fishData.filter(f => f.season_peak.includes(selected.date.getMonth() + 1)) : [];

  useEffect(() => {
    if (selected && detailRef.current) {
      setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  }, [selectedDay]);

  const fmt = (d) => `${d.getMonth()+1}/${d.getDate()}`;

  return (
    <div>
      {/* ヘッダー */}
      <div style={{ margin: '12px 16px', padding: '14px 16px', background: 'linear-gradient(135deg, #0C2D48, #1A5276)', borderRadius: '14px', color: '#fff', boxShadow: '0 4px 14px rgba(12,45,72,.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div style={{ fontSize: '15px', fontWeight: 800 }}>📅 14日間の釣り予報</div>
          <div style={{ fontSize: '11px', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '4px' }}>
            {weatherLoading ? '🔄 天気取得中…' : weatherError ? '⚠️ 天気データなし' : '🌤 気象庁データ'}
          </div>
        </div>
        <div style={{ fontSize: '12px', opacity: 0.8, lineHeight: 1.5 }}>
          天気（気象庁）・月齢潮汐・まずめ・曜日を総合したスコアです
        </div>
      </div>

      {/* カレンダーグリッド */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {days.map((day, i) => {
          const c = SCORE_COLORS[day.score];
          const isToday = i === 0;
          const isSel = selectedDay === i;
          const moon = getMoonIcon(day.tideInfo.moon_age);
          const wIcon = day.wData?.icon || (weatherLoading ? '…' : '—');

          return (
            <button
              key={i}
              onClick={() => setSelectedDay(isSel ? null : i)}
              style={{
                background: isSel ? '#0C2D48' : '#fff',
                border: `1.5px solid ${isSel ? '#0C2D48' : isToday ? '#2E86C1' : 'rgba(0,0,0,.06)'}`,
                borderRadius: '10px', padding: '10px 12px',
                boxShadow: isSel ? '0 4px 14px rgba(12,45,72,.25)' : '0 1px 3px rgba(0,0,0,.05)',
                display: 'flex', alignItems: 'center', gap: '10px',
                cursor: 'pointer', width: '100%', textAlign: 'left',
              }}
            >
              {/* 日付 */}
              <div style={{ width: '40px', flexShrink: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: isSel ? '#fff' : day.isWeekend ? (day.dow === 0 ? '#E74C3C' : '#2E86C1') : '#1C2833' }}>
                  {isToday ? '今日' : fmt(day.date)}
                </div>
                <div style={{ fontSize: '11px', color: isSel ? 'rgba(255,255,255,0.55)' : day.dow === 0 ? '#E74C3C' : day.dow === 6 ? '#2E86C1' : '#AAB7B8' }}>
                  {DAY_NAMES[day.dow]}
                </div>
              </div>

              {/* 天気・潮 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '16px' }}>{wIcon}</span>
                  {day.wData?.tempMax && (
                    <span style={{ fontSize: '10px', color: isSel ? 'rgba(255,255,255,.7)' : '#E74C3C' }}>{day.wData.tempMax}</span>
                  )}
                  {day.wData?.tempMin && (
                    <span style={{ fontSize: '10px', color: isSel ? 'rgba(255,255,255,.5)' : '#2E86C1' }}>{day.wData.tempMin}</span>
                  )}
                  <span style={{ fontSize: '12px' }}>{moon}</span>
                  <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '99px', background: isSel ? 'rgba(255,255,255,.15)' : c.bg, color: isSel ? '#fff' : c.color, fontWeight: 600 }}>
                    {day.tideInfo.tide_type}
                  </span>
                </div>
                {/* スコアバー */}
                <div style={{ display: 'flex', gap: '3px' }}>
                  {[1,2,3,4,5].map(s => (
                    <div key={s} style={{ flex: 1, height: '5px', borderRadius: '3px', background: s <= day.score ? c.color : isSel ? 'rgba(255,255,255,.2)' : '#E5EAF0' }} />
                  ))}
                </div>
              </div>

              {/* スコアラベル */}
              <div style={{ flexShrink: 0, textAlign: 'center', minWidth: '42px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, padding: '3px 7px', borderRadius: '8px', background: isSel ? 'rgba(255,255,255,.18)' : c.bg, color: isSel ? '#fff' : c.color, whiteSpace: 'nowrap' }}>{c.label}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 選択日詳細 */}
      {selected && (
        <div ref={detailRef} style={{ margin: '12px 16px', padding: '14px', background: '#fff', border: '2px solid #2E86C1', borderRadius: '14px', boxShadow: '0 4px 14px rgba(46,134,193,.15)' }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#1C2833', marginBottom: '12px' }}>
            {fmt(selected.date)}（{DAY_NAMES[selected.dow]}）の詳細
          </div>

          {/* 当日サマリー */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '6px', marginBottom: '12px' }}>
            {[
              { label: '天気', val: selected.wData ? selected.wData.icon : '—', sub: selected.wData?.label || '' },
              { label: '潮',   val: getMoonIcon(selected.tideInfo.moon_age), sub: selected.tideInfo.tide_type },
              { label: '日の出', val: selected.sun ? formatTime(selected.sun.sunrise) : '—', sub: 'まずめ' },
              { label: '日の入', val: selected.sun ? formatTime(selected.sun.sunset) : '—', sub: 'まずめ' },
            ].map((row, i) => (
              <div key={i} style={{ background: '#F8F9FA', borderRadius: '10px', padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', lineHeight: 1.2 }}>{row.val}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#1C2833', marginTop: '3px' }}>{row.label}</div>
                <div style={{ fontSize: '10px', color: '#AAB7B8' }}>{row.sub}</div>
              </div>
            ))}
          </div>

          {/* 旬の魚 */}
          {peakFish.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#566573', marginBottom: '6px' }}>この時期の旬の魚</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {peakFish.map(f => (
                  <span key={f.id} style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '99px', background: '#FEF3CD', color: '#7D6608', fontWeight: 600 }}>
                    {f.emoji} {f.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* アドバイス */}
          <div style={{ padding: '9px 12px', background: '#FEF3CD', borderLeft: '3px solid #F4A820', borderRadius: '0 8px 8px 0', fontSize: '12px', color: '#7D6608', marginBottom: '10px' }}>
            {selected.score >= 4 ? '🎣 期待大！まずめを狙って。' : selected.score === 3 ? '🎣 まずめとポイント選びを意識。' : '🎣 条件厳しめ。サビキ釣りが無難。'}
          </div>

          {/* 近くのスポット別釣れる魚 */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#566573', marginBottom: '8px' }}>
              📍 スポット別・今月の釣れる魚
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {/* 公式スポット */}
              {spotsData.map(spot => {
                const month = selected.date.getMonth() + 1;
                const catchable = spot.fish_ids
                  .map(id => fishData.find(f => f.id === id))
                  .filter(f => f && f.season.includes(month));
                const peak = catchable.filter(f => f.season_peak.includes(month));
                if (catchable.length === 0) return null;
                return (
                  <div key={spot.id} style={{ background: '#F8F9FA', borderRadius: '10px', padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1C2833' }}>{spot.name}</span>
                        <span style={{ fontSize: '10px', color: '#AAB7B8', marginLeft: '6px' }}>{spot.region}</span>
                      </div>
                      <button
                        onClick={() => window.open(spot.external_tide_url, '_blank', 'noopener,noreferrer')}
                        style={{ fontSize: '10px', fontWeight: 700, color: '#2E86C1', padding: '3px 8px', border: '1px solid #2E86C1', borderRadius: '6px', background: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        釣果を見る
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {catchable.map(f => (
                        <span key={f.id} style={{
                          fontSize: '11px', padding: '2px 8px', borderRadius: '99px', fontWeight: 600,
                          background: peak.includes(f) ? '#FEF3CD' : '#EBF5FB',
                          color: peak.includes(f) ? '#7D6608' : '#2E86C1',
                        }}>
                          {f.emoji} {f.name}{peak.includes(f) ? ' 旬' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* マイスポット */}
              {mySpots.map(spot => {
                const lastVisit = spot.visits?.length
                  ? [...spot.visits].sort((a, b) => b.date.localeCompare(a.date))[0]
                  : null;
                return (
                  <div key={spot.id} style={{ background: '#FEF9E7', border: '1.5px solid #F4D03F', borderRadius: '10px', padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1C2833' }}>{spot.name}</span>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#B7770D', background: '#FEF3CD', padding: '1px 6px', borderRadius: '99px' }}>⭐ マイスポット</span>
                      </div>
                    </div>
                    {lastVisit ? (
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {lastVisit.catch && (
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '99px', fontWeight: 600, background: '#FDEBD0', color: '#A04000' }}>
                            🎣 {lastVisit.catch}
                          </span>
                        )}
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '99px', background: '#FEF9E7', color: '#B7770D' }}>
                          最終釣行: {lastVisit.date}
                        </span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '11px', color: '#AAB7B8' }}>まだ釣行記録がありません</div>
                    )}
                    {spot.note && (
                      <div style={{ fontSize: '11px', color: '#7D6608', marginTop: '4px' }}>📝 {spot.note}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ポイント選びへの誘導 */}
          <button
            onClick={() => navigate('/map')}
            style={{
              width: '100%', padding: '13px 16px',
              background: 'linear-gradient(135deg, #0C2D48, #1A5276)',
              border: 'none', borderRadius: '12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(12,45,72,.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '22px' }}>📍</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>釣り場を探す</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', marginTop: '2px' }}>この日に行くポイントをマップで選ぶ</div>
              </div>
            </div>
            <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)' }}>→</span>
          </button>
        </div>
      )}

      <div style={{ margin: '8px 16px 16px', fontSize: '10px', color: '#AAB7B8' }}>
        天気：気象庁 / 潮：月齢推定 / スコアは参考値
      </div>
    </div>
  );
};

export default Plan;
