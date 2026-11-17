import { describe, expect, it } from 'vitest';
import { BaseProvider } from './base-provider';
import { openRouterKeyShape } from './providers/open-router';
import * as providers from './registry';

describe('LLM provider registry', () => {
  const exportedClasses = Object.values(providers).filter(
    (item) => typeof item === 'function' && item.prototype instanceof BaseProvider,
  ) as unknown as Array<new () => BaseProvider>;

  it('exports at least one provider class', () => {
    expect(exportedClasses.length).toBeGreaterThan(0);
  });

  it('all exported classes extend BaseProvider', () => {
    for (const providerClass of exportedClasses) {
      expect(providerClass.prototype).toBeInstanceOf(BaseProvider);
    }
  });

  it('every provider has a unique name and defined config', () => {
    const instances = exportedClasses.map((providerClass) => new providerClass());
    const names = instances.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);

    for (const provider of instances) {
      expect(provider.name.length).toBeGreaterThan(0);
      expect(provider.config).toBeDefined();
    }
  });

  it('includes the OpenRouter provider used by the e2e suite', () => {
    const openRouterProvider = new (providers.OpenRouterProvider as new () => BaseProvider)();
    const provider = openRouterProvider;
    expect(provider.name).toBe('OpenRouter');
    expect(provider.config.apiTokenKey).toBe('OPEN_ROUTER_API_KEY');
    expect(provider.staticModels.length).toBeGreaterThan(0);
  });

  it('describes an OpenRouter key without copying the secret', () => {
    const secret = 'sk-or-v1-secretvalue';
    const shape = openRouterKeyShape(secret);

    expect(shape).toBe(`keyLength=${secret.length} keyPrefix=sk-or placeholder=false`);
    expect(shape).not.toContain('secretvalue');
    expect(openRouterKeyShape('your_openrouter_api_key_here')).toContain('placeholder=true');
  });
});
