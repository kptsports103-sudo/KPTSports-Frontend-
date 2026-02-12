import { useEffect, useMemo, useState } from 'react';
import { getNotifyEventName, notify } from '../utils/notify';

const NotificationHost = () => {
  const [active, setActive] = useState(null);
  const eventName = useMemo(() => getNotifyEventName(), []);

  useEffect(() => {
    const onNotify = (event) => {
      const payload = event.detail || {};
      setActive({
        title: payload.title || 'KPT Sports Results',
        message: payload.message || '',
        type: payload.type || 'info',
        position: payload.position || 'center',
        mode: payload.mode || 'alert',
        resolve: payload.resolve || null,
      });
    };

    window.addEventListener(eventName, onNotify);
    return () => window.removeEventListener(eventName, onNotify);
  }, [eventName]);

  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (message) => notify(message);

    return () => {
      window.alert = originalAlert;
    };
  }, []);

  if (!active) return null;

  const closeAlert = () => {
    if (active.resolve) active.resolve(true);
    setActive(null);
  };

  const confirmYes = () => {
    if (active.resolve) active.resolve(true);
    setActive(null);
  };

  const confirmNo = () => {
    if (active.resolve) active.resolve(false);
    setActive(null);
  };

  return (
    <div className={`kpt-notify-overlay ${active.position === 'top-center' ? 'kpt-notify-overlay-top-center' : ''}`} role="dialog" aria-modal="true" aria-live="assertive">
      <div className="kpt-notify-modal">
        <h3 className="kpt-notify-title">{active.title}</h3>
        <p className={`kpt-notify-message kpt-notify-${active.type}`}>{active.message}</p>
        <div className="kpt-notify-actions">
          {active.mode === 'confirm' ? (
            <>
              <button className="kpt-notify-cancel" onClick={confirmNo} type="button">Cancel</button>
              <button className="kpt-notify-ok" onClick={confirmYes} autoFocus type="button">OK</button>
            </>
          ) : (
            <button className="kpt-notify-ok" onClick={closeAlert} autoFocus type="button">OK</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationHost;
