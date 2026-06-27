import { useState, useEffect } from 'react';

export const FISH_COLORS = {
  kisu:      '#C8A96E',
  kouika:    '#C8B080',
  aji:       '#5A7A9A',
  iwashi:    '#7090B0',
  saba:      '#2A5A4A',
  sayori:    '#6888A0',
  aori_ika:  '#8B4513',
  kensaki:   '#A09880',
  mebaru:    '#8B3A1A',
  karei:     '#8B7040',
  chinu:     '#404040',
  madai:     '#E8735A',
};

// ローカル画像（public/figure/）
const LOCAL_IMAGES = {
  kisu:      '/figure/fig_シロギス.png',
  kouika:    '/figure/fig_コウイカ.png',
  aji:       '/figure/fig_アジ.png',
  iwashi:    '/figure/fig_イワシ.png',
  saba:      '/figure/fig_サバ.png',
  sayori:    '/figure/fig_サヨリ.png',
  aori_ika:  '/figure/fig_アオリイカ.png',
  kensaki:   '/figure/fig_剣先イカ.png',
  mebaru:    '/figure/fig_メバル.jpeg',
  karei:     '/figure/fig_カレイ.png',
  chinu:     '/figure/fig_クロダイ.png',
  madai:     '/figure/fig_真鯛.png',
};

// ローカル画像がない場合のWikipediaフォールバック
const WIKI_TITLES = {
  kisu:      'シロギス',
  kouika:    'コウイカ',
  aji:       'マアジ',
  iwashi:    'マイワシ',
  saba:      'マサバ',
  sayori:    'サヨリ',
  aori_ika:  'アオリイカ',
  kensaki:   'ヤリイカ',
  mebaru:    'メバル',
  karei:     'マコガレイ',
  chinu:     'クロダイ',
  madai:     'マダイ',
};

const CACHE_PREFIX = 'fish_wiki_img_';

async function fetchWikiThumb(fishId) {
  const cacheKey = CACHE_PREFIX + fishId;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) return cached === 'null' ? null : cached;

  const title = WIKI_TITLES[fishId];
  if (!title) return null;

  try {
    const url = `https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('not ok');
    const json = await res.json();
    const imgUrl = json.thumbnail?.source || json.originalimage?.source || null;
    sessionStorage.setItem(cacheKey, imgUrl ?? 'null');
    return imgUrl;
  } catch {
    sessionStorage.setItem(cacheKey, 'null');
    return null;
  }
}

export const FishPhoto = ({ fishId, emoji, size = 80, width, height, style = {} }) => {
  const localSrc = LOCAL_IMAGES[fishId] || null;
  const [wikiUrl, setWikiUrl] = useState(() => {
    if (localSrc) return null;
    const c = sessionStorage.getItem(CACHE_PREFIX + fishId);
    return c && c !== 'null' ? c : null;
  });
  const [localError, setLocalError] = useState(false);
  const [wikiLoading, setWikiLoading] = useState(!localSrc && !wikiUrl);
  const color = FISH_COLORS[fishId] || '#2E86C1';

  useEffect(() => {
    if (localSrc && !localError) return;
    if (wikiUrl) return;
    fetchWikiThumb(fishId).then(url => {
      setWikiUrl(url);
      setWikiLoading(false);
    });
  }, [fishId, localError]);

  const containerStyle = {
    width: width ?? size,
    height: height ?? size,
    borderRadius: '12px',
    overflow: 'hidden',
    background: `${color}18`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...style,
  };

  // ローカル画像を優先
  const imgSrc = localSrc && !localError ? localSrc : wikiUrl;

  if (wikiLoading && !imgSrc) {
    return (
      <div style={{ ...containerStyle, background: '#F0F5FA' }}>
        <span style={{ fontSize: size * 0.45, opacity: 0.3 }}>{emoji}</span>
      </div>
    );
  }

  if (imgSrc) {
    return (
      <div style={containerStyle}>
        <img
          src={imgSrc}
          alt=""
          onError={() => {
            if (localSrc && !localError) setLocalError(true);
          }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <span style={{ fontSize: size * 0.55 }}>{emoji}</span>
    </div>
  );
};
