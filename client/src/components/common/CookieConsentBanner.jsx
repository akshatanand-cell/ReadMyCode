import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Shield, Check, X, Settings, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    preferences: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem('rmc_cookie_consent');
    if (!saved) {
      // Small delay before showing so it doesn't jarringly jump on initial paint
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    } else {
      try {
        const parsed = JSON.parse(saved);
        setPreferences({
          necessary: true,
          analytics: Boolean(parsed.analytics),
          preferences: Boolean(parsed.preferences),
        });
      } catch {
        // default
      }
    }
  }, []);

  useEffect(() => {
    const handleOpenSettings = () => {
      setIsSettingsOpen(true);
      setIsVisible(true);
    };

    window.addEventListener('open-cookie-settings', handleOpenSettings);
    return () => window.removeEventListener('open-cookie-settings', handleOpenSettings);
  }, []);

  const saveConsent = (updatedPrefs) => {
    const consentRecord = {
      ...updatedPrefs,
      necessary: true,
      timestamp: new Date().toISOString(),
      version: '1.0',
    };
    localStorage.setItem('rmc_cookie_consent', JSON.stringify(consentRecord));
    setPreferences(updatedPrefs);
    setIsVisible(false);
    setIsSettingsOpen(false);
  };

  const handleAcceptAll = () => {
    saveConsent({ necessary: true, analytics: true, preferences: true });
  };

  const handleRejectNonEssential = () => {
    saveConsent({ necessary: true, analytics: false, preferences: false });
  };

  const handleSaveCustom = () => {
    saveConsent(preferences);
  };

  if (!isVisible && !isSettingsOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isVisible && !isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            role="region"
            aria-label="Cookie consent banner"
            className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-xl z-50 p-4 sm:p-5 rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-2xl shadow-black/40 text-text-primary"
          >
            <div className="flex items-start gap-3.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Cookie className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-text-primary">
                  We respect your privacy and code security
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  We use strictly necessary cookies to keep you signed in. We do <strong className="text-text-primary">not</strong> use advertising or tracking cookies. Learn more in our{' '}
                  <Link to="/cookies" className="text-primary hover:underline font-medium">
                    Cookie Policy
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Cookie Settings</span>
              </button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleRejectNonEssential}
                className="text-xs min-h-[34px]"
              >
                Essential Only
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleAcceptAll}
                className="text-xs min-h-[34px] bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-md shadow-emerald-500/20"
              >
                Accept All
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Granular Cookie Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Cookie & Privacy Preferences"
      >
        <div className="space-y-4 text-xs">
          <p className="text-text-secondary leading-relaxed">
            Configure which cookies ReadMyCode is allowed to use. Strictly Necessary cookies cannot be disabled as the application cannot function without them.
          </p>

          <div className="space-y-3 pt-2">
            {/* Strictly Necessary */}
            <div className="p-3.5 rounded-xl bg-background-secondary border border-border flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary">Strictly Necessary</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    Required
                  </span>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Required for core authentication, CSRF tokens, session state, and security boundaries.
                </p>
              </div>
              <input
                type="checkbox"
                checked={true}
                disabled={true}
                className="mt-1 w-4 h-4 rounded border-border text-emerald-500 cursor-not-allowed opacity-80"
              />
            </div>

            {/* Performance / Analytics */}
            <div className="p-3.5 rounded-xl bg-card border border-border flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary">Anonymized Performance & Telemetry</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-border text-text-muted font-mono">
                    Optional
                  </span>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Aggregated, privacy-safe metrics regarding API latency, error rates, and load performance. Zero personal data or repo code is logged.
                </p>
              </div>
              <input
                type="checkbox"
                id="analytics-toggle"
                checked={preferences.analytics}
                onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            {/* Functional Preferences */}
            <div className="p-3.5 rounded-xl bg-card border border-border flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary">Interface Preferences</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-border text-text-muted font-mono">
                    Optional
                  </span>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Remembers your layout preferences, zoom levels, and dark mode interface selections.
                </p>
              </div>
              <input
                type="checkbox"
                id="preferences-toggle"
                checked={preferences.preferences}
                onChange={(e) => setPreferences({ ...preferences, preferences: e.target.checked })}
                className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Link
              to="/cookies"
              onClick={() => setIsSettingsOpen(false)}
              className="text-[11px] text-text-muted hover:text-text-primary flex items-center gap-1 transition-colors"
            >
              <span>View Full Cookie Policy</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsSettingsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveCustom}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold"
              >
                Save Preferences
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
