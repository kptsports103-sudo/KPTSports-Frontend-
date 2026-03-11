import { useEffect } from 'react';
import { getRouteMeta, SITE_NAME } from '../seo/siteMeta';

const ensureTag = (selector, tagName, attributes) => {
  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement(tagName);
    document.head.appendChild(node);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      node.removeAttribute(key);
      return;
    }
    node.setAttribute(key, value);
  });

  return node;
};

export const usePageSeo = (pathname) => {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const meta = getRouteMeta(pathname);

    document.title = meta.title || SITE_NAME;
    document.documentElement.setAttribute('lang', 'en');

    ensureTag('meta[name="description"][data-kpt-seo="true"]', 'meta', {
      name: 'description',
      content: meta.description,
      'data-kpt-seo': 'true',
    });

    ensureTag('meta[name="robots"][data-kpt-seo="true"]', 'meta', {
      name: 'robots',
      content: meta.robots,
      'data-kpt-seo': 'true',
    });

    ensureTag('link[rel="canonical"][data-kpt-seo="true"]', 'link', {
      rel: 'canonical',
      href: meta.canonical,
      'data-kpt-seo': 'true',
    });

    ensureTag('meta[property="og:type"][data-kpt-seo="true"]', 'meta', {
      property: 'og:type',
      content: meta.type,
      'data-kpt-seo': 'true',
    });

    ensureTag('meta[property="og:site_name"][data-kpt-seo="true"]', 'meta', {
      property: 'og:site_name',
      content: SITE_NAME,
      'data-kpt-seo': 'true',
    });

    ensureTag('meta[property="og:title"][data-kpt-seo="true"]', 'meta', {
      property: 'og:title',
      content: meta.title,
      'data-kpt-seo': 'true',
    });

    ensureTag('meta[property="og:description"][data-kpt-seo="true"]', 'meta', {
      property: 'og:description',
      content: meta.description,
      'data-kpt-seo': 'true',
    });

    ensureTag('meta[property="og:url"][data-kpt-seo="true"]', 'meta', {
      property: 'og:url',
      content: meta.canonical,
      'data-kpt-seo': 'true',
    });

    ensureTag('meta[property="og:image"][data-kpt-seo="true"]', 'meta', {
      property: 'og:image',
      content: meta.image,
      'data-kpt-seo': 'true',
    });

    ensureTag('meta[name="twitter:card"][data-kpt-seo="true"]', 'meta', {
      name: 'twitter:card',
      content: 'summary_large_image',
      'data-kpt-seo': 'true',
    });

    ensureTag('meta[name="twitter:title"][data-kpt-seo="true"]', 'meta', {
      name: 'twitter:title',
      content: meta.title,
      'data-kpt-seo': 'true',
    });

    ensureTag('meta[name="twitter:description"][data-kpt-seo="true"]', 'meta', {
      name: 'twitter:description',
      content: meta.description,
      'data-kpt-seo': 'true',
    });

    ensureTag('meta[name="twitter:image"][data-kpt-seo="true"]', 'meta', {
      name: 'twitter:image',
      content: meta.image,
      'data-kpt-seo': 'true',
    });

    document.querySelectorAll('script[data-kpt-seo-ld="true"]').forEach((node) => node.remove());

    meta.jsonLd.forEach((entry) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-kpt-seo-ld', 'true');
      script.text = JSON.stringify(entry);
      document.head.appendChild(script);
    });
  }, [pathname]);
};
