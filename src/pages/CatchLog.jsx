import { useState, useEffect, useRef } from 'react';
import { loadCatchLog, addCatch, deleteCatch, FISH_OPTIONS, METHOD_OPTIONS } from '../utils/catchlog';
import { loadMySpots } from '../utils/storage';
import spots from '../data/spots.json';

const FISH_MAP   = Object.fromEntries(FISH_OPTIONS.map(f => [f.id, f.name]));
const METHOD_MAP = Object.fromEntries(METHOD_OPTIONS.map(m => [m.id, m.name]));

const todayStr = () => new Date().toISOString().slice(0, 10);

const card = {
  background: '#fff',
  borderRadius: '14px',
  boxShadow: '0 2px 12px rgba(12,45,72,.08)',
  padding: '14px 16px',
  marginBottom: '12px',
};

// 画像をcanvasで圧縮してbase64返却
async function compressImage(file, maxWidth = 800, quality = 0.75) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

// SNSシェア
function shareEntry(entry) {
  const fishName = FISH_MAP[entry.fishId] || entry.fishId;
  const text = [
    `🎣 釣果記録【${entry.date}】`,
    `📍 ${entry.spotName}`,
    `🐟 ${fishName} ${entry.count}匹${entry.maxSize ? ` (最大${entry.maxSize}cm)` : ''}`,
    entry.method ? `仕掛け: ${METHOD_MAP[entry.method] || entry.method}` : '',
    entry.memo   ? `📝 ${entry.memo}` : '',
    '',
    '#やまぐち海釣りナビ #山口釣り',
  ].filter(Boolean).join('\n');

  if (navigator.share) {
    navigator.share({ title: 'やまぐち海釣りナビ 釣果記録', text });
  } else {
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  }
}

// ── 追加フォーム ─────────────────────────────────────────────
function AddForm({ onAdd, onClose, mySpots }) {
  const allSpots = [
    ...spots.map(s  => ({ id: s.id,        name: s.name })),
    ...mySpots.map(s => ({ id: `my_${s.id}`, name: `⭐ ${s.name}` })),
    { id: 'other', name: 'その他（自由入力）' },
  ];

  const [form, setForm] = useState({
    date: todayStr(), spotId: allSpots[0]?.id || '', spotName: allSpots[0]?.name || '',
    customSpot: '', fishId: 'aji', count: 1, maxSize: '', method: 'sabiki', memo: '',
  });
  const [photo, setPhoto]         = useState(null);   // base64
  const [photoLoading, setPhotoLoading] = useState(false);
  const photoRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSpotChange = (val) => {
    const found = allSpots.find(s => s.id === val);
    set('spotId', val);
    set('spotName', found ? found.name : '');
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLoading(true);
    const compressed = await compressImage(file);
    setPhoto(compressed);
    setPhotoLoading(false);
  };

  const handleSubmit = () => {
    const spotName = form.spotId === 'other' ? form.customSpot : form.spotName;
    if (!spotName || !form.fishId || !form.count) return;
    onAdd({
      date:     form.date,
      spotId:   form.spotId,
      spotName,
      fishId:   form.fishId,
      fishName: FISH_MAP[form.fishId] || form.fishId,
      count:    Number(form.count),
      maxSize:  form.maxSize ? Number(form.maxSize) : null,
      method:   form.method,
      memo:     form.memo.trim(),
      photo:    photo || null,
    });
    onClose();
  };

  const inp = { width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #D5D8DC', fontSize: '15px', outline: 'none', boxSizing: 'border-box', background: '#fff' };
  const lbl = { fontSize: '12px', color: '#566573', fontWeight: 600, marginBottom: '4px', display: 'block' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', maxWidth: '430px', margin: '0 auto', background: '#F4F6F9', borderRadius: '20px 20px 0 0', padding: '20px 16px 40px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <span style={{ fontSize: '17px', fontWeight: 800, color: '#1C2833' }}>🎣 釣果を記録</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#AAB7B8' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={lbl}>日付</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={inp} />
          </div>

          <div>
            <label style={lbl}>釣り場</label>
            <select value={form.spotId} onChange={e => handleSpotChange(e.target.value)} style={inp}>
              {allSpots.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {form.spotId === 'other' && (
              <input type="text" placeholder="釣り場名を入力" value={form.customSpot} onChange={e => set('customSpot', e.target.value)} style={{ ...inp, marginTop: '8px' }} />
            )}
          </div>

          <div>
            <label style={lbl}>魚種</label>
            <select value={form.fishId} onChange={e => set('fishId', e.target.value)} style={inp}>
              {FISH_OPTIONS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={lbl}>釣れた数（匹）</label>
              <input type="number" min="1" value={form.count} onChange={e => set('count', e.target.value)} style={inp} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={lbl}>最大サイズ（cm）</label>
              <input type="number" min="1" placeholder="任意" value={form.maxSize} onChange={e => set('maxSize', e.target.value)} style={inp} />
            </div>
          </div>

          <div>
            <label style={lbl}>釣り方</label>
            <select value={form.method} onChange={e => set('method', e.target.value)} style={inp}>
              {METHOD_OPTIONS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>

          <div>
            <label style={lbl}>メモ（任意）</label>
            <textarea rows={2} placeholder="エサの種類、天気、ポイントなど" value={form.memo} onChange={e => set('memo', e.target.value)} style={{ ...inp, resize: 'none' }} />
          </div>

          {/* 写真 */}
          <div>
            <label style={lbl}>写真（任意）</label>
            <input ref={photoRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} style={{ display: 'none' }} />
            {photo ? (
              <div style={{ position: 'relative' }}>
                <img src={photo} alt="釣果" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '10px' }} />
                <button
                  onClick={() => setPhoto(null)}
                  style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,.5)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', color: '#fff', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >✕</button>
              </div>
            ) : (
              <button
                onClick={() => photoRef.current?.click()}
                disabled={photoLoading}
                style={{ width: '100%', padding: '16px', borderRadius: '10px', border: '2px dashed #D5D8DC', background: '#fafafa', color: '#AAB7B8', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {photoLoading ? '圧縮中...' : <><span style={{ fontSize: '20px' }}>📷</span> カメラで撮影 / 写真を選択</>}
              </button>
            )}
          </div>

          <button
            onClick={handleSubmit}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg,#2E86C1,#1A5276)', color: '#fff', fontWeight: 800, fontSize: '16px', border: 'none', cursor: 'pointer', marginTop: '4px' }}
          >
            記録する
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 統計バー ─────────────────────────────────────────────────
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

// ── 写真ライトボックス ────────────────────────────────────────
function PhotoViewer({ src, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.88)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
    >
      <img src={src} alt="釣果写真" style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '10px' }} />
    </div>
  );
}

// ── メインページ ─────────────────────────────────────────────
export default function CatchLog() {
  const [entries,  setEntries]  = useState([]);
  const [mySpots,  setMySpots]  = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [viewPhoto, setViewPhoto] = useState(null);

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
          style={{ padding: '9px 18px', borderRadius: '20px', background: 'linear-gradient(135deg,#2E86C1,#1A5276)', color: '#fff', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer' }}
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
            {entry.photo && (
              <img
                src={entry.photo}
                alt="釣果"
                onClick={() => setViewPhoto(entry.photo)}
                style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px', cursor: 'pointer' }}
              />
            )}
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
                {entry.method && <div style={{ fontSize: '12px', color: '#566573' }}>{METHOD_MAP[entry.method] || entry.method}</div>}
                {entry.memo   && <div style={{ fontSize: '12px', color: '#7F8C8D', marginTop: '4px', fontStyle: 'italic' }}>{entry.memo}</div>}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginLeft: '8px' }}>
                <button
                  onClick={() => shareEntry(entry)}
                  style={{ padding: '7px 12px', borderRadius: '10px', background: '#EBF5FB', color: '#2E86C1', border: '1.5px solid #AED6F1', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  シェア
                </button>
                <button
                  onClick={() => setDeleteId(entry.id)}
                  style={{ padding: '7px 10px', borderRadius: '10px', background: '#FDEDEC', color: '#E74C3C', border: '1.5px solid #F1948A', fontSize: '13px', cursor: 'pointer' }}
                >
                  🗑
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {showForm && <AddForm onAdd={handleAdd} onClose={() => setShowForm(false)} mySpots={mySpots} />}

      {viewPhoto && <PhotoViewer src={viewPhoto} onClose={() => setViewPhoto(null)} />}

      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', maxWidth: '320px', width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>この記録を削除しますか？</div>
            <div style={{ fontSize: '13px', color: '#566573', marginBottom: '20px' }}>削除すると元に戻せません</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1.5px solid #D5D8DC', background: '#fff', fontSize: '14px', cursor: 'pointer' }}>キャンセル</button>
              <button onClick={() => handleDelete(deleteId)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#E74C3C', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>削除する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
