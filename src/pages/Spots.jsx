import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import spotsData from '../data/spots.json';
import fishData from '../data/fish.json';
import { useApp } from '../context/AppContext';
import { useApp as useAppCtx } from '../context/AppContext';

const FILTERS = [
  { id: 'beginner',     label: '初心者向け',   icon: '🌟', fn: s => s.beginner_friendly },
  { id: 'toilet',       label: 'トイレあり',   icon: '🚻', fn: s => s.facilities.toilet },
  { id: 'restaurant',   label: '食事あり',     icon: '🍽', fn: s => s.facilities.restaurant },
  { id: 'handwash',     label: '手洗いあり',   icon: '🙌', fn: s => s.facilities.handwash },
  { id: 'free_parking', label: '無料駐車場',   icon: '🚗', fn: s => s.facilities.parking && !s.facilities.parking_fee },
  { id: 'ika',          label: 'イカ狙い',     icon: '🦑', fn: s => s.fish_ids.some(f => ['kouika','aori_ika','kensaki'].includes(f)) },
  { id: 'family',       label: 'ファミリー向け', icon: '👨‍👩‍👧', fn: s => s.facilities.toilet && s.facilities.restaurant && s.beginner_friendly },
  { id: 'morning',      label: '朝まずめ向き', icon: '🌅', fn: s => s.best_time?.includes('mazume_morning') },
  { id: 'night',        label: '夜釣りOK',     icon: '🌙', fn: s => s.facilities.night_fishing_ok },
  { id: 'light',        label: '街灯あり',     icon: '💡', fn: s => s.facilities.street_light },
];

const CONGESTION_COLORS = { low: '#2D6A4F', medium: '#F4A820', high: '#E74C3C' };
const CONGESTION_LABELS = { low: '🟢 空いている', medium: '🟡 やや混む', high: '🔴 混みやすい' };
const SEA_ACCENT = { '日本海': '#2E86C1', '瀬戸内海': '#27AE60', '響灘': '#8E44AD', '周防灘': '#E67E22' };

const getCongestion = (spot) => {
  const isWeekend = [0, 6].includes(new Date().getDay());
  return spot.congestion_pattern[isWeekend ? 'weekend' : 'weekday'];
};

// 釣り場一覧
const SpotList = ({ onSelectSpot }) => {
  const { activeSeaArea, setCurrentSpotType } = useApp();
  const [activeFilters, setActiveFilters] = useState([]);

  const toggleFilter = (id) => {
    setActiveFilters(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filtered = useMemo(() => {
    let spots = spotsData;
    if (activeSeaArea !== 'all') spots = spots.filter(s => s.sea_area === activeSeaArea);
    activeFilters.forEach(fid => {
      const f = FILTERS.find(x => x.id === fid);
      if (f) spots = spots.filter(f.fn);
    });
    return spots;
  }, [activeSeaArea, activeFilters]);

  return (
    <div>
      {/* フィルター */}
      <div style={{ display: 'flex', gap: '8px', padding: '12px 16px 8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => toggleFilter(f.id)}
            className={`filter-chip${activeFilters.includes(f.id) ? ' active' : ''}`}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      <h2 className="section-header">釣り場一覧（{filtered.length}件）</h2>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map(s => {
          const cong = getCongestion(s);
          const fishNames = s.fish_ids.slice(0, 3).map(id => {
            const f = fishData.find(x => x.id === id);
            return f ? { emoji: f.emoji, name: f.name } : null;
          }).filter(Boolean);

          const accent = SEA_ACCENT[s.sea_area] || '#566573';
          return (
            <div key={s.id} className="card" style={{ overflow: 'hidden' }}>
              {/* 海域カラーバー */}
              <div style={{ height: '4px', background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />
              {/* ヘッダー */}
              <div style={{ padding: '12px 14px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#1C2833' }}>{s.name}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: `${accent}18`, color: accent, fontWeight: 600 }}>{s.sea_area}</span>
                    <span style={{ fontSize: '11px', color: '#AAB7B8' }}>{s.region} / {s.type}</span>
                  </div>
                </div>
                {s.beginner_friendly && (
                  <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '99px', background: '#D5F5E3', color: '#2D6A4F', fontWeight: 700, flexShrink: 0 }}>🔰 初心者◎</span>
                )}
              </div>

              {/* 施設 */}
              <div style={{ padding: '0 14px 8px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {s.facilities.toilet     && <span style={{ fontSize: '13px', color: '#566573' }}>🚻 トイレ</span>}
                {s.facilities.handwash   && <span style={{ fontSize: '13px', color: '#566573' }}>🙌 手洗い</span>}
                {s.facilities.parking    && <span style={{ fontSize: '13px', color: '#566573' }}>🚗 駐車場{s.facilities.parking_fee ? '(有料)' : '(無料)'}</span>}
                {s.facilities.restaurant && <span style={{ fontSize: '13px', color: '#566573' }}>🍽 食事</span>}
                {s.facilities.convenience && <span style={{ fontSize: '13px', color: '#566573' }}>🏪 コンビニ</span>}
              </div>

              {/* 釣れる魚 */}
              <div style={{ padding: '8px 14px', background: `linear-gradient(90deg, ${accent}08, transparent)`, borderTop: '1px solid rgba(0,0,0,.05)', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {fishNames.map(f => (
                  <span key={f.name} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '99px', background: '#F0F8FF', border: '1px solid #E5EAF0', color: '#566573' }}>
                    {f.emoji}{f.name}
                  </span>
                ))}
              </div>

              {/* 混雑 */}
              <div style={{ padding: '8px 14px', borderTop: '1px solid #E5EAF0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: CONGESTION_COLORS[cong] }}>
                {CONGESTION_LABELS[cong]}
                <span style={{ fontSize: '11px', color: '#AAB7B8', marginLeft: '4px' }}>{[0,6].includes(new Date().getDay()) ? '週末' : '平日'}</span>
              </div>

              {/* ボタン */}
              <div style={{ padding: '8px 14px 12px', display: 'flex', gap: '8px', borderTop: '1px solid #E5EAF0' }}>
                <button
                  onClick={() => { setCurrentSpotType(s.spot_type || 'pier'); onSelectSpot(s.id); }}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #2E86C1', background: '#EBF5FB', color: '#2E86C1', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  詳細を見る →
                </button>
                <button
                  onClick={() => window.open(`/map?lat=${s.lat}&lng=${s.lng}&name=${encodeURIComponent(s.name)}&id=${s.id}`, '_blank', 'noopener,noreferrer')}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #2D6A4F', background: '#D5F5E3', color: '#2D6A4F', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  🗺 地図を開く
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 釣り場詳細
const SpotDetail = ({ spotId, onBack }) => {
  const s = spotsData.find(x => x.id === spotId);
  if (!s) return null;

  const cong = getCongestion(s);
  const fillRates = { low: 0.3, medium: 0.6, high: 0.9 };
  const filled = Math.round(s.max_anglers * fillRates[cong]);
  const fishList = s.fish_ids.map(id => fishData.find(x => x.id === id)).filter(Boolean);

  return (
    <div>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '14px 16px', fontSize: '14px', color: '#2E86C1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
        ← 一覧に戻る
      </button>

      {/* ヘッダー */}
      <div style={{ background: '#0C2D48', padding: '16px' }}>
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{s.name}</div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
          {s.region} / {s.type} {s.beginner_friendly ? '/ 初心者向け ✓' : ''}
        </div>
      </div>

      {/* 設備グリッド */}
      <div style={{ fontSize: '12px', fontWeight: 700, color: '#566573', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '12px 16px 8px' }}>設備情報</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '0 16px 12px' }}>
        {[
          { label: 'トイレ', v: s.facilities.toilet },
          { label: '手洗い場', v: s.facilities.handwash },
          { label: `駐車場${s.facilities.parking_fee ? '（有料）' : '（無料）'}`, v: s.facilities.parking },
          { label: '食事', v: s.facilities.restaurant },
          { label: 'コンビニ', v: s.facilities.convenience },
          { label: '初心者向け', v: s.beginner_friendly },
          { label: '街灯あり', v: s.facilities.street_light },
          { label: '夜釣りOK', v: s.facilities.night_fishing_ok },
        ].map(item => (
          <div key={item.label} style={{ background: '#fff', border: '1px solid #E5EAF0', borderRadius: '8px', padding: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
            <span style={{ color: item.v ? '#2D6A4F' : '#AAB7B8', fontSize: '14px' }}>{item.v ? '✓' : '×'}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* 周辺施設 */}
      <div style={{ fontSize: '12px', fontWeight: 700, color: '#566573', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '0 16px 8px' }}>周辺施設</div>
      <div style={{ margin: '0 16px 12px', padding: '12px', background: '#F0F8FF', borderLeft: '3px solid #2E86C1', borderRadius: '0 8px 8px 0', fontSize: '13px', lineHeight: 1.6 }}>
        {s.nearby_note}
      </div>

      {/* 混雑 */}
      <div style={{ fontSize: '12px', fontWeight: 700, color: '#566573', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '0 16px 8px' }}>混雑予測</div>
      <div style={{ margin: '0 16px 12px', background: '#fff', border: '1px solid #E5EAF0', borderRadius: '8px', padding: '12px 14px' }}>
        <div style={{ fontSize: '12px', color: '#566573', marginBottom: '8px' }}>📏 釣り人の目安間隔：約15m / 最大収容：約{s.max_anglers}人</div>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
          {Array.from({ length: s.max_anglers }, (_, i) => (
            <div key={i} style={{ height: '20px', flex: 1, borderRadius: '3px', background: i < filled ? CONGESTION_COLORS[cong] : '#E5EAF0' }} />
          ))}
        </div>
        <div style={{ fontSize: '12px', color: CONGESTION_COLORS[cong], fontWeight: 600 }}>
          {CONGESTION_LABELS[cong]}（{[0,6].includes(new Date().getDay()) ? '週末' : '平日'}の統計）
        </div>
      </div>

      {/* 釣れる魚 */}
      <div style={{ fontSize: '12px', fontWeight: 700, color: '#566573', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '0 16px 8px' }}>釣れる魚</div>
      <div style={{ margin: '0 16px 12px', padding: '12px 14px', background: '#fff', border: '1px solid #E5EAF0', borderRadius: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {fishList.map(f => (
          <span key={f.id} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '99px', background: '#F0F8FF', border: '1px solid #E5EAF0', color: '#566573' }}>
            {f.emoji}{f.name}
          </span>
        ))}
      </div>

      {/* アクセス */}
      <div style={{ fontSize: '12px', fontWeight: 700, color: '#566573', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '0 16px 8px' }}>アクセス</div>
      <div style={{ margin: '0 16px 12px', padding: '12px', background: '#F0F8FF', borderLeft: '3px solid #2E86C1', borderRadius: '0 8px 8px 0', fontSize: '13px', lineHeight: 1.6 }}>
        {s.access}
      </div>

      {/* ボタン */}
      <div style={{ display: 'flex', gap: '8px', margin: '0 16px 12px' }}>
        <button
          onClick={() => window.open(s.external_tide_url, '_blank', 'noopener,noreferrer')}
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #2E86C1', background: '#F0F8FF', color: '#2E86C1', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
        >
          🌊 潮汐・釣果情報 →
        </button>
        <button
          onClick={() => window.open(`/map?lat=${s.lat}&lng=${s.lng}&name=${encodeURIComponent(s.name)}&id=${s.id}`, '_blank', 'noopener,noreferrer')}
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #2D6A4F', background: '#D5F5E3', color: '#2D6A4F', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
        >
          🗺 地図・注釈を開く →
        </button>
      </div>

      {/* 注意事項 */}
      <div style={{ fontSize: '12px', fontWeight: 700, color: '#566573', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '0 16px 8px' }}>注意事項</div>
      <div style={{ margin: '0 16px 12px', padding: '12px', background: '#FEF3CD', borderLeft: '3px solid #F4A820', borderRadius: '0 8px 8px 0', fontSize: '12px', lineHeight: 1.6, color: '#7D6608' }}>
        ⚠️ {s.caution}
      </div>
    </div>
  );
};

const Spots = () => {
  const [selectedSpotId, setSelectedSpotId] = useState(null);

  return (
    <div>
      {selectedSpotId ? (
        <SpotDetail spotId={selectedSpotId} onBack={() => setSelectedSpotId(null)} />
      ) : (
        <SpotList onSelectSpot={setSelectedSpotId} />
      )}
    </div>
  );
};

export default Spots;
