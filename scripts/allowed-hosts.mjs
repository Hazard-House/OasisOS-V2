const LOCAL_HOSTS = ['localhost'];

function hostnameFrom(value) {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  try {
    return new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`).hostname;
  } catch {
    return undefined;
  }
}

export function previewAllowedHosts(env = process.env) {
  const hosts = new Set(LOCAL_HOSTS);
  const fromPublicUrl = hostnameFrom(env.VITE_PUBLIC_APP_URL);
  const fromRailwayDomain = hostnameFrom(env.RAILWAY_PUBLIC_DOMAIN);

  if (fromPublicUrl) {
    hosts.add(fromPublicUrl);
  }

  if (fromRailwayDomain) {
    hosts.add(fromRailwayDomain);
  }

  return [...hosts];
}
