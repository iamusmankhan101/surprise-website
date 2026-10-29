import React, { createContext, useContext, useState, useEffect } from 'react';
import { defaultConfig } from './defaultConfig';
import { clientPresets } from './clientPresets';

const ConfigContext = createContext(null);

// Owner tools (client switcher, Customize Site, Share Link, style picker) only show with ?admin in the URL.
// Shared gift links never carry it, so recipients always get the clean view.
const IS_ADMIN = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('admin');

// Short share link: /sana loads the config saved under "sana" by /api/link (same rule as api/link.js)
export const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,39}$/;
const pathSlug = typeof window !== 'undefined' ? window.location.pathname.slice(1) : '';
export const CURRENT_SLUG = SLUG_RE.test(pathSlug) ? pathSlug : '';

export const ConfigProvider = ({ children }) => {
  const [isLoadingLink, setIsLoadingLink] = useState(Boolean(CURRENT_SLUG));

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

  useEffect(() => {
    if (!CURRENT_SLUG) return;
    fetch(`/api/link?slug=${CURRENT_SLUG}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then(setConfig)
      .catch((e) => console.warn(`Could not load link "${CURRENT_SLUG}", showing the saved/default site`, e))
      .finally(() => setIsLoadingLink(false));
  }, []);

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

  // Saves siteConfig under /<slug> and returns the short URL. Throws { taken: true } if the name is used and !overwrite.
  const saveShortLink = async (slug, siteConfig, overwrite = false) => {
    const res = await fetch('/api/link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, config: siteConfig, overwrite }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.status === 409) throw Object.assign(new Error(body.error), { taken: true });
    if (!res.ok) throw new Error(body.error || (res.status === 404 ? 'Short links only work on the deployed site' : `Could not save link (HTTP ${res.status})`));
    return `${window.location.origin}/${slug}`;
  };

  if (isLoadingLink) return null;

  return (
    <ConfigContext.Provider value={{
      config,
      isAdmin: IS_ADMIN,
      updateConfig,
      loadPreset,
      resetToDefault,
      exportConfigJson,
      importConfigJson,
      saveShortLink,
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
