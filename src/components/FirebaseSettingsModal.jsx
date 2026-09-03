import React, { useState } from 'react';
import { Database, Sparkles, RefreshCw } from 'lucide-react';
import { isFirebaseConfigured, getActiveFirebaseConfig, saveCustomFirebaseConfig } from '../config/firebase';
import { seedFirestoreDatabase } from '../services/firebaseSeeder';
import './FirebaseSettingsModal.css';

export const FirebaseSettingsModal = ({
  isOpen,
  onClose
}) => {
  const currentConfig = getActiveFirebaseConfig();

  const [apiKey, setApiKey] = useState(currentConfig.apiKey);
  const [authDomain, setAuthDomain] = useState(currentConfig.authDomain);
  const [projectId, setProjectId] = useState(currentConfig.projectId);
  const [appId, setAppId] = useState(currentConfig.appId);

  const [seedingLoading, setSeedingLoading] = useState(false);
  const [seedingResult, setSeedingResult] = useState(null);

  if (!isOpen) return null;

  const handleSaveConfig = (e) => {
    e.preventDefault();
    saveCustomFirebaseConfig({
      apiKey,
      authDomain,
      projectId,
      appId
    });
  };

  const handleSeedDatabase = async () => {
    setSeedingLoading(true);
    setSeedingResult(null);
    const res = await seedFirestoreDatabase();
    setSeedingResult(res);
    setSeedingLoading(false);
  };

  return (
    <div className="fb-settings-backdrop">
      <div className="fb-settings-card animate-fade-in">
        <button
          onClick={onClose}
          className="fb-settings-close-btn"
        >
          ✕
        </button>

        <div className="fb-settings-header">
          <div className="fb-settings-icon-badge">
            <Database size={24} />
          </div>
          <div>
            <h2 className="font-serif fb-settings-title">
              Firebase Backend Manager
            </h2>
            <div className="fb-settings-status-row">
              <span className={isFirebaseConfigured ? 'badge badge-green' : 'badge badge-dark'}>
                {isFirebaseConfigured ? 'Live Firebase DB Connected' : 'Demo Local Persistence Mode'}
              </span>
            </div>
          </div>
        </div>

        <p className="fb-settings-desc">
          Configure live Google Firebase credentials or populate your Firestore database with initial academic projects, faculty review queues, and leaderboard rankings.
        </p>

        {/* 1-CLICK SEEDER SECTION */}
        <div className="fb-seeder-box">
          <div className="fb-seeder-header">
            <div className="fb-seeder-title-group">
              <Sparkles size={20} color="var(--accent-green)" />
              <h3 className="fb-seeder-title">
                1-Click Firestore Database Seeder
              </h3>
            </div>

            <button
              onClick={handleSeedDatabase}
              disabled={seedingLoading}
              className="btn-primary fb-seeder-btn"
            >
              {seedingLoading ? <RefreshCw className="animate-spin" size={16} /> : <Database size={16} />}
              {seedingLoading ? 'Seeding...' : 'Seed Live Database'}
            </button>
          </div>

          <p className="fb-seeder-desc">
            Populates your Firestore DB with sample projects, faculty review items, student leaderboard rankings, and real-time chat data.
          </p>

          {seedingResult && (
            <div className={`fb-seeder-result-box ${seedingResult.success ? 'success' : 'error'}`}>
              {seedingResult.message}
            </div>
          )}
        </div>

        {/* CREDENTIALS CONFIG FORM */}
        <form onSubmit={handleSaveConfig} className="fb-config-form">
          <h4 className="fb-config-heading">
            Google Firebase Credentials
          </h4>

          <div>
            <label className="fb-config-label">VITE_FIREBASE_API_KEY</label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="fb-config-input"
            />
          </div>

          <div className="fb-config-grid-2">
            <div>
              <label className="fb-config-label">VITE_FIREBASE_PROJECT_ID</label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="my-campuscollab-app"
                className="fb-config-input"
              />
            </div>

            <div>
              <label className="fb-config-label">VITE_FIREBASE_AUTH_DOMAIN</label>
              <input
                type="text"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                placeholder="my-app.firebaseapp.com"
                className="fb-config-input"
              />
            </div>
          </div>

          <div>
            <label className="fb-config-label">VITE_FIREBASE_APP_ID</label>
            <input
              type="text"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder="1:1234567890:web:abcdef"
              className="fb-config-input"
            />
          </div>

          <div className="fb-config-footer-btns">
            <button type="button" onClick={onClose} className="btn-outline">
              Close
            </button>
            <button type="submit" className="btn-primary">
              Save Config & Connect
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
