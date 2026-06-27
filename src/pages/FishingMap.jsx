import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import spotsData from '../data/spots.json';
import fishData from '../data/fish.json';
import { loadMySpots } from '../utils/storage';

const LAT = 34.18, LNG = 131.47;

const makeIcon = (emoji, size = 32, bg = '#fff', border = '#2E86C1') => L.divIcon({
  html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};border:2.5px solid ${border};display:flex;align-items:center;justify-content:center;font-size:${size*0.55}px;box-shadow:0 2px 6px rgba(0,0,0,.25)">${emoji}</div>`,
  className: '', iconSize: [size, size], iconAnchor: [size/2, size/2],
});

const SEA_COLORS = { '日本海': '#2E86C1', '瀬戸内海': '#27AE60', '響灘': '#8E44AD', '周防灘': '#E67E22' };

const FILTER_DEFS = [
  { key: 'all',    label: 'すべて' },
  { key: 'public', label: '公共スポット' },
  { key: 'my',     label: 'マイスポット' },
  { key: 'toilet', label: '🚽トイレあり' },
  { key: 'night',  label: '🌙夜釣りOK' },
  { key: 'beginner', label: '🔰初心者向け' },
];

const FishingMap = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const markersRef   = useRef([]);
  const [filter,     setFilter]     = useState('all');
  const [selected,   setSelected]   = useState(null); // { type: 'public'|'my', data }
  const [mySpots,    setMySpots]    = useState([]);

  useEffect(() => { setMySpots(loadMySpots()); }, []);

  // マップ初期化
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: false, attributionControl: false }).setView([LAT, LNG], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.attribution({ position: 'bottomleft', prefix: '© OpenStreetMap' }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // マーカー描画
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    const showPublic = filter === 'all' || filter === 'public' || filter === 'toilet' || filter === 'night' || filter === 'beginner';
    const showMy     = filter === 'all' || filter === 'my';

    // 公共スポット
    if (showPublic) {
      spotsData.forEach(spot => {
        if (filter === 'toilet'    && !spot.facilities?.toilet) return;
        if (filter === 'night'     && !spot.facilities?.night_fishing_ok) return;
        if (filter === 'beginner'  && !spot.beginner_friendly) return;

        const color = SEA_COLORS[spot.sea_area] || '#566573';
        const marker = L.marker([spot.lat, spot.lng], {
          icon: makeIcon('🎣', 36, '#fff', color),
          zIndexOffset: 100,
        }).addTo(map);

        marker.on('click', () => setSelected({ type: 'public', data: spot }));
        markersRef.current.push(marker);
      });
    }

    // マイスポット
    if (showMy) {
      mySpots.filter(s => s.lat && s.lng).forEach(spot => {
        const marker = L.marker([spot.lat, spot.lng], {
          icon: makeIcon('⭐', 34, '#FEF3CD', '#F4A820'),
          zIndexOffset: 200,
        }).addTo(map);
        marker.on('click', () => setSelected({ type: 'my', data: spot }));
        markersRef.current.push(marker);
      });
    }
  }, [filter, mySpots]);

  const closePanel = useCallback(() => setSelected(null), []);

  const goToSpot = (lat, lng) => {
    mapRef.current?.flyTo([lat, lng], 15, { duration: 0.8 });
    closePanel();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
      {/* 地図本体 */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* ヘッダーバー */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(12,45,72,0.93)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', paddingTop: 'calc(10px + env(safe-area-inset-top))' }}>
        <button onClick={() => navigate(-1)}
          style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '18px', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ←
        </button>
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', flex: 1 }}>やまぐち海釣りマップ</div>
        <button onClick={() => { mapRef.current?.flyTo([LAT, LNG], 10, { duration: 0.8 }); }}
          style={{ padding: '6px 10px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '11px', cursor: 'pointer' }}>
          全体
        </button>
      </div>

      {/* フィルタータブ */}
      <div style={{ position: 'absolute', top: 'calc(60px + env(safe-area-inset-top))', left: 0, right: 0, zIndex: 999, padding: '8px 10px', display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {FILTER_DEFS.map(f => (
          <button key={f.key} onClick={() => { setFilter(f.key); setSelected(null); }}
            style={{ padding: '6px 12px', borderRadius: '20px', border: 'none', background: filter === f.key ? '#2E86C1' : 'rgba(255,255,255,0.92)', color: filter === f.key ? '#fff' : '#1C2833', fontSize: '12px', fontWeight: 600, cursor: 'pointer', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,.2)' }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* 凡例 */}
      <div style={{ position: 'absolute', top: 'calc(108px + env(safe-area-inset-top))', right: '10px', zIndex: 999, background: 'rgba(255,255,255,0.92)', borderRadius: '8px', padding: '6px 10px', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }}>
        {Object.entries(SEA_COLORS).map(([area, color]) => (
          <div key={area} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#1C2833', marginBottom: '2px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0 }} />
            {area}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#7D6608', marginTop: '2px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F4A820', flexShrink: 0 }} />
          マイスポット
        </div>
      </div>

      {/* 詳細パネル（スライドアップ） */}
      {selected && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1001, background: '#fff', borderRadius: '20px 20px 0 0', boxShadow: '0 -4px 20px rgba(0,0,0,.18)', paddingBottom: 'env(safe-area-inset-bottom)', maxHeight: '55vh', overflowY: 'auto' }}>
          {/* ドラッグハンドル */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
            <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: '#E5EAF0' }} />
          </div>

          {selected.type === 'public' ? (
            <PublicSpotPanel spot={selected.data} onClose={closePanel} onFly={goToSpot} />
          ) : (
            <MySpotPanel spot={selected.data} onClose={closePanel} onFly={goToSpot} />
          )}
        </div>
      )}

      {/* タップで閉じるオーバーレイ */}
      {selected && (
        <div onClick={closePanel} style={{ position: 'absolute', inset: 0, zIndex: 1000 }} />
      )}
    </div>
  );
};

// ─── 公共スポットパネル ──────────────────────────────────────
const PublicSpotPanel = ({ spot, onClose, onFly }) => {
  const fish = spot.fish_ids?.map(id => fishData.find(f => f.id === id)).filter(Boolean) || [];
  const facs = spot.facilities || {};

  const FAC_ICONS = [
    { key: 'toilet',          icon: '🚽', label: 'トイレ' },
    { key: 'handwash',        icon: '🚿', label: '手洗い' },
    { key: 'parking',         icon: '🅿️', label: '駐車場' },
    { key: 'parking_fee',     icon: '💴', label: '有料P', invert: true },
    { key: 'restaurant',      icon: '🍴', label: '飲食' },
    { key: 'convenience',     icon: '🏪', label: 'コンビニ' },
    { key: 'street_light',    icon: '💡', label: '街灯' },
    { key: 'night_fishing_ok',icon: '🌙', label: '夜釣りOK' },
  ];

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#1C2833' }}>{spot.name}</div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '99px', background: '#F0F8FF', color: SEA_COLORS[spot.sea_area] || '#566573', fontWeight: 600 }}>{spot.sea_area}</span>
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '99px', background: '#F8F9FA', color: '#566573' }}>{spot.region}</span>
            {spot.beginner_friendly && <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '99px', background: '#D5F5E3', color: '#2D6A4F', fontWeight: 600 }}>🔰 初心者OK</span>}
          </div>
        </div>
        <button onClick={onClose} style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #E5EAF0', background: '#F8F9FA', fontSize: '14px', cursor: 'pointer', flexShrink: 0 }}>×</button>
      </div>

      {/* 設備 */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
        {FAC_ICONS.filter(f => f.invert ? facs[f.key] === false : facs[f.key]).map(f => (
          <span key={f.key} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: '#F0F8FF', color: '#566573' }}>
            {f.icon} {f.label}
          </span>
        ))}
      </div>

      {/* 釣れる魚 */}
      {fish.length > 0 && (
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {fish.map(f => (
            <span key={f.id} style={{ fontSize: '12px', padding: '3px 9px', borderRadius: '99px', background: '#FEF3CD', color: '#7D6608' }}>{f.emoji} {f.name}</span>
          ))}
        </div>
      )}

      {spot.caution && (
        <div style={{ padding: '8px 10px', background: '#FADBD8', borderRadius: '6px', fontSize: '11px', color: '#E74C3C', marginBottom: '10px', lineHeight: 1.5 }}>
          ⚠️ {spot.caution}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => onFly(spot.lat, spot.lng)}
          style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #E5EAF0', background: '#F8F9FA', color: '#1C2833', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>
          📍 ズームイン
        </button>
        <button onClick={() => window.open(`https://www.google.com/maps?q=${spot.lat},${spot.lng}`, '_blank', 'noopener,noreferrer')}
          style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#2E86C1', color: '#fff', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>
          🗺️ Googleマップ
        </button>
      </div>
    </div>
  );
};

// ─── マイスポットパネル ──────────────────────────────────────
const MySpotPanel = ({ spot, onClose, onFly }) => {
  const lastVisit = spot.visits?.length
    ? [...spot.visits].sort((a, b) => b.date.localeCompare(a.date))[0]
    : null;

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#1C2833' }}>⭐ {spot.name}</div>
          <div style={{ fontSize: '12px', color: '#566573', marginTop: '2px' }}>
            訪問 {spot.visits?.length || 0}回
            {lastVisit && ` · 最終: ${lastVisit.date}`}
          </div>
        </div>
        <button onClick={onClose} style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #E5EAF0', background: '#F8F9FA', fontSize: '14px', cursor: 'pointer', flexShrink: 0 }}>×</button>
      </div>

      {spot.note && (
        <div style={{ padding: '8px 10px', background: '#F8F9FA', borderRadius: '6px', fontSize: '12px', color: '#566573', marginBottom: '10px', lineHeight: 1.5 }}>
          📝 {spot.note}
        </div>
      )}

      {lastVisit?.catch && (
        <div style={{ padding: '8px 10px', background: '#FEF3CD', borderRadius: '6px', fontSize: '12px', color: '#7D6608', marginBottom: '10px' }}>
          🎣 直近の釣果: {lastVisit.catch}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => onFly(spot.lat, spot.lng)}
          style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #E5EAF0', background: '#F8F9FA', color: '#1C2833', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>
          📍 ズームイン
        </button>
        <button onClick={() => window.open(`https://www.google.com/maps?q=${spot.lat},${spot.lng}`, '_blank', 'noopener,noreferrer')}
          style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#F4A820', color: '#fff', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>
          🗺️ Googleマップ
        </button>
      </div>
    </div>
  );
};

export default FishingMap;
