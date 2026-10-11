import React, { createContext, useContext, useState, useEffect } from 'react';
import { defaultConfig } from './defaultConfig';
import { clientPresets } from './clientPresets';

const ConfigContext = createContext(null);

// Owner tools (client switcher, Customize Site, Share Link, style picker) only show with ?admin in the URL.
// Shared gift links never carry it, so recipients always get the clean view.
const IS_ADMIN = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('admin');

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(() => {
    // Check if URL has a client preset or encoded config
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const presetParam = searchParams.get('client');
      if (presetParam && clientPresets[presetParam]) {
        return clientPresets[presetParam];
      }

      const hash = window.location.hash;
      if (hash && hash.startsWith('#data=')) {
        const jsonStr = decodeURIComponent(atob(hash.replace('#data=', '')));
        return JSON.parse(jsonStr);
      }

      const saved = localStorage.getItem('birthday_site_config');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load saved/hash config, defaulting to Sana", e);
    }
    return defaultConfig;
  });

  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('birthday_site_config', JSON.stringify(config));
    } catch (e) {
      console.error(e);
    }
  }, [config]);

  const updateConfig = (newConfig) => {
    setConfig(newConfig);
  };

  const loadPreset = (presetKey) => {
    if (clientPresets[presetKey]) {
      setConfig(clientPresets[presetKey]);
    }
  };

  const resetToDefault = () => {
    setConfig(defaultConfig);
    localStorage.removeItem('birthday_site_config');
  };

  const exportConfigJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `birthday-website-${config.recipientName || 'client'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importConfigJson = (jsonFileContent) => {
    try {
      const parsed = JSON.parse(jsonFileContent);
      setConfig(parsed);
      return true;
    } catch (err) {
      console.error("Invalid config JSON", err);
      return false;
    }
  };

  const generateShareableLink = () => {
    try {
      const jsonStr = JSON.stringify(config);
      const encoded = btoa(encodeURIComponent(jsonStr));
      return `${window.location.origin}${window.location.pathname}#data=${encoded}`;
    } catch (err) {
      return window.location.href;
    }
  };

  return (
    <ConfigContext.Provider value={{
      config,
      isAdmin: IS_ADMIN,
      updateConfig,
      loadPreset,
      resetToDefault,
      exportConfigJson,
      importConfigJson,
      generateShareableLink,
      isStudioOpen,
      setIsStudioOpen,
      isAudioPlaying,
      setIsAudioPlaying
    }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
