import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ConfigContextProps {
  is3D: boolean;
  setIs3D: (value: boolean) => void;
}

const ConfigContext = createContext<ConfigContextProps | undefined>(undefined);

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [is3D, setIs3D] = useState(false);

  return (
    <ConfigContext.Provider value={{ is3D, setIs3D }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) throw new Error('useConfig must be used within a ConfigProvider');
  return context;
};
