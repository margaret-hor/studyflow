import { useState, useEffect } from 'react';
import { CloseIcon, SettingsIcon } from '../../components/icons';
import styles from './ReadingSettings.module.scss';

const PROFILES = {
  dyslexia: {
    name: 'Dyslexia Support',
    description: 'Easier to read fonts and spacing',
    settings: {
      fontSize: 18,
      lineHeight: 2,
      letterSpacing: .12,
      theme: 'sepia'
    }
  },
  lowVision: {
    name: 'Low Vision',
    description: 'Large text and high contrast',
    settings: {
      fontSize: 22,
      lineHeight: 1.8,
      letterSpacing: .05,
      theme: 'highContrast'
    }
  },
  focus: {
    name: 'Focus Mode',
    description: 'Reduce distractions',
    settings: {
      fontSize: 16,
      lineHeight: 1.6,
      letterSpacing: 0,
      theme: 'default'
    }
  }
};

const THEMES = {
  default: { bg: '#fff', text: '#111827', name: 'Default' },
  sepia: { bg: '#f4ecd8', text: '#5b4636', name: 'Sepia' },
  dark: { bg: '#1f2937', text: '#f9fafb', name: 'Dark' },
  highContrast: { bg: '#000000', text: '#ffff00', name: 'High Contrast' }
};

export default function ReadingSettings({ isOpen, onClose }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('readingSettings');
    return saved ? JSON.parse(saved) : {
      fontSize: 16,
      lineHeight: 1.6,
      letterSpacing: 0,
      theme: 'default'
    };
  });

  useEffect(() => {
    applySettings(settings);
  }, [settings]);

  const applySettings = (newSettings) => {
    const root = document.documentElement;

    root.style.setProperty('--reading-font-size', `${newSettings.fontSize}px`);
    root.style.setProperty('--reading-line-height', newSettings.lineHeight);
    root.style.setProperty('--reading-letter-spacing', `${newSettings.letterSpacing}em`);

    const theme = THEMES[newSettings.theme];
    root.style.setProperty('--reading-bg', theme.bg);
    root.style.setProperty('--reading-text', theme.text);

    localStorage.setItem('readingSettings', JSON.stringify(newSettings));
  };

  const applyProfile = (profileKey) => {
    const profile = PROFILES[profileKey];
    const newSettings = { ...profile.settings };
    setSettings(newSettings);
  };

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <SettingsIcon />
            <h2>Reading Settings</h2>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <CloseIcon />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.info}>
            <p>These settings adapt our interface for easier reading</p>
          </div>

          <section className={styles.section}>
            <h3>Quick Profiles</h3>
            <div className={styles.profileGrid}>
              {Object.entries(PROFILES).map(([key, profile]) => (
                <button
                  key={key}
                  onClick={() => applyProfile(key)}
                  className={styles.profileCard}
                >
                  <span className={styles.profileName}>{profile.name}</span>
                  <p className={styles.profileDesc}>{profile.description}</p>
                </button>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h3>Font Size: {settings.fontSize}px</h3>
            <input
              type="range"
              min="12"
              max="28"
              value={settings.fontSize}
              onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
              className={styles.slider}
            />
          </section>

          <section className={styles.section}>
            <h3>Line Height: {settings.lineHeight.toFixed(1)}x</h3>
            <input
              type="range"
              min="1.2"
              max="2.5"
              step="0.1"
              value={settings.lineHeight}
              onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
              className={styles.slider}
            />
          </section>

          <section className={styles.section}>
            <h3>Theme</h3>
            <div className={styles.themeGrid}>
              {Object.entries(THEMES).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => updateSetting('theme', key)}
                  className={`${styles.themeButton} ${settings.theme === key ? styles.active : ''}`}
                  style={{
                    background: theme.bg,
                    color: theme.text,
                    border: settings.theme === key ? '2px solid #8b5cf6' : '1px solid #e5e7eb'
                  }}
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className={styles.footer}>
          <p>💡 Coming soon: Full book reader with these settings</p>
        </div>
      </div>
    </div>
  );
}