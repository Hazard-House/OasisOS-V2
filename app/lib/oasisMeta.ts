import type { MetaDescriptor } from 'react-router';

const DESCRIPTION = 'OasisOS builds web apps in the browser.';

export function oasisMeta(title = 'OasisOS'): MetaDescriptor[] {
  return [
    { title },
    { name: 'description', content: DESCRIPTION },
    { name: 'application-name', content: 'OasisOS' },
    { name: 'theme-color', content: '#092b49' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: DESCRIPTION },
    { property: 'og:image', content: '/brand/og-image.png' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: DESCRIPTION },
    { name: 'twitter:image', content: '/brand/og-image.png' },
  ];
}
