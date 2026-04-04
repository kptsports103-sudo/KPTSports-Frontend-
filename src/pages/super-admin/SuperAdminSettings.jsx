import { useMemo, useState } from "react";
import SuperAdminLayout from "./SuperAdminLayout";
import "./SuperAdminDataPages.css";

const STORAGE_KEY = "kpt-sports:super-admin-settings";

const defaultSettings = {
  upcomingFeaturesBanner: true,
  futureEventsTeaser: true,
  chatbotImprovementsNotice: true,
  feedbackHighlights: false,
  plannedMaintenanceBanner: false,
  releaseStage: "staging",
  homepageNotice:
    "Prepare future website updates for chatbot improvements, feature rollouts, and annual sports communication.",
};

const roadmapCards = [
  {
    title: "Future Website Releases",
    description: "Track upcoming public-site improvements before they are published to visitors.",
    tag: "Planned",
    tone: "blue",
  },
  {
    title: "Chatbot Knowledge Updates",
    description: "Prepare FAQ content and fallback guidance for future sports and registration changes.",
    tag: "Review",
    tone: "amber",
  },
  {
    title: "Homepage Announcements",
    description: "Control teaser banners and release notes for future website sections and campaigns.",
    tag: "Ready",
    tone: "green",
  },
];

const readStoredSettings = () => {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
    return parsed ? { ...defaultSettings, ...parsed } : defaultSettings;
  } catch {
    return defaultSettings;
  }
};

const SuperAdminSettings = () => {
  const [settings, setSettings] = useState(readStoredSettings);
  const [savedAt, setSavedAt] = useState("");

  const stats = useMemo(() => {
    const enabledCount = Object.entries(settings).filter(
      ([, value]) => typeof value === "boolean" && value
    ).length;

    return {
      enabledCount,
      bannerState: settings.plannedMaintenanceBanner ? "Planned banner on" : "No maintenance banner",
    };
  }, [settings]);

  const toggleSetting = (key) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
    setSavedAt("");
  };

  const handleSave = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
    setSavedAt(new Date().toLocaleString());
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setSavedAt("");
  };

  return (
    <SuperAdminLayout>
      <section className="super-admin-page">
        <header className="super-admin-page__header">
          <p className="super-admin-page__eyebrow">Future Website Controls</p>
          <h1 className="super-admin-page__title">Settings</h1>
          <p className="super-admin-page__description">
            Configure future website-related controls, communication toggles, and planned release settings for the public platform.
          </p>
        </header>

        <div className="super-admin-page__stats super-admin-page__stats--four">
          <article className="super-admin-page__stat super-admin-page__stat--blue">
            <p className="super-admin-page__stat-label">Enabled Controls</p>
            <p className="super-admin-page__stat-value">{stats.enabledCount}</p>
            <p className="super-admin-page__stat-helper">Future website switches turned on</p>
          </article>
          <article className="super-admin-page__stat super-admin-page__stat--green">
            <p className="super-admin-page__stat-label">Release Stage</p>
            <p className="super-admin-page__stat-value">{settings.releaseStage}</p>
            <p className="super-admin-page__stat-helper">Current rollout preference</p>
          </article>
          <article className="super-admin-page__stat super-admin-page__stat--amber">
            <p className="super-admin-page__stat-label">Maintenance Banner</p>
            <p className="super-admin-page__stat-value">{settings.plannedMaintenanceBanner ? "On" : "Off"}</p>
            <p className="super-admin-page__stat-helper">{stats.bannerState}</p>
          </article>
          <article className="super-admin-page__stat super-admin-page__stat--purple">
            <p className="super-admin-page__stat-label">Saved State</p>
            <p className="super-admin-page__stat-value">{savedAt ? "Saved" : "Draft"}</p>
            <p className="super-admin-page__stat-helper">{savedAt || "Changes are not saved yet"}</p>
          </article>
        </div>

        <div className="super-admin-page__grid">
          <article className="super-admin-page__panel">
            <div className="super-admin-page__panel-head">
              <div>
                <h2 className="super-admin-page__panel-title">Website Toggles</h2>
                <p className="super-admin-page__panel-copy">
                  Manage future website visibility for announcements, chatbot notes, and feature previews.
                </p>
              </div>
            </div>

            <div className="super-admin-page__settings-list">
              <div className="super-admin-page__setting-row">
                <div className="super-admin-page__setting-copy">
                  <strong>Upcoming Features Banner</strong>
                  <span>Show a public banner for soon-to-launch website features.</span>
                </div>
                <button
                  type="button"
                  className={`super-admin-page__toggle ${settings.upcomingFeaturesBanner ? "is-active" : ""}`}
                  onClick={() => toggleSetting("upcomingFeaturesBanner")}
                  aria-pressed={settings.upcomingFeaturesBanner}
                />
              </div>

              <div className="super-admin-page__setting-row">
                <div className="super-admin-page__setting-copy">
                  <strong>Future Events Teaser</strong>
                  <span>Highlight coming sports celebration modules and future event notices.</span>
                </div>
                <button
                  type="button"
                  className={`super-admin-page__toggle ${settings.futureEventsTeaser ? "is-active" : ""}`}
                  onClick={() => toggleSetting("futureEventsTeaser")}
                  aria-pressed={settings.futureEventsTeaser}
                />
              </div>

              <div className="super-admin-page__setting-row">
                <div className="super-admin-page__setting-copy">
                  <strong>Chatbot Improvements Notice</strong>
                  <span>Display an update note when the chatbot gains new FAQ or fallback coverage.</span>
                </div>
                <button
                  type="button"
                  className={`super-admin-page__toggle ${settings.chatbotImprovementsNotice ? "is-active" : ""}`}
                  onClick={() => toggleSetting("chatbotImprovementsNotice")}
                  aria-pressed={settings.chatbotImprovementsNotice}
                />
              </div>

              <div className="super-admin-page__setting-row">
                <div className="super-admin-page__setting-copy">
                  <strong>Feedback Highlights</strong>
                  <span>Prepare a future website section for curated visitor feedback highlights.</span>
                </div>
                <button
                  type="button"
                  className={`super-admin-page__toggle ${settings.feedbackHighlights ? "is-active" : ""}`}
                  onClick={() => toggleSetting("feedbackHighlights")}
                  aria-pressed={settings.feedbackHighlights}
                />
              </div>

              <div className="super-admin-page__setting-row">
                <div className="super-admin-page__setting-copy">
                  <strong>Planned Maintenance Banner</strong>
                  <span>Enable a public notice before scheduled website maintenance or major updates.</span>
                </div>
                <button
                  type="button"
                  className={`super-admin-page__toggle ${settings.plannedMaintenanceBanner ? "is-active" : ""}`}
                  onClick={() => toggleSetting("plannedMaintenanceBanner")}
                  aria-pressed={settings.plannedMaintenanceBanner}
                />
              </div>
            </div>
          </article>

          <article className="super-admin-page__panel">
            <div className="super-admin-page__panel-head">
              <div>
                <h2 className="super-admin-page__panel-title">Release Preferences</h2>
                <p className="super-admin-page__panel-copy">
                  Prepare future website rollout messaging and staging status from one place.
                </p>
              </div>
            </div>

            <div className="super-admin-page__settings-list">
              <div className="super-admin-page__stack">
                <label htmlFor="super-admin-release-stage" className="super-admin-page__stat-label">
                  Release Stage
                </label>
                <select
                  id="super-admin-release-stage"
                  name="superAdminReleaseStage"
                  className="super-admin-page__field"
                  value={settings.releaseStage}
                  onChange={(event) => setSettings((current) => ({ ...current, releaseStage: event.target.value }))}
                >
                  <option value="draft">Draft</option>
                  <option value="staging">Staging</option>
                  <option value="ready">Ready For Review</option>
                  <option value="launch">Launch Window</option>
                </select>
              </div>

              <div className="super-admin-page__stack">
                <label htmlFor="super-admin-homepage-notice" className="super-admin-page__stat-label">
                  Future Website Note
                </label>
                <textarea
                  id="super-admin-homepage-notice"
                  name="superAdminHomepageNotice"
                  className="super-admin-page__textarea"
                  value={settings.homepageNotice}
                  onChange={(event) => setSettings((current) => ({ ...current, homepageNotice: event.target.value }))}
                />
              </div>

              <div className="super-admin-page__actions">
                <button type="button" className="super-admin-page__button" onClick={handleSave}>
                  Save Settings
                </button>
                <button type="button" className="super-admin-page__button super-admin-page__button--secondary" onClick={handleReset}>
                  Reset
                </button>
              </div>

              {savedAt ? <p className="super-admin-page__save-note">Saved at {savedAt}</p> : null}
            </div>
          </article>
        </div>

        <article className="super-admin-page__panel" style={{ marginTop: "18px" }}>
          <div className="super-admin-page__panel-head">
            <div>
              <h2 className="super-admin-page__panel-title">Future Website Roadmap</h2>
              <p className="super-admin-page__panel-copy">
                Keep the super admin team aligned on future public-site enhancements and release priorities.
              </p>
            </div>
          </div>

          <div className="super-admin-page__roadmap">
            {roadmapCards.map((card) => (
              <div key={card.title} className="super-admin-page__roadmap-card">
                <strong>{card.title}</strong>
                <p>{card.description}</p>
                <span className={`super-admin-page__roadmap-tag super-admin-page__pill super-admin-page__pill--${card.tone}`}>
                  {card.tag}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </SuperAdminLayout>
  );
};

export default SuperAdminSettings;
