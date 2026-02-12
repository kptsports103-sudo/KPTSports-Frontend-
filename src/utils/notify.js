const NOTIFY_EVENT = 'kpt:notify';

export const notify = (message, options = {}) => {
  const text = typeof message === 'string' ? message : String(message ?? '');
  window.dispatchEvent(
    new CustomEvent(NOTIFY_EVENT, {
      detail: {
        title: options.title || 'KPT Sports Results',
        message: text,
        type: options.type || 'info',
        position: options.position || 'center',
      },
    })
  );
};

export const confirmAction = (message, options = {}) =>
  new Promise((resolve) => {
    const text = typeof message === 'string' ? message : String(message ?? '');
    window.dispatchEvent(
      new CustomEvent(NOTIFY_EVENT, {
        detail: {
          title: options.title || 'KPT Sports Results',
          message: text,
          type: options.type || 'info',
          position: options.position || 'center',
          mode: 'confirm',
          resolve,
        },
      })
    );
  });

export const getNotifyEventName = () => NOTIFY_EVENT;

export default notify;
