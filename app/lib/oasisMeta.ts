import type { MetaDescriptor } from 'react-router';

const DESCRIPTION = 'OasisOS builds web apps in the browser.';
const IMAGE_PATH = '/brand/og-image.png';

type MetaInput = {
  location?: { pathname?: string; search?: string };
  data?: unknown;
  matches?: Array<{ loaderData?: unknown }>;
};

function readOrigin(value: unknown): string | undefined {
  if (!value || typeof value !== 'object' || !('origin' in value)) {
    return undefined;
  }

  const origin = (value as { origin?: unknown }).origin;

  if (typeof origin !== 'string' || origin.length === 0) {
    return undefined;
  }

  try {
    return new URL(origin).origin;
  } catch {
    return undefined;
  }
}

function resolveOrigin(args?: MetaInput): string | undefined {
  const fromRequest = [args?.data, ...(args?.matches ?? []).map((match) => match.loaderData)]
    .map(readOrigin)
    .find((origin) => origin);

  if (fromRequest) {
    return fromRequest;
  }

  const configured = import.meta.env.VITE_PUBLIC_APP_URL;

  if (typeof configured !== 'string') {
    return undefined;
  }

  try {
    return new URL(configured).origin;
  } catch {
    return undefined;
  }
}

function absoluteUrl(origin: string | undefined, path: string): string | undefined {
  if (!origin || !path.startsWith('/') || path.startsWith('//')) {
    return undefined;
  }

  try {
    const url = new URL(path, origin);

    if (url.origin !== origin) {
      return undefined;
    }

    return url.toString();
  } catch {
    return undefined;
  }
}

export function oasisMeta(title = 'OasisOS', args?: MetaInput): MetaDescriptor[] {
  const origin = resolveOrigin(args);
  const pathname = args?.location?.pathname || '/';
  const search = args?.location?.search?.startsWith('?') ? args.location.search : '';
  const safePath = pathname.startsWith('/') && !pathname.startsWith('//') ? pathname : '/';
  const pageUrl = absoluteUrl(origin, `${safePath}${search}`);
  const imageUrl = absoluteUrl(origin, IMAGE_PATH) ?? IMAGE_PATH;

  return [
    { title },
    { name: 'description', content: DESCRIPTION },
    { name: 'application-name', content: 'OasisOS' },
    { name: 'theme-color', content: '#092b49' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: DESCRIPTION },
    ...(pageUrl ? [{ property: 'og:url', content: pageUrl }] : []),
    { property: 'og:image', content: imageUrl },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: DESCRIPTION },
    { name: 'twitter:image', content: imageUrl },
  ];
}
