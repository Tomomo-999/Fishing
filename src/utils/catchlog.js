const CATCHLOG_KEY = 'fishing_nav_catchlog_v1';

export const loadCatchLog = () => {
  try { return JSON.parse(localStorage.getItem(CATCHLOG_KEY) || '[]'); }
  catch { return []; }
};

export const saveCatchLog = (entries) => {
  localStorage.setItem(CATCHLOG_KEY, JSON.stringify(entries));
};

export const addCatch = (entry) => {
  const list = loadCatchLog();
  const newEntry = { ...entry, id: Date.now().toString(), createdAt: new Date().toISOString() };
  saveCatchLog([newEntry, ...list]);
  return newEntry;
};

export const deleteCatch = (id) => {
  saveCatchLog(loadCatchLog().filter(e => e.id !== id));
};

export const FISH_OPTIONS = [
  { id: 'aji',      name: 'アジ' },
  { id: 'kisu',     name: 'シロギス' },
  { id: 'kouika',   name: 'コウイカ' },
  { id: 'iwashi',   name: 'イワシ' },
  { id: 'saba',     name: 'サバ' },
  { id: 'sayori',   name: 'サヨリ' },
  { id: 'aori_ika', name: 'アオリイカ' },
  { id: 'kensaki',  name: 'ケンサキイカ' },
  { id: 'mebaru',   name: 'メバル' },
  { id: 'karei',    name: 'カレイ' },
  { id: 'chinu',    name: 'クロダイ' },
  { id: 'madai',    name: 'マダイ' },
  { id: 'other',    name: 'その他' },
];

export const METHOD_OPTIONS = [
  { id: 'sabiki',   name: 'サビキ釣り' },
  { id: 'nage',     name: '投げ釣り' },
  { id: 'eging',    name: 'エギング' },
  { id: 'fukase',   name: 'ウキフカセ' },
  { id: 'lure',     name: 'ルアー' },
  { id: 'iso',      name: '磯釣り' },
  { id: 'other',    name: 'その他' },
];
