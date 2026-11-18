import type { LoaderFunction } from 'react-router';

import { LLMManager } from '~/lib/modules/llm/manager';

interface ConfiguredProvider {
  name: string;
  isConfigured: boolean;
  configMethod: 'environment' | 'none';
}

function readServerValue(env: Record<string, unknown> | undefined, managerEnv: Record<string, string>, key: string) {
  return env?.[key] || process.env[key] || managerEnv[key];
}

function isRealSecret(value: unknown) {
  return typeof value === 'string' && value.trim().length > 10 && !value.includes('your_') && !value.includes('_here');
}

function isRealBaseUrl(value: unknown) {
  if (typeof value !== 'string' || value.includes('your_') || value.includes('_here')) {
    return false;
  }

  try {
    const url = new URL(value.trim());

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Reports which providers have a server-side key or base URL.
 * The response never includes the secret itself.
 */
export const loader: LoaderFunction = async ({ context }) => {
  try {
    const serverEnv = context?.cloudflare?.env as unknown as Record<string, unknown> | undefined;
    const llmManager = LLMManager.getInstance(serverEnv as Record<string, string> | undefined);
    const configuredProviders: ConfiguredProvider[] = [];

    for (const providerInstance of llmManager.getAllProviders()) {
      const config = providerInstance.config;

      const baseUrlValue = config.baseUrlKey
        ? readServerValue(serverEnv, llmManager.env, config.baseUrlKey)
        : undefined;
      const apiTokenValue = config.apiTokenKey
        ? readServerValue(serverEnv, llmManager.env, config.apiTokenKey)
        : undefined;

      const hasBaseUrl =
        !config.baseUrlKey || isRealBaseUrl(baseUrlValue) || Boolean(config.baseUrl && config.apiTokenKey);

      const hasApiToken = !config.apiTokenKey || isRealSecret(apiTokenValue);
      const isConfigured = hasBaseUrl && hasApiToken;

      configuredProviders.push({
        name: providerInstance.name,
        isConfigured,
        configMethod: isConfigured ? 'environment' : 'none',
      });
    }

    return Response.json({
      providers: configuredProviders,
    });
  } catch (error) {
    console.error('Error detecting configured providers:', error);

    return Response.json({
      providers: [],
    });
  }
};
