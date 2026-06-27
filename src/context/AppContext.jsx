import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // 海域フィルター（ヘッダー ↔ 釣り場ページで共有）
  const [activeSeaArea, setActiveSeaArea] = useState('all');
  // 選択中スポットタイプ（ホームの持ち物チェックリストに連動）
  const [currentSpotType, setCurrentSpotType] = useState('pier');

  return (
    <AppContext.Provider value={{ activeSeaArea, setActiveSeaArea, currentSpotType, setCurrentSpotType }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
