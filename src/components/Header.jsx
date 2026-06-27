import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getSunTimes, getTimeZone, formatTime } from '../utils/sunTime';
import { useApp } from '../context/AppContext';

const LAT = 34.18, LNG = 131.47;

const SEA_AREAS = [
  { id: 'all',    label: '全エリア', icon: '🗺' },
  { id: '瀬戸内海', label: '瀬戸内海', icon: '🌊' },
  { id: '日本海',   label: '日本海',   icon: '🌊' },
  { id: '響灘',     label: '響灘',     icon: '🌊' },
];

const TIME_CONFIG = {
  mazume_morning: { label: '🌅 朝まずめ', class: 'mazume-morning', badge: '朝まずめ' },
  daytime:        { label: '☀️ 日中',     class: 'daytime',        badge: '日中' },
  mazume_evening: { label: '🌇 夕まずめ', class: 'mazume-evening', badge: '夕まずめ' },
  night:          { label: '🌙 夜釣り',   class: 'night',          badge: '夜釣り' },
};

const GRADIENTS = {
  mazume_morning: 'linear-gradient(160deg, #1A1A2E 0%, #E65C00 100%)',
  daytime:        'linear-gradient(160deg, #0C2D48 0%, #1A5276 100%)',
  mazume_evening: 'linear-gradient(160deg, #0C2D48 0%, #C0392B 80%, #E67E22 100%)',
  night:          'linear-gradient(160deg, #05091A 0%, #0C2D48 100%)',
};

const Header = () => {
  const location = useLocation();
  const { activeSeaArea, setActiveSeaArea } = useApp();
  const isSimplePage = ['/plan', '/myspots'].some(p => location.pathname.startsWith(p));

  const now = useMemo(() => new Date(), []);
  const sun = useMemo(() => getSunTimes(LAT, LNG, now), [now]);
  const timeZone = useMemo(() => getTimeZone(now, sun), [now, sun]);
  const tc = TIME_CONFIG[timeZone];

  const mazumeMsg = useMemo(() => {
    if (!sun) return '';
    const msgs = {
      mazume_morning: `朝まずめ中！日の出 ${formatTime(sun.sunrise)} / 最も魚の活性が高い時間帯。`,
      daytime:        `夕まずめは ${formatTime(new Date(sun.sunset.getTime() - 90 * 60000))} 頃スタート。`,
      mazume_evening: `夕まずめ中！日没 ${formatTime(sun.sunset)} / 帰り道のライトを準備。`,
      night:          `夜釣りモード。日の出 ${formatTime(sun.sunrise)} まで継続。複数人行動を推奨。`,
    };
    return msgs[timeZone] || '';
  }, [sun, timeZone]);

  return (
    <div style={{
      padding: isSimplePage ? '20px 16px 10px' : '20px 16px 16px',
      background: isSimplePage ? '#0C2D48' : GRADIENTS[timeZone],
      transition: 'background 0.8s ease',
    }}>
      {/* ロゴ行 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(255,255,255,0.12)', border: '0.5px solid rgba(255,255,255,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🐟</span>
            海釣りナビ
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '3px', marginLeft: '40px' }}>
            山口県 · 瀬戸内 / 日本海 / 響灘
          </div>
        </div>
        {!isSimplePage && (
          <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '99px', background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(4px)' }}>
            {tc.badge}
          </span>
        )}
      </div>

      {/* 海域バッジ */}
      {!isSimplePage && (
        <div style={{ display: 'flex', gap: '6px', marginTop: '12px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '2px' }}>
          {SEA_AREAS.map(a => (
            <button
              key={a.id}
              onClick={() => setActiveSeaArea(a.id)}
              style={{
                flexShrink: 0, padding: '5px 12px', borderRadius: '99px',
                fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: 'none',
                background: activeSeaArea === a.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                color: activeSeaArea === a.id ? '#fff' : 'rgba(255,255,255,0.65)',
                borderWidth: '0.5px', borderStyle: 'solid',
                borderColor: activeSeaArea === a.id ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap',
              }}
            >
              {a.icon} {a.label}
            </button>
          ))}
        </div>
      )}

      {/* まずめバナー */}
      {!isSimplePage && (
        <div style={{ marginTop: '10px', padding: '12px 14px', background: 'rgba(255,255,255,0.12)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#F4A820' }}>{tc.label}</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', marginTop: '4px', lineHeight: 1.5 }}>{mazumeMsg}</div>
        </div>
      )}
    </div>
  );
};

export default Header;
