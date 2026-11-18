import type { LoaderFunction } from 'react-router';
import { LLMManager } from '~/lib/modules/llm/manager';

export const loader: LoaderFunction = async ({ context, request }) => {
  const url = new URL(request.url);
  const provider = url.searchParams.get('provider');

  if (!provider) {
    return Response.json({ isSet: false });
  }

  const llmManager = LLMManager.getInstance(context?.cloudflare?.env as any);
  const providerInstance = llmManager.getProvider(provider);

  if (!providerInstance || !providerInstance.config.apiTokenKey) {
    return Response.json({ isSet: false });
  }

  const envVarName = providerInstance.config.apiTokenKey;

  /*
   * Browser cookies are a separate credential. This route answers only whether
   * the server process has a key, so a saved browser key cannot look like one.
   */
  const isSet = !!(
    (context?.cloudflare?.env as unknown as Record<string, unknown> | undefined)?.[envVarName] ||
    process.env[envVarName] ||
    llmManager.env[envVarName]
  );

  return Response.json({ isSet });
};
