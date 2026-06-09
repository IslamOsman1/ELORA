import React, { useEffect } from 'react';

const DEFAULT_SITE_URL = 'https://eloradental.care';

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      element.removeAttribute(key);
      return;
    }

    element.setAttribute(key, value);
  });
}

function upsertLink(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('link');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      element.removeAttribute(key);
      return;
    }

    element.setAttribute(key, value);
  });
}

function upsertScript(id, json) {
  let element = document.head.querySelector(`#${id}`);

  if (!element) {
    element = document.createElement('script');
    element.type = 'application/ld+json';
    element.id = id;
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(json);
}

function removeElement(selector) {
  document.head.querySelector(selector)?.remove();
}

function normalizePath(path = '/') {
  if (!path) return '/';
  const [pathname, search = ''] = path.split('?');
  const normalizedPathname = pathname === '/' ? '/' : pathname.replace(/\/+$/, '') || '/';
  return search ? `${normalizedPathname}?${search}` : normalizedPathname;
}

function getSiteUrl() {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL;
}

function buildAbsoluteUrl(path = '/') {
  return new URL(normalizePath(path), getSiteUrl()).toString();
}

export default function Seo({
  title,
  description,
  image = '/logo.jpg',
  path,
  type = 'website',
  noindex = false,
  jsonLd,
  keywords,
  imageAlt,
  locale
}) {
  useEffect(() => {
    const canonical = buildAbsoluteUrl(path || (typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/'));
    const imageUrl = buildAbsoluteUrl(image);
    const resolvedLocale = locale || (document.documentElement.lang === 'ar' ? 'ar_AR' : 'en_US');
    document.title = title;

    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[name="keywords"]', { name: 'keywords', content: keywords });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: noindex ? 'noindex, nofollow' : 'index, follow' });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonical });
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: 'ELORA Dental Care' });
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: resolvedLocale });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl });
    upsertMeta('meta[property="og:image:alt"]', { property: 'og:image:alt', content: imageAlt || title });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl });
    upsertMeta('meta[name="twitter:image:alt"]', { name: 'twitter:image:alt', content: imageAlt || title });
    upsertLink('link[rel="canonical"]', { rel: 'canonical', href: canonical });

    if (jsonLd) {
      upsertScript('seo-json-ld', jsonLd);
    } else {
      removeElement('#seo-json-ld');
    }
  }, [description, image, imageAlt, jsonLd, keywords, locale, noindex, path, title, type]);

  return null;
}
