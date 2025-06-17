import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WallConfig {
  wallIdx: number;
  end: 'A' | 'B';
  slot: 'forward' | 'right' | 'left';
}

interface ConfigContextProps {
  is3D: boolean;
  setIs3D: (value: boolean) => void;
  showConfigPopup: boolean;
  setShowConfigPopup: (value: boolean) => void;
  pendingWallConfig: WallConfig | null;
  setPendingWallConfig: (value: WallConfig | null) => void;
}

const ConfigContext = createContext<ConfigContextProps | undefined>(undefined);

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [is3D, setIs3D] = useState(false);
  const [showConfigPopup, setShowConfigPopup] = useState(false);
  const [pendingWallConfig, setPendingWallConfig] = useState<WallConfig | null>(null);

  return (
    <ConfigContext.Provider value={{ 
      is3D, 
      setIs3D, 
      showConfigPopup, 
      setShowConfigPopup, 
      pendingWallConfig, 
      setPendingWallConfig 
    }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) throw new Error('useConfig must be used within a ConfigProvider');
  return context;
};
