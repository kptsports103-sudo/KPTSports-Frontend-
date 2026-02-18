export const CMS_PAGE_UPDATED = 'CMS_PAGE_UPDATED';

export const emitPageUpdate = (pageName) => {
  window.dispatchEvent(
    new CustomEvent(CMS_PAGE_UPDATED, {
      detail: { pageName, time: Date.now() }
    })
  );
};
