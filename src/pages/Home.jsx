import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import fishData from '../data/fish.json';
import { getSunTimes, getTimeZone } from '../utils/sunTime';
import { buildChecklist } from '../utils/checklist';
import { useApp } from '../context/AppContext';

const LAT = 34.18, LNG = 131.47;

const Home = () => {
  const navigate = useNavigate();
  const { currentSpotType } = useApp();
  const now = useMemo(() => new Date(), []);
  const currentMonth = now.getMonth() + 1;
  const sun = useMemo(() => getSunTimes(LAT, LNG, now), [now]);
  const timeZone = useMemo(() => getTimeZone(now, sun), [now, sun]);

  const monthFish = fishData.filter(f => f.season.includes(currentMonth));
  const peakFish  = monthFish.filter(f => f.season_peak.includes(currentMonth));
  const checklist = buildChecklist(currentSpotType, timeZone);

  const ZONE_LABELS = { mazume_morning: '早朝', daytime: '日中', mazume_evening: '夕方', night: '夜釣り' };

  return (
    <div style={{ paddingBottom: '8px' }}>

      {/* ── 今月釣れる魚 ─────────────────────── */}
      <h2 className="section-header">今月釣れる魚</h2>
      <div style={{ margin: '0 16px 4px' }}>
        <div style={{
          borderRadius: '16px', overflow: 'hidden',
          background: 'linear-gradient(140deg, #0C2D48 0%, #1A5276 60%, #2E86C1 100%)',
          boxShadow: '0 4px 16px rgba(12,45,72,.25)',
        }}>
          <div style={{ padding: '16px 16px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{currentMonth}月 · {monthFish.length}種が釣れます</div>
              {peakFish.length > 0 && (
                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '99px', background: '#F4A820', color: '#fff', fontWeight: 700 }}>旬 {peakFish.length}種</span>
              )}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
              {peakFish.length > 0 ? '旬の魚が揃っています！' : 'この季節の釣りを楽しもう'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {monthFish.map(f => (
                <button
                  key={f.id}
                  onClick={() => navigate('/fish', { state: { fishId: f.id } })}
                  style={{
                    fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '99px',
                    background: f.season_peak.includes(currentMonth) ? 'rgba(244,168,32,.25)' : 'rgba(255,255,255,.12)',
                    color: f.season_peak.includes(currentMonth) ? '#FEF3CD' : 'rgba(255,255,255,.9)',
                    border: f.season_peak.includes(currentMonth) ? '1px solid rgba(244,168,32,.5)' : '1px solid rgba(255,255,255,.2)',
                  }}
                >
                  {f.emoji} {f.name}
                </button>
              ))}
            </div>
          </div>
          {/* 波形ボトム */}
          <svg viewBox="0 0 430 20" style={{ display: 'block', marginTop: '-1px' }} preserveAspectRatio="none" height="20">
            <path d="M0,10 C72,0 144,20 216,10 C288,0 360,20 430,10 L430,20 L0,20 Z" fill="#F0F5FA" />
          </svg>
        </div>
      </div>

      {/* ── 海況・外部情報 ───────────────────── */}
      <h2 className="section-header">海況・外部情報</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', padding: '0 16px 4px' }}>
        {[
          { icon: '🌤', label: '天気・風速', sub: 'Windy', url: 'https://www.windy.com/?34.18,131.47,10', bg: 'linear-gradient(135deg,#EBF5FB,#D6EAF8)' },
          { icon: '🌊', label: '潮まわり',   sub: '潮汐表', url: 'https://www.tides.net/japan/', bg: 'linear-gradient(135deg,#E8F8F5,#D1F2EB)' },
          { icon: '🐟', label: '釣果情報',   sub: 'Anglers', url: 'https://anglers.jp/areas/2008', bg: 'linear-gradient(135deg,#FEF9E7,#FDEBD0)' },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
            style={{ background: item.bg, borderRadius: '12px', border: '1px solid rgba(0,0,0,.04)', padding: '12px 8px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}
          >
            <div style={{ fontSize: '22px', marginBottom: '4px' }}>{item.icon}</div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#1C2833' }}>{item.label}</div>
            <div style={{ fontSize: '9px', color: '#566573', marginTop: '2px' }}>{item.sub} →</div>
          </button>
        ))}
      </div>

      {/* ── クイックガイド ───────────────────── */}
      <h2 className="section-header">クイックガイド</h2>
      <div style={{ margin: '0 16px 4px' }} className="card">
        {[
          { icon: '📍', emoji: '🏖', title: '釣り場を探す', sub: 'トイレ・設備・混雑で絞り込み', to: '/spots', color: '#EBF5FB', accent: '#2E86C1' },
          { icon: '📖', emoji: '🎣', title: '釣り方を学ぶ', sub: 'ステップ解説・必要な道具',       to: '/guide', color: '#EAFAF1', accent: '#27AE60' },
        ].map((item, i) => (
          <div key={item.to}>
            {i > 0 && <div style={{ height: '1px', background: 'rgba(0,0,0,.05)', margin: '0 14px' }} />}
            <button
              onClick={() => navigate(item.to)}
              style={{ width: '100%', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', textAlign: 'left' }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: item.color, border: `1px solid ${item.accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                {item.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1C2833' }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: '#566573', marginTop: '2px' }}>{item.sub}</div>
              </div>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#F0F5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#AAB7B8', fontSize: '14px', flexShrink: 0 }}>›</div>
            </button>
          </div>
        ))}
      </div>

      {/* ── 持ち物チェックリスト ─────────────── */}
      <h2 className="section-header">今日の持ち物チェック</h2>
      <div style={{ margin: '0 16px 4px' }} className="card">
        <div style={{ padding: '12px 14px 8px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(0,0,0,.05)' }}>
          <span style={{ fontSize: '18px' }}>🎒</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1C2833' }}>
            {ZONE_LABELS[timeZone]}の持ち物チェック
          </span>
          <span style={{ marginLeft: 'auto', fontSize: '10px', padding: '2px 8px', borderRadius: '99px', background: '#F0F5FA', color: '#566573' }}>
            {checklist.length}点
          </span>
        </div>
        <div style={{ padding: '4px 14px 10px' }}>
          {checklist.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: i < checklist.length - 1 ? '1px solid rgba(0,0,0,.04)' : 'none' }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#1C2833' }}>{item.label}</span>
                {item.note && <div style={{ fontSize: '11px', color: '#566573', marginTop: '2px', lineHeight: 1.4 }}>{item.note}</div>}
              </div>
              {item.badge && (
                <span style={{
                  fontSize: '10px', padding: '2px 8px', borderRadius: '99px', fontWeight: 700, flexShrink: 0,
                  background: item.badgeType === 'danger' ? '#FADBD8' : '#D5F5E3',
                  color:      item.badgeType === 'danger' ? '#C0392B' : '#2D6A4F',
                }}>{item.badge}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── 免責 ─────────────────────────────── */}
      <div style={{ margin: '8px 16px 8px', padding: '10px 12px', background: '#FEF3CD', borderRadius: '10px', borderLeft: '3px solid #F4A820', fontSize: '11px', color: '#7D6608', lineHeight: 1.6 }}>
        ⚠️ 釣り禁止・立入禁止エリアは随時変更されます。必ず現地の表示を確認してください。タコは山口県の一部海域で採捕禁止です。
      </div>
    </div>
  );
};

export default Home;
