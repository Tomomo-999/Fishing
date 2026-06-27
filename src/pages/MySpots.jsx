import { useState, useEffect, useCallback, useRef } from 'react';
import { loadMySpots, saveMySpots, parseGmapUrl } from '../utils/storage';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet デフォルトアイコンの修正
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2,7)}`;

const CATCH_RATINGS = ['—', '×', '△', '○', '◎', '🎣'];
const WEATHER_OPTIONS = ['☀️ 晴れ', '⛅ 曇り', '🌧️ 雨', '🌬️ 風強め'];
const TIDE_OPTIONS = ['大潮', '中潮', '小潮', '長潮', '若潮'];

// ─── スポット追加/編集フォーム ───────────────────────────────
const SpotForm = ({ initial, onSave, onCancel }) => {
  const [name,    setName]    = useState(initial?.name    || '');
  const [note,    setNote]    = useState(initial?.note    || '');
  const [gmapUrl, setGmapUrl] = useState('');
  const [lat,     setLat]     = useState(initial?.lat != null ? String(initial.lat) : '');
  const [lng,     setLng]     = useState(initial?.lng != null ? String(initial.lng) : '');
  const [urlErr,  setUrlErr]  = useState('');

  const applyUrl = () => {
    const url = gmapUrl.trim();
    const parsed = parseGmapUrl(url);
    if (parsed) { setLat(String(parsed.lat)); setLng(String(parsed.lng)); setUrlErr(''); }
    else if (/goo\.gl|maps\.app\.goo\.gl|bit\.ly|t\.co/.test(url)) {
      setUrlErr('短縮URLは読み取れません。下の手順で座標を確認してください。');
    } else {
      setUrlErr('URLから座標を読み取れませんでした。下の手順をお試しください。');
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      ...(initial || {}),
      id:   initial?.id || genId(),
      name: name.trim(),
      note: note.trim(),
      lat:  lat ? parseFloat(lat) : null,
      lng:  lng ? parseFloat(lng) : null,
      visits: initial?.visits || [],
      annotations: initial?.annotations || [],
      createdAt: initial?.createdAt || new Date().toISOString(),
    });
  };

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <div style={{ fontSize: '15px', fontWeight: 700, color: '#1C2833', margin: '12px 0 14px' }}>
        {initial ? 'スポットを編集' : '新しいスポットを追加'}
      </div>

      <label style={{ fontSize: '12px', color: '#566573', display: 'block', marginBottom: '4px' }}>スポット名 *</label>
      <input
        value={name} onChange={e => setName(e.target.value)}
        placeholder="例：仙崎港 東堤防"
        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5EAF0', fontSize: '14px', marginBottom: '12px', boxSizing: 'border-box' }}
      />

      <label style={{ fontSize: '12px', color: '#566573', display: 'block', marginBottom: '4px' }}>メモ</label>
      <textarea
        value={note} onChange={e => setNote(e.target.value)}
        placeholder="駐車場・トイレ・ポイントのコツなど"
        rows={3}
        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5EAF0', fontSize: '13px', marginBottom: '12px', resize: 'vertical', boxSizing: 'border-box' }}
      />

      <label style={{ fontSize: '12px', color: '#566573', display: 'block', marginBottom: '4px' }}>GoogleマップのURL（任意）</label>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
        <input
          value={gmapUrl} onChange={e => setGmapUrl(e.target.value)}
          placeholder="https://maps.google.com/..."
          style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5EAF0', fontSize: '13px', boxSizing: 'border-box' }}
        />
        <button onClick={applyUrl} style={{ padding: '10px 12px', borderRadius: '8px', background: '#2E86C1', color: '#fff', border: 'none', fontSize: '12px', cursor: 'pointer', flexShrink: 0 }}>取得</button>
      </div>
      {urlErr && (
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '11px', color: '#E74C3C', marginBottom: '6px' }}>{urlErr}</div>
          <div style={{ padding: '10px 12px', background: '#FEF3CD', borderRadius: '8px', fontSize: '11px', color: '#7D6608', lineHeight: 1.8 }}>
            <strong>📍 座標の調べ方</strong><br />
            ① Googleマップで場所を長押し（またはピンを立てる）<br />
            ② 画面下に「34.xx, 131.xx」と表示される数字をコピー<br />
            ③ 上の緯度・経度欄に直接入力<br />
            <span style={{ opacity: 0.7 }}>または：マップアプリ → 共有 → 「地図を埋め込む」のURLを貼り付け</span>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        {[['緯度', lat, setLat, '34.18...'], ['経度', lng, setLng, '131.47...']].map(([label, val, set, ph]) => (
          <div key={label}>
            <label style={{ fontSize: '12px', color: '#566573', display: 'block', marginBottom: '4px' }}>{label}</label>
            <input
              value={val} onChange={e => set(e.target.value)}
              placeholder={ph} type="number" step="0.0001"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5EAF0', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
        ))}
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '12px', color: '#566573', display: 'block', marginBottom: '6px' }}>地図でピン留め（任意）</label>
        <AnnotationMap
          lat={lat ? parseFloat(lat) : null}
          lng={lng ? parseFloat(lng) : null}
          annotations={[]}
          height={200}
          onPositionChange={(la, ln) => { setLat(String(la)); setLng(String(ln)); }}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={onCancel} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #E5EAF0', background: '#fff', color: '#566573', fontSize: '14px', cursor: 'pointer' }}>
          キャンセル
        </button>
        <button onClick={handleSave} disabled={!name.trim()} style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', background: name.trim() ? '#2E86C1' : '#E5EAF0', color: name.trim() ? '#fff' : '#AAB7B8', fontSize: '14px', fontWeight: 700, cursor: name.trim() ? 'pointer' : 'default' }}>
          保存
        </button>
      </div>
    </div>
  );
};

// ─── 訪問記録追加/編集フォーム ───────────────────────────────
const VisitForm = ({ initial, onSave, onCancel }) => {
  const today = new Date().toISOString().slice(0,10);
  const [date,    setDate]    = useState(initial?.date    || today);
  const [catchTxt,setCatchTxt]= useState(initial?.catch   || '');
  const [rating,  setRating]  = useState(initial?.rating  ?? 0);
  const [weather, setWeather] = useState(initial?.weather || '');
  const [tide,    setTide]    = useState(initial?.tide    || '');
  const [note,    setNote]    = useState(initial?.note    || '');

  const handleSave = () => {
    onSave({ id: initial?.id || genId(), date, catch: catchTxt.trim(), rating, weather, tide, note: note.trim() });
  };

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <div style={{ fontSize: '15px', fontWeight: 700, color: '#1C2833', margin: '12px 0 14px' }}>
        {initial ? '訪問記録を編集' : '訪問記録を追加'}
      </div>

      <label style={{ fontSize: '12px', color: '#566573', display: 'block', marginBottom: '4px' }}>釣行日 *</label>
      <input
        type="date" value={date} onChange={e => setDate(e.target.value)}
        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5EAF0', fontSize: '14px', marginBottom: '12px', boxSizing: 'border-box' }}
      />

      <label style={{ fontSize: '12px', color: '#566573', display: 'block', marginBottom: '4px' }}>釣果（何が釣れた？）</label>
      <input
        value={catchTxt} onChange={e => setCatchTxt(e.target.value)}
        placeholder="例：キス5匹・コウイカ1杯"
        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5EAF0', fontSize: '13px', marginBottom: '12px', boxSizing: 'border-box' }}
      />

      <label style={{ fontSize: '12px', color: '#566573', display: 'block', marginBottom: '6px' }}>釣果評価</label>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
        {CATCH_RATINGS.map((r, i) => (
          <button key={i} onClick={() => setRating(i)}
            style={{ flex: 1, padding: '8px 4px', borderRadius: '8px', border: `2px solid ${rating === i ? '#2E86C1' : '#E5EAF0'}`, background: rating === i ? '#F0F8FF' : '#fff', fontSize: '14px', cursor: 'pointer' }}>
            {r}
          </button>
        ))}
      </div>

      <label style={{ fontSize: '12px', color: '#566573', display: 'block', marginBottom: '6px' }}>天気</label>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {WEATHER_OPTIONS.map(w => (
          <button key={w} onClick={() => setWeather(weather === w ? '' : w)}
            style={{ padding: '6px 10px', borderRadius: '8px', border: `1px solid ${weather === w ? '#2E86C1' : '#E5EAF0'}`, background: weather === w ? '#F0F8FF' : '#fff', fontSize: '12px', cursor: 'pointer', color: weather === w ? '#2E86C1' : '#566573' }}>
            {w}
          </button>
        ))}
      </div>

      <label style={{ fontSize: '12px', color: '#566573', display: 'block', marginBottom: '6px' }}>潮まわり</label>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {TIDE_OPTIONS.map(t => (
          <button key={t} onClick={() => setTide(tide === t ? '' : t)}
            style={{ padding: '6px 10px', borderRadius: '8px', border: `1px solid ${tide === t ? '#2E86C1' : '#E5EAF0'}`, background: tide === t ? '#F0F8FF' : '#fff', fontSize: '12px', cursor: 'pointer', color: tide === t ? '#2E86C1' : '#566573' }}>
            {t}
          </button>
        ))}
      </div>

      <label style={{ fontSize: '12px', color: '#566573', display: 'block', marginBottom: '4px' }}>メモ</label>
      <textarea
        value={note} onChange={e => setNote(e.target.value)}
        placeholder="ヒットルアー・時間帯・反省点など"
        rows={3}
        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5EAF0', fontSize: '13px', marginBottom: '16px', resize: 'vertical', boxSizing: 'border-box' }}
      />

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={onCancel} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #E5EAF0', background: '#fff', color: '#566573', fontSize: '14px', cursor: 'pointer' }}>
          キャンセル
        </button>
        <button onClick={handleSave} style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', background: '#2E86C1', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
          保存
        </button>
      </div>
    </div>
  );
};

// ─── スタンプ定義 ────────────────────────────────────────────
const STAMPS = [
  { icon: '🎣', label: '釣れた' },
  { icon: '🐟', label: '魚影' },
  { icon: '🌊', label: 'ポイント' },
  { icon: '🚗', label: '駐車場' },
  { icon: '🚽', label: 'トイレ' },
  { icon: '⚠️', label: '危険' },
];
const AREA_COLORS = [
  { color: '#2E86C1', label: 'ポイント（青）' },
  { color: '#27AE60', label: '好釣り場（緑）' },
  { color: '#E74C3C', label: '立入禁止（赤）' },
  { color: '#F4A820', label: '注意（黄）' },
];

const makeStampIcon = (icon) => L.divIcon({
  html: `<div style="font-size:24px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))">${icon}</div>`,
  className: '', iconSize: [28, 28], iconAnchor: [14, 14],
});

// ─── アノテーション付きマップ ────────────────────────────────
const AnnotationMap = ({ lat, lng, annotations, onAnnotationsChange, onPositionChange, height = 260 }) => {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const pinRef       = useRef(null);         // スポット本体ピン
  const layersRef    = useRef({});           // id → Leaflet layer
  const modeRef      = useRef('view');       // 'view'|'stamp:{icon}'|'area'|'delete'
  const [toolMode,  setToolMode]  = useState('view');
  const [pendingPos, setPendingPos] = useState(null); // エリア設置中
  const [dialog,    setDialog]    = useState(null);   // { type, lat, lng, icon? }
  const [noteInput, setNoteInput] = useState('');
  const [radiusInput, setRadiusInput] = useState('30');
  const [areaColorIdx, setAreaColorIdx] = useState(0);

  // モード変更をrefに同期（クロージャ問題回避）
  useEffect(() => { modeRef.current = toolMode; }, [toolMode]);

  // マップ初期化
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const center = lat && lng ? [lat, lng] : [34.18, 131.47];
    const map = L.map(containerRef.current, { zoomControl: false, attributionControl: false }).setView(center, 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapRef.current = map;

    // 本体ピン
    if (lat && lng) {
      pinRef.current = L.marker([lat, lng], {
        icon: L.divIcon({ html: '<div style="width:12px;height:12px;border-radius:50%;background:#0C2D48;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.5)"></div>', className: '', iconSize: [12,12], iconAnchor: [6,6] }),
      }).addTo(map).bindPopup('📍 スポット基準点');
    }

    map.on('click', (e) => {
      const m = modeRef.current;
      const { lat: clat, lng: clng } = e.latlng;
      if (m === 'view') {
        if (onPositionChange) {
          if (pinRef.current) pinRef.current.setLatLng([clat, clng]);
          else pinRef.current = L.marker([clat, clng]).addTo(map);
          onPositionChange(parseFloat(clat.toFixed(6)), parseFloat(clng.toFixed(6)));
        }
      } else if (m.startsWith('stamp:')) {
        const icon = m.split(':')[1];
        setDialog({ type: 'stamp', lat: parseFloat(clat.toFixed(6)), lng: parseFloat(clng.toFixed(6)), icon });
        setNoteInput('');
      } else if (m === 'area') {
        setDialog({ type: 'area', lat: parseFloat(clat.toFixed(6)), lng: parseFloat(clng.toFixed(6)) });
        setNoteInput(''); setRadiusInput('30'); setAreaColorIdx(0);
      }
    });

    return () => { map.remove(); mapRef.current = null; pinRef.current = null; layersRef.current = {}; };
  }, []);

  // アノテーション描画
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    // 既存レイヤーをすべて削除
    Object.values(layersRef.current).forEach(l => map.removeLayer(l));
    layersRef.current = {};

    (annotations || []).forEach(ann => {
      let layer;
      if (ann.type === 'stamp') {
        layer = L.marker([ann.lat, ann.lng], { icon: makeStampIcon(ann.icon) })
          .addTo(map)
          .bindPopup(`<b>${ann.icon} ${STAMPS.find(s=>s.icon===ann.icon)?.label||''}</b>${ann.note ? `<br>${ann.note}` : ''}`);
        layer.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          if (modeRef.current === 'delete') {
            if (window.confirm('このスタンプを削除しますか？')) {
              onAnnotationsChange?.((annotations||[]).filter(a => a.id !== ann.id));
            }
          } else { layer.openPopup(); }
        });
      } else if (ann.type === 'area') {
        layer = L.circle([ann.lat, ann.lng], { radius: ann.radius, color: ann.color, fillColor: ann.color, fillOpacity: 0.15, weight: 2 })
          .addTo(map)
          .bindPopup(`<b>${ann.note || 'エリアメモ'}</b><br>半径 ${ann.radius}m`);
        layer.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          if (modeRef.current === 'delete') {
            if (window.confirm('このエリアを削除しますか？')) {
              onAnnotationsChange?.((annotations||[]).filter(a => a.id !== ann.id));
            }
          } else { layer.openPopup(); }
        });
      }
      if (layer) layersRef.current[ann.id] = layer;
    });
  }, [annotations]);

  const confirmStamp = () => {
    if (!dialog) return;
    const newAnn = { id: genId(), type: 'stamp', lat: dialog.lat, lng: dialog.lng, icon: dialog.icon, note: noteInput.trim() };
    onAnnotationsChange?.([...(annotations||[]), newAnn]);
    setDialog(null); setToolMode('stamp:' + dialog.icon); modeRef.current = 'stamp:' + dialog.icon;
  };

  const confirmArea = () => {
    if (!dialog) return;
    const r = parseInt(radiusInput, 10);
    if (isNaN(r) || r < 5) return;
    const newAnn = { id: genId(), type: 'area', lat: dialog.lat, lng: dialog.lng, radius: r, color: AREA_COLORS[areaColorIdx].color, note: noteInput.trim() };
    onAnnotationsChange?.([...(annotations||[]), newAnn]);
    setDialog(null); setToolMode('area'); modeRef.current = 'area';
  };

  const activeTool = toolMode === 'view' ? null : toolMode === 'delete' ? 'delete' : toolMode.startsWith('stamp:') ? toolMode : 'area';

  return (
    <div>
      {/* ツールバー */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px', flexWrap: 'wrap' }}>
        <button onClick={() => setToolMode('view')}
          style={{ padding: '5px 9px', borderRadius: '6px', border: `1.5px solid ${toolMode==='view'?'#0C2D48':'#E5EAF0'}`, background: toolMode==='view'?'#0C2D48':'#fff', color: toolMode==='view'?'#fff':'#566573', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}>
          ✋ 移動
        </button>
        {STAMPS.map(s => {
          const key = `stamp:${s.icon}`;
          return (
            <button key={s.icon} onClick={() => setToolMode(toolMode===key ? 'view' : key)}
              style={{ padding: '5px 8px', borderRadius: '6px', border: `1.5px solid ${toolMode===key?'#2E86C1':'#E5EAF0'}`, background: toolMode===key?'#F0F8FF':'#fff', fontSize: '13px', cursor: 'pointer' }}
              title={s.label}>
              {s.icon}
            </button>
          );
        })}
        <button onClick={() => setToolMode(toolMode==='area' ? 'view' : 'area')}
          style={{ padding: '5px 8px', borderRadius: '6px', border: `1.5px solid ${toolMode==='area'?'#27AE60':'#E5EAF0'}`, background: toolMode==='area'?'#EAFAF1':'#fff', color: toolMode==='area'?'#27AE60':'#566573', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}>
          ⭕ 範囲
        </button>
        <button onClick={() => setToolMode(toolMode==='delete' ? 'view' : 'delete')}
          style={{ padding: '5px 8px', borderRadius: '6px', border: `1.5px solid ${toolMode==='delete'?'#E74C3C':'#E5EAF0'}`, background: toolMode==='delete'?'#FADBD8':'#fff', color: toolMode==='delete'?'#E74C3C':'#566573', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}>
          🗑️
        </button>
      </div>

      {/* 操作ヒント */}
      <div style={{ fontSize: '10px', color: '#AAB7B8', marginBottom: '4px' }}>
        {toolMode === 'view' && onPositionChange && '地図をタップ → スポット基準点を移動'}
        {toolMode === 'view' && !onPositionChange && ''}
        {toolMode.startsWith('stamp:') && `地図をタップ → ${STAMPS.find(s=>'stamp:'+s.icon===toolMode)?.label}スタンプを設置`}
        {toolMode === 'area' && '地図をタップ → 円形エリアを設置'}
        {toolMode === 'delete' && 'スタンプ/エリアをタップして削除'}
      </div>

      {/* 地図本体 */}
      <div ref={containerRef} style={{ height: `${height}px`, borderRadius: '10px', overflow: 'hidden', border: '1px solid #E5EAF0' }} />

      {/* スタンプ設置ダイアログ */}
      {dialog?.type === 'stamp' && (
        <div style={{ marginTop: '8px', padding: '12px', background: '#F8F9FA', borderRadius: '8px', border: '1px solid #E5EAF0' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>{dialog.icon} メモを追加（任意）</div>
          <input
            autoFocus value={noteInput} onChange={e => setNoteInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && confirmStamp()}
            placeholder="例：朝まずめに釣れた"
            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E5EAF0', fontSize: '13px', marginBottom: '8px', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => setDialog(null)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #E5EAF0', background: '#fff', fontSize: '12px', cursor: 'pointer' }}>キャンセル</button>
            <button onClick={confirmStamp} style={{ flex: 2, padding: '8px', borderRadius: '6px', border: 'none', background: '#2E86C1', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>設置</button>
          </div>
        </div>
      )}

      {/* エリア設置ダイアログ */}
      {dialog?.type === 'area' && (
        <div style={{ marginTop: '8px', padding: '12px', background: '#F8F9FA', borderRadius: '8px', border: '1px solid #E5EAF0' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>⭕ エリアメモ</div>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
            {AREA_COLORS.map((c, i) => (
              <button key={i} onClick={() => setAreaColorIdx(i)}
                style={{ padding: '4px 8px', borderRadius: '6px', border: `2px solid ${areaColorIdx===i ? c.color : '#E5EAF0'}`, background: areaColorIdx===i ? c.color+'22' : '#fff', fontSize: '10px', color: c.color, cursor: 'pointer', fontWeight: 600 }}>
                {c.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#566573', flexShrink: 0 }}>半径</span>
            <input type="number" value={radiusInput} onChange={e => setRadiusInput(e.target.value)} min="5" max="500"
              style={{ width: '70px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #E5EAF0', fontSize: '13px' }} />
            <span style={{ fontSize: '12px', color: '#566573' }}>m</span>
          </div>
          <input
            value={noteInput} onChange={e => setNoteInput(e.target.value)}
            placeholder="例：コウイカ好ポイント"
            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E5EAF0', fontSize: '13px', marginBottom: '8px', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => setDialog(null)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #E5EAF0', background: '#fff', fontSize: '12px', cursor: 'pointer' }}>キャンセル</button>
            <button onClick={confirmArea} style={{ flex: 2, padding: '8px', borderRadius: '6px', border: 'none', background: '#27AE60', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>設置</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── スポット詳細 ───────────────────────────────────────────
const SpotDetail = ({ spot, onBack, onUpdateSpot, onDeleteSpot }) => {
  const [mode, setMode] = useState(null);

  const addVisit = (v) => { onUpdateSpot({ ...spot, visits: [v, ...spot.visits] }); setMode(null); };
  const updateVisit = (v) => { onUpdateSpot({ ...spot, visits: spot.visits.map(x => x.id === v.id ? v : x) }); setMode(null); };
  const deleteVisit = (id) => {
    if (!window.confirm('この訪問記録を削除しますか？')) return;
    onUpdateSpot({ ...spot, visits: spot.visits.filter(x => x.id !== id) });
  };

  const editVisit = mode?.editVisit ? spot.visits.find(x => x.id === mode.editVisit) : null;

  if (mode === 'editSpot') return <SpotForm initial={spot} onSave={(s) => { onUpdateSpot(s); setMode(null); }} onCancel={() => setMode(null)} />;
  if (mode === 'addVisit') return <VisitForm onSave={addVisit} onCancel={() => setMode(null)} />;
  if (editVisit) return <VisitForm initial={editVisit} onSave={updateVisit} onCancel={() => setMode(null)} />;

  const sorted = [...spot.visits].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '10px' }}>
        <button onClick={onBack} style={{ fontSize: '14px', color: '#2E86C1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>← 一覧</button>
        <div style={{ flex: 1, fontSize: '16px', fontWeight: 700, color: '#1C2833' }}>{spot.name}</div>
        <button onClick={() => setMode('editSpot')} style={{ fontSize: '12px', color: '#566573', background: 'none', border: '1px solid #E5EAF0', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer' }}>編集</button>
        <button onClick={() => onDeleteSpot(spot.id)} style={{ fontSize: '12px', color: '#E74C3C', background: 'none', border: '1px solid #FADBD8', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer' }}>削除</button>
      </div>

      {spot.note && (
        <div style={{ margin: '0 16px 10px', padding: '10px 12px', background: '#F8F9FA', borderRadius: '8px', fontSize: '13px', color: '#566573', lineHeight: 1.6 }}>
          📝 {spot.note}
        </div>
      )}

      {spot.lat && spot.lng && (
        <div style={{ margin: '0 16px 10px' }}>
          <AnnotationMap
            lat={spot.lat} lng={spot.lng}
            annotations={spot.annotations || []}
            onAnnotationsChange={(anns) => onUpdateSpot({ ...spot, annotations: anns })}
          />
          <button
            onClick={() => window.open(`https://www.google.com/maps?q=${spot.lat},${spot.lng}`, '_blank', 'noopener,noreferrer')}
            style={{ width: '100%', marginTop: '6px', padding: '8px', borderRadius: '8px', border: '1px solid #2E86C1', background: '#F0F8FF', color: '#2E86C1', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}
          >
            Googleマップで開く →
          </button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px 8px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#566573' }}>訪問記録（{spot.visits.length}件）</div>
        <button onClick={() => setMode('addVisit')}
          style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '8px', background: '#2E86C1', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          ＋ 追加
        </button>
      </div>

      {sorted.length === 0 ? (
        <div style={{ margin: '20px 16px', textAlign: 'center', color: '#AAB7B8', fontSize: '13px' }}>
          まだ記録がありません。釣りに行ったら記録してみましょう！
        </div>
      ) : (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sorted.map(v => (
            <div key={v.id} style={{ background: '#fff', border: '1px solid #E5EAF0', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#1C2833' }}>{v.date}</span>
                {v.rating > 0 && <span style={{ fontSize: '16px' }}>{CATCH_RATINGS[v.rating]}</span>}
                {v.weather && <span style={{ fontSize: '11px', color: '#566573' }}>{v.weather}</span>}
                {v.tide && <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '99px', background: '#F0F8FF', color: '#2E86C1' }}>{v.tide}</span>}
                <div style={{ flex: 1 }} />
                <button onClick={() => setMode({ editVisit: v.id })}
                  style={{ fontSize: '11px', color: '#566573', background: 'none', border: '1px solid #E5EAF0', borderRadius: '4px', padding: '3px 7px', cursor: 'pointer' }}>編集</button>
                <button onClick={() => deleteVisit(v.id)}
                  style={{ fontSize: '11px', color: '#E74C3C', background: 'none', border: '1px solid #FADBD8', borderRadius: '4px', padding: '3px 7px', cursor: 'pointer' }}>削除</button>
              </div>
              {v.catch && <div style={{ fontSize: '13px', color: '#1C2833', marginBottom: '4px' }}>🎣 {v.catch}</div>}
              {v.note && <div style={{ fontSize: '12px', color: '#566573', lineHeight: 1.5 }}>{v.note}</div>}
            </div>
          ))}
        </div>
      )}
      <div style={{ height: '16px' }} />
    </div>
  );
};

// ─── メインページ ────────────────────────────────────────────
const MySpots = () => {
  const [spots, setSpots] = useState([]);
  const [mode,  setMode]  = useState(null);
  const [importMsg, setImportMsg] = useState(null);
  const importRef = useRef(null);

  useEffect(() => { setSpots(loadMySpots()); }, []);

  const persist = useCallback((next) => { setSpots(next); saveMySpots(next); }, []);

  const addSpot = (s) => { persist([s, ...spots]); setMode(null); };

  const updateSpot = useCallback((s) => {
    persist(spots.map(x => x.id === s.id ? s : x));
  }, [spots, persist]);

  const deleteSpot = useCallback((id) => {
    if (!window.confirm('このスポットを削除しますか？訪問記録もすべて削除されます。')) return;
    persist(spots.filter(x => x.id !== id));
    setMode(null);
  }, [spots, persist]);

  const exportSpots = () => {
    const blob = new Blob([JSON.stringify(spots, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `myspots_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (!Array.isArray(imported)) throw new Error();
        const existingIds = new Set(spots.map(s => s.id));
        const newSpots = imported.filter(s => s.id && s.name && !existingIds.has(s.id));
        const merged = [...spots, ...newSpots.map(s => ({ visits: [], annotations: [], ...s }))];
        persist(merged);
        setImportMsg(newSpots.length > 0
          ? `${newSpots.length}件のスポットを読み込みました`
          : '新しいスポットはありませんでした（既存と重複）'
        );
        setTimeout(() => setImportMsg(null), 3000);
      } catch {
        setImportMsg('読み込み失敗。正しいバックアップファイルを選択してください');
        setTimeout(() => setImportMsg(null), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const detailSpot = mode?.detail ? spots.find(x => x.id === mode.detail) : null;

  if (mode === 'add') return <SpotForm onSave={addSpot} onCancel={() => setMode(null)} />;
  if (detailSpot) {
    return (
      <SpotDetail
        spot={detailSpot}
        onBack={() => setMode(null)}
        onUpdateSpot={updateSpot}
        onDeleteSpot={deleteSpot}
      />
    );
  }

  const DataButtons = () => (
    <div style={{ display: 'flex', gap: '6px' }}>
      <input ref={importRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
      {spots.length > 0 && (
        <button onClick={exportSpots}
          style={{ fontSize: '12px', padding: '6px 11px', borderRadius: '8px', border: '1px solid #27AE60', background: '#EAFAF1', color: '#27AE60', cursor: 'pointer', fontWeight: 600 }}>
          📤 バックアップ
        </button>
      )}
      <button onClick={() => importRef.current?.click()}
        style={{ fontSize: '12px', padding: '6px 11px', borderRadius: '8px', border: '1px solid #E5EAF0', background: '#fff', color: '#566573', cursor: 'pointer', fontWeight: 600 }}>
        📥 復元
      </button>
    </div>
  );

  return (
    <div>
      {importMsg && (
        <div style={{ margin: '8px 16px 0', padding: '10px 14px', background: '#EAFAF1', borderRadius: '8px', fontSize: '12px', color: '#27AE60', fontWeight: 600 }}>
          ✅ {importMsg}
        </div>
      )}

      {spots.length === 0 ? (
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#1C2833', marginBottom: '8px' }}>お気に入りの釣り場を保存しよう</div>
          <div style={{ fontSize: '13px', color: '#566573', lineHeight: 1.6, marginBottom: '24px' }}>
            行ったことのある釣り場を追加して、<br />釣果・天気・潮を記録できます
          </div>
          <button onClick={() => setMode('add')}
            style={{ padding: '14px 32px', borderRadius: '12px', border: 'none', background: '#2E86C1', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', marginBottom: '16px' }}>
            ＋ 最初のスポットを追加
          </button>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <DataButtons />
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px 8px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1C2833' }}>マイスポット（{spots.length}件）</div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <DataButtons />
              <button onClick={() => setMode('add')}
                style={{ fontSize: '13px', padding: '7px 14px', borderRadius: '8px', background: '#2E86C1', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                ＋ 追加
              </button>
            </div>
          </div>

          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {spots.map(s => {
              const lastVisit = s.visits?.length ? [...s.visits].sort((a, b) => b.date.localeCompare(a.date))[0] : null;
              return (
                <div key={s.id} style={{ background: '#fff', border: '1px solid #E5EAF0', borderRadius: '12px', overflow: 'hidden' }}>
                  <button
                    onClick={() => setMode({ detail: s.id })}
                    style={{ width: '100%', padding: '14px', display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#F0F8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>📍</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#1C2833', marginBottom: '3px' }}>{s.name}</div>
                      {s.note && <div style={{ fontSize: '12px', color: '#566573', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.note}</div>}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '11px', color: '#AAB7B8' }}>
                        <span>訪問 {s.visits?.length || 0}回</span>
                        {lastVisit && <span>最終: {lastVisit.date}</span>}
                      </div>
                    </div>
                    <span style={{ color: '#AAB7B8', fontSize: '16px', paddingTop: '2px' }}>›</span>
                  </button>
                  {s.lat && s.lng && (
                    <div style={{ borderTop: '1px solid #E5EAF0' }}>
                      <button
                        onClick={() => window.open(`https://www.google.com/maps?q=${s.lat},${s.lng}`, '_blank', 'noopener,noreferrer')}
                        style={{ width: '100%', padding: '8px', fontSize: '12px', color: '#2E86C1', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        🗺️ Googleマップで確認
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ height: '16px' }} />
        </>
      )}
    </div>
  );
};

export default MySpots;
