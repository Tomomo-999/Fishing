import { useState, useEffect } from 'react';
import { loadCatchLog, addCatch, deleteCatch, FISH_OPTIONS, METHOD_OPTIONS } from '../utils/catchlog';
import { loadMySpots } from '../utils/storage';
import spots from '../data/spots.json';

const FISH_MAP = Object.fromEntries(FISH_OPTIONS.map(f => [f.id, f.name]));
const METHOD_MAP = Object.fromEntries(METHOD_OPTIONS.map(m => [m.id, m.name]));

const today = () => new Date().toISOString().slice(0, 10);

const card = {
  background: '#fff',
  borderRadius: '14px',
  boxShadow: '0 2px 12px rgba(12,45,72,.08)',
  padding: '14px 16px',
  marginBottom: '12px',
};

// SNSシェア
function shareEntry(entry) {
  const fishName = FISH_MAP[entry.fishId] || entry.fishId;
  const text = [
    `🎣 釣果記録【${entry.date}】`,
    `📍 ${entry.spotName}`,
    `🐟 ${fishName} ${entry.count}匹${entry.maxSize ? ` (最大${entry.maxSize}cm)` : ''}`,
    entry.method ? `仕掛け: ${METHOD_MAP[entry.method] || entry.method}` : '',
    entry.memo ? `📝 ${entry.memo}` : '',
    '',
    '#やまぐち海釣りナビ #山口釣り',
  ].filter(Boolean).join('\n');

  if (navigator.share) {
    navigator.share({ title: 'やまぐち海釣りナビ 釣果記録', text });
  } else {
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener');
  }
}

// 追加フォーム
function AddForm({ onAdd, onClose, mySpots }) {
  const allSpots = [
    ...spots.map(s => ({ id: s.id, name: s.name })),
    ...mySpots.map(s => ({ id: `my_${s.id}`, name: `⭐ ${s.name}` })),
    { id: 'other', name: 'その他（自由入力）' },
  ];

  const [form, setForm] = useState({
    date: today(),
    spotId: allSpots[0]?.id || '',
    spotName: allSpots[0]?.name || '',
    customSpot: '',
    fishId: 'aji',
    count: 1,
    maxSize: '',
    method: 'sabiki',
    memo: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSpotChange = (val) => {
    const found = allSpots.find(s => s.id === val);
    set('spotId', val);
    set('spotName', found ? found.name : '');
  };

  const handleSubmit = () => {
    const spotName = form.spotId === 'other' ? form.customSpot : form.spotName;
    if (!spotName || !form.fishId || !form.count) return;
    onAdd({
      date: form.date,
      spotId: form.spotId,
      spotName,
      fishId: form.fishId,
      fishName: FISH_MAP[form.fishId] || form.fishId,
      count: Number(form.count),
      maxSize: form.maxSize ? Number(form.maxSize) : null,
      method: form.method,
      memo: form.memo.trim(),
    });
    onClose();
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '10px',
    border: '1.5px solid #D5D8DC', fontSize: '15px',
    outline: 'none', boxSizing: 'border-box', background: '#fff',
  };
  const labelStyle = { fontSize: '12px', color: '#566573', fontWeight: 600, marginBottom: '4px', display: 'block' };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200,
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div style={{
        width: '100%', maxWidth: '430px', margin: '0 auto',
        background: '#F4F6F9', borderRadius: '20px 20px 0 0',
        padding: '20px 16px 40px', maxHeight: '85vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <span style={{ fontSize: '17px', fontWeight: 800, color: '#1C2833' }}>🎣 釣果を記録</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#AAB7B8' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>日付</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>釣り場</label>
            <select value={form.spotId} onChange={e => handleSpotChange(e.target.value)} style={inputStyle}>
              {allSpots.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {form.spotId === 'other' && (
              <input
                type="text" placeholder="釣り場名を入力" value={form.customSpot}
                onChange={e => set('customSpot', e.target.value)}
                style={{ ...inputStyle, marginTop: '8px' }}
              />
            )}
          </div>

          <div>
            <label style={labelStyle}>魚種</label>
            <select value={form.fishId} onChange={e => set('fishId', e.target.value)} style={inputStyle}>
              {FISH_OPTIONS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>釣れた数（匹）</label>
              <input type="number" min="1" value={form.count} onChange={e => set('count', e.target.value)} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>最大サイズ（cm）</label>
              <input type="number" min="1" placeholder="任意" value={form.maxSize} onChange={e => set('maxSize', e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>釣り方</label>
            <select value={form.method} onChange={e => set('method', e.target.value)} style={inputStyle}>
              {METHOD_OPTIONS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>メモ（任意）</label>
            <textarea
              rows={2} placeholder="エサの種類、天気、ポイントなど"
              value={form.memo} onChange={e => set('memo', e.target.value)}
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>

          <button
            onClick={handleSubmit}
            style={{
              width: '100%', padding: '14px', borderRadius: '12px',
              background: 'linear-gradient(135deg,#2E86C1,#1A5276)',
              color: '#fff', fontWeight: 800, fontSize: '16px',
              border: 'none', cursor: 'pointer', marginTop: '4px',
            }}
          >
            記録する
          </button>
        </div>
      </div>
    </div>
  );
}

// 統計バー
function Stats({ entries }) {
  if (!entries.length) return null;
  const total = entries.reduce((s, e) => s + e.count, 0);
  const byFish = {};
  entries.forEach(e => { byFish[e.fishName] = (byFish[e.fishName] || 0) + e.count; });
  const topFish = Object.entries(byFish).sort((a, b) => b[1] - a[1])[0];
  return (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
      {[
        { label: '総釣果', val: `${total}匹`, color: '#2E86C1' },
        { label: '記録数', val: `${entries.length}回`, color: '#27AE60' },
        { label: '一番釣れた', val: topFish?.[0] || '-', color: '#E67E22' },
      ].map(({ label, val, color }) => (
        <div key={label} style={{ ...card, flex: 1, padding: '10px', marginBottom: 0, textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#566573', marginBottom: '3px' }}>{label}</div>
          <div style={{ fontSize: '15px', fontWeight: 800, color }}>{val}</div>
        </div>
      ))}
    </div>
  );
}

export default function CatchLog() {
  const [entries, setEntries] = useState([]);
  const [mySpots, setMySpots] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    setEntries(loadCatchLog());
    setMySpots(loadMySpots());
  }, []);

  const handleAdd = (entry) => {
    addCatch(entry);
    setEntries(loadCatchLog());
  };

  const handleDelete = (id) => {
    deleteCatch(id);
    setEntries(loadCatchLog());
    setDeleteId(null);
  };

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', padding: '16px 16px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#1C2833', margin: 0 }}>🎣 釣果記録</h1>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '9px 18px', borderRadius: '20px',
            background: 'linear-gradient(135deg,#2E86C1,#1A5276)',
            color: '#fff', fontWeight: 700, fontSize: '14px',
            border: 'none', cursor: 'pointer',
          }}
        >
          ＋ 記録する
        </button>
      </div>

      <Stats entries={entries} />

      {entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#AAB7B8' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎣</div>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>まだ記録がありません</div>
          <div style={{ fontSize: '13px' }}>釣れた魚を記録してみよう！</div>
        </div>
      ) : (
        entries.map(entry => (
          <div key={entry.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', color: '#566573', marginBottom: '4px' }}>
                  {entry.date} · {entry.spotName}
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#1C2833', marginBottom: '2px' }}>
                  🐟 {entry.fishName}
                  <span style={{ fontSize: '14px', color: '#2E86C1', marginLeft: '8px' }}>{entry.count}匹</span>
                  {entry.maxSize && <span style={{ fontSize: '12px', color: '#566573', marginLeft: '6px' }}>最大{entry.maxSize}cm</span>}
                </div>
                {entry.method && (
                  <div style={{ fontSize: '12px', color: '#566573' }}>
                    {METHOD_MAP[entry.method] || entry.method}
                  </div>
                )}
                {entry.memo && (
                  <div style={{ fontSize: '12px', color: '#7F8C8D', marginTop: '4px', fontStyle: 'italic' }}>
                    {entry.memo}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginLeft: '8px' }}>
                <button
                  onClick={() => shareEntry(entry)}
                  style={{
                    padding: '7px 12px', borderRadius: '10px',
                    background: '#EBF5FB', color: '#2E86C1',
                    border: '1.5px solid #AED6F1', fontSize: '13px',
                    fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  シェア
                </button>
                <button
                  onClick={() => setDeleteId(entry.id)}
                  style={{
                    padding: '7px 10px', borderRadius: '10px',
                    background: '#FDEDEC', color: '#E74C3C',
                    border: '1.5px solid #F1948A', fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  🗑
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {showForm && (
        <AddForm
          onAdd={handleAdd}
          onClose={() => setShowForm(false)}
          mySpots={mySpots}
        />
      )}

      {deleteId && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 300,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', maxWidth: '320px', width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>この記録を削除しますか？</div>
            <div style={{ fontSize: '13px', color: '#566573', marginBottom: '20px' }}>削除すると元に戻せません</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1.5px solid #D5D8DC', background: '#fff', fontSize: '14px', cursor: 'pointer' }}>
                キャンセル
              </button>
              <button onClick={() => handleDelete(deleteId)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#E74C3C', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
