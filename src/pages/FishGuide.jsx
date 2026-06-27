import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import fishData from '../data/fish.json';
import { FishPhoto, FISH_COLORS } from '../data/fishIllustrations.jsx';

const DIFF_LABELS = ['', '簡単', '普通', '難しい'];

// ── 横グラデーション季節バー ──────────────────────────────
const SeasonBar = ({ fish, currentMonth }) => {
  const color = FISH_COLORS[fish.id] || '#2E86C1';

  return (
    <div style={{ padding: '0 0 2px' }}>
      {/* 月ラベル */}
      <div style={{ display: 'flex', marginBottom: '3px' }}>
        {Array.from({ length: 12 }, (_, i) => {
          const m = i + 1;
          const isNow = m === currentMonth;
          return (
            <div key={m} style={{ flex: 1, textAlign: 'center', fontSize: '9px', fontWeight: isNow ? 800 : 400, color: isNow ? color : '#AAB7B8' }}>
              {m}
            </div>
          );
        })}
      </div>
      {/* バー */}
      <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', gap: '1px' }}>
        {Array.from({ length: 12 }, (_, i) => {
          const m = i + 1;
          const isPeak = fish.season_peak.includes(m);
          const isOn   = fish.season.includes(m);
          return (
            <div key={m} style={{
              flex: 1,
              background: isPeak ? color : isOn ? `${color}60` : '#E5EAF0',
              position: 'relative',
            }}>
              {/* 今月インジケーター */}
              {m === currentMonth && (
                <div style={{ position: 'absolute', bottom: '-3px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', borderRadius: '50%', background: color }} />
              )}
            </div>
          );
        })}
      </div>
      {/* 凡例 */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
        <span style={{ fontSize: '9px', color: '#AAB7B8', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '6px', borderRadius: '2px', background: color }} />旬
        </span>
        <span style={{ fontSize: '9px', color: '#AAB7B8', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '6px', borderRadius: '2px', background: `${color}60` }} />釣れる
        </span>
        <span style={{ fontSize: '9px', color: '#AAB7B8', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '6px', borderRadius: '2px', background: '#E5EAF0' }} />シーズン外
        </span>
      </div>
    </div>
  );
};

// ── 魚一覧カード ──────────────────────────────────────────
const FishList = ({ selectedMonth, onSelectFish }) => {
  const inSeason = fishData.filter(f => f.season.includes(selectedMonth));
  const notIn    = fishData.filter(f => !f.season.includes(selectedMonth));

  return (
    <div>
      <h2 className="section-header">{selectedMonth}月に釣れる魚（{inSeason.length}種）</h2>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[...inSeason, ...notIn].map(f => {
          const active = f.season.includes(selectedMonth);
          const isPeak = f.season_peak.includes(selectedMonth);
          const color  = FISH_COLORS[f.id] || '#2E86C1';

          return (
            <button
              key={f.id}
              onClick={() => onSelectFish(f.id)}
              className="card"
              style={{
                padding: 0, overflow: 'hidden', opacity: active ? 1 : 0.4,
                border: isPeak ? `2px solid ${color}` : undefined,
                textAlign: 'left', width: '100%',
              }}
            >
              {/* カラーバー（上） */}
              {active && <div style={{ height: '3px', background: isPeak ? color : `${color}60` }} />}

              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                {/* 魚写真 */}
                <div style={{
                  width: '130px', flexShrink: 0,
                  background: `${color}10`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '8px',
                }}>
                  <FishPhoto fishId={f.id} emoji={f.emoji} width={114} height={76} style={{ borderRadius: '8px' }} />
                </div>

                {/* テキスト・バー */}
                <div style={{ flex: 1, padding: '10px 12px 10px 10px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#1C2833' }}>{f.name}</span>
                    {isPeak && <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '99px', background: color, color: '#fff', fontWeight: 700 }}>旬</span>}
                  </div>
                  <div style={{ fontSize: '11px', color: '#566573', marginBottom: '8px' }}>
                    {f.habitat?.join(' / ')}
                  </div>
                  {/* 季節バー */}
                  <SeasonBar fish={f} currentMonth={selectedMonth} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── 魚詳細 ───────────────────────────────────────────────
const FishDetail = ({ fishId, onBack, currentMonth }) => {
  const f = fishData.find(x => x.id === fishId);
  if (!f) return null;
  const color = FISH_COLORS[f.id] || '#2E86C1';

  return (
    <div>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '14px 16px', fontSize: '14px', color: '#2E86C1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
        ← 一覧に戻る
      </button>

      {/* ヒーローカード */}
      <div style={{ margin: '0 16px 14px', borderRadius: '16px', overflow: 'hidden', background: `linear-gradient(135deg, ${color}18, ${color}08)`, border: `1.5px solid ${color}30` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px' }}>
          <FishPhoto fishId={f.id} emoji={f.emoji} width={160} height={100} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,.12)' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#1C2833' }}>{f.name}</div>
            <div style={{ fontSize: '12px', color: '#566573', marginTop: '4px', lineHeight: 1.6 }}>{f.description}</div>
          </div>
        </div>

        {/* 季節バー（大きめ） */}
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#566573', marginBottom: '8px' }}>釣れる時期</div>
          <SeasonBar fish={f} currentMonth={currentMonth} />
        </div>
      </div>

      {/* 難易度 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '0 16px 8px' }}>
        {[
          { label: '釣る難しさ', val: f.catch_difficulty },
          { label: '捌く難しさ', val: f.cook_difficulty },
        ].map(({ label, val }) => (
          <div key={label} className="card" style={{ padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#566573', marginBottom: '5px' }}>{label}</div>
            <div style={{ fontSize: '18px', color: '#F4A820' }}>
              {'★'.repeat(val)}<span style={{ color: '#E5EAF0' }}>{'★'.repeat(3 - val)}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#566573', marginTop: '3px' }}>{DIFF_LABELS[val]}</div>
          </div>
        ))}
      </div>

      {/* 捌き・調理 */}
      <h2 className="section-header">捌き方・調理のコツ</h2>
      <div style={{ margin: '0 16px 8px', padding: '12px 14px', background: '#FEF3CD', borderLeft: `3px solid ${color}`, borderRadius: '0 10px 10px 0', fontSize: '13px', lineHeight: 1.7, color: '#7D6608' }}>
        {f.cook_tips}
      </div>

      {/* YouTube動画 */}
      <h2 className="section-header">動画で学ぶ</h2>
      <div style={{ margin: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[
          { label: '🎣 釣り方動画を探す', query: `${f.name} 釣り方` },
          { label: '🔪 捌き方・調理動画を探す', query: `${f.name} 捌き方 調理` },
        ].map(({ label, query }) => (
          <button
            key={query}
            onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer')}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 14px', borderRadius: '10px',
              background: '#fff', border: '1.5px solid #E5EAF0',
              cursor: 'pointer', textAlign: 'left', width: '100%',
              boxShadow: '0 1px 3px rgba(0,0,0,.05)',
            }}
          >
            <span style={{ fontSize: '22px', flexShrink: 0 }}>▶️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1C2833' }}>{label}</div>
              <div style={{ fontSize: '11px', color: '#AAB7B8', marginTop: '2px' }}>「{query}」でYouTube検索</div>
            </div>
            <span style={{ fontSize: '12px', color: '#AAB7B8' }}>→</span>
          </button>
        ))}
      </div>

      {/* Amazon */}
      {f.loss_hint && (
        <>
          <h2 className="section-header">消耗品ヒント</h2>
          <div style={{ margin: '0 16px 8px' }} className="card">
            <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>⚠️</span>
              <div style={{ flex: 1, fontSize: '12px', color: '#566573', lineHeight: 1.5 }}>{f.loss_hint}</div>
              <button
                onClick={() => window.open(`https://www.amazon.co.jp/s?k=${encodeURIComponent('エギ 3号 セット')}`, '_blank', 'noopener,noreferrer')}
                style={{ fontSize: '11px', fontWeight: 700, color: '#2E86C1', padding: '6px 10px', border: '1px solid #2E86C1', borderRadius: '8px', background: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Amazon PR
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ── メインページ ──────────────────────────────────────────
const FishGuide = () => {
  const location = useLocation();
  const now = useMemo(() => new Date(), []);
  const currentMonth = now.getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedFishId, setSelectedFishId] = useState(location.state?.fishId || null);

  return (
    <div>
      {selectedFishId ? (
        <FishDetail fishId={selectedFishId} onBack={() => setSelectedFishId(null)} currentMonth={currentMonth} />
      ) : (
        <>
          {/* 月選択 */}
          <div style={{ display: 'flex', gap: '6px', padding: '12px 16px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                style={{
                  minWidth: '40px', height: '36px', borderRadius: '8px',
                  border: 'none',
                  background: selectedMonth === m ? '#2E86C1' : '#fff',
                  color: selectedMonth === m ? '#fff' : '#566573',
                  fontSize: '12px', fontWeight: selectedMonth === m ? 700 : 500,
                  cursor: 'pointer', flexShrink: 0,
                  boxShadow: selectedMonth === m ? '0 2px 8px rgba(46,134,193,.3)' : '0 1px 3px rgba(0,0,0,.06)',
                }}
              >
                {m}月
              </button>
            ))}
          </div>
          <FishList selectedMonth={selectedMonth} onSelectFish={setSelectedFishId} />
        </>
      )}
    </div>
  );
};

export default FishGuide;
