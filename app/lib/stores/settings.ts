import { atom, map } from 'nanostores';
import { create } from 'zustand';
import { toggleTheme } from './theme';
import { DEFAULT_TAB_CONFIG } from '~/components/@settings/core/constants';
import type { TabVisibilityConfig, TabWindowConfig, UserTabConfig } from '~/components/@settings/core/types';
import type { IProviderConfig, IProviderSetting } from '~/types/model';
import { PROVIDER_LIST } from '~/utils/constants';

export interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  ctrlOrMetaKey?: boolean;
  action: () => void;
  description?: string; // Description of what the shortcut does
  isPreventDefault?: boolean; // Whether to prevent default browser behavior
}

export interface Shortcuts {
  toggleTheme: Shortcut;
  toggleTerminal: Shortcut;
}

export const URL_CONFIGURABLE_PROVIDERS = ['Ollama', 'LMStudio', 'OpenAILike'];
export const LOCAL_PROVIDERS = ['OpenAILike', 'LMStudio', 'Ollama'];

export type ProviderSetting = Record<string, IProviderConfig>;

// Simplified shortcuts store with only theme toggle
export const shortcutsStore = map<Shortcuts>({
  toggleTheme: {
    key: 'd',
    metaKey: true,
    altKey: true,
    shiftKey: true,
    action: () => toggleTheme(),
    description: 'Toggle theme',
    isPreventDefault: true,
  },
  toggleTerminal: {
    key: '`',
    ctrlOrMetaKey: true,
    action: () => {
      // This will be handled by the terminal component
    },
    description: 'Toggle terminal',
    isPreventDefault: true,
  },
});

// Create a single key for provider settings
const PROVIDER_SETTINGS_KEY = 'provider_settings';
const AUTO_ENABLED_KEY = 'auto_enabled_providers';
const USER_DISABLED_KEY = 'provider_user_disabled';
const USER_DISABLED_MIGRATED_KEY = 'provider_user_disabled_migrated';

// Add this helper function at the top of the file
const isBrowser = typeof window !== 'undefined';

// Interface for configured provider info from server
interface ConfiguredProvider {
  name: string;
  isConfigured: boolean;
  configMethod: 'environment' | 'none';
}

// Fetch configured providers from server
const fetchConfiguredProviders = async (): Promise<ConfiguredProvider[]> => {
  try {
    const response = await fetch('/api/configured-providers');

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as { providers?: ConfiguredProvider[] };

    return data.providers || [];
  } catch (error) {
    console.error('Error fetching configured providers:', error);
    return [];
  }
};

// Initialize provider settings from both localStorage and server-detected configuration
const getInitialProviderSettings = (): ProviderSetting => {
  const initialSettings: ProviderSetting = {};

  /*
   * Providers remain disabled until the user chooses one during onboarding or
   * enables it in Settings.
   */
  PROVIDER_LIST.forEach((provider) => {
    initialSettings[provider.name] = {
      ...provider,
      settings: {
        enabled: false,
      },
    };
  });

  // Only try to load from localStorage in the browser
  if (isBrowser) {
    const savedSettings = localStorage.getItem(PROVIDER_SETTINGS_KEY);

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        Object.entries(parsed).forEach(([key, value]) => {
          if (initialSettings[key]) {
            initialSettings[key].settings = (value as IProviderConfig).settings;
          }
        });
      } catch (error) {
        console.error('Error parsing saved provider settings:', error);
      }
    }
  }

  return initialSettings;
};

// Auto-enable providers that have a key or base URL on the server
const autoEnableConfiguredProviders = async () => {
  if (!isBrowser) {
    return;
  }

  try {
    const configuredProviders = await fetchConfiguredProviders();
    const currentSettings = providersStore.get();
    const userDisabled = migratePriorOptOuts();
    const newlyAutoEnabled: string[] = [];

    let hasChanges = false;

    configuredProviders.forEach(({ name, isConfigured, configMethod }) => {
      if (!isConfigured || configMethod !== 'environment' || userDisabled.includes(name)) {
        return;
      }

      const currentProvider = currentSettings[name];

      if (!currentProvider || currentProvider.settings.enabled) {
        return;
      }

      currentSettings[name] = {
        ...currentProvider,
        settings: {
          ...currentProvider.settings,
          enabled: true,
        },
      };
      newlyAutoEnabled.push(name);
      hasChanges = true;
    });

    if (hasChanges) {
      providersStore.set(currentSettings);
      localStorage.setItem(PROVIDER_SETTINGS_KEY, JSON.stringify(currentSettings));

      const previouslyAutoEnabled = readNameList(AUTO_ENABLED_KEY);
      const allAutoEnabled = [...new Set([...previouslyAutoEnabled, ...newlyAutoEnabled])];
      localStorage.setItem(AUTO_ENABLED_KEY, JSON.stringify(allAutoEnabled));
    }
  } catch (error) {
    console.error('Error auto-enabling configured providers:', error);
  }
};

export const providersStore = map<ProviderSetting>(getInitialProviderSettings());

// Export the auto-enable function for use in components
export const initializeProviders = autoEnableConfiguredProviders;

// Initialize providers when the module loads (in browser only)
if (isBrowser) {
  // Use a small delay to ensure DOM and other resources are ready
  setTimeout(() => {
    autoEnableConfiguredProviders();
  }, 100);
}

// Create a function to update provider settings that handles both store and persistence
export const updateProviderSettings = (provider: string, settings: IProviderSetting) => {
  const currentSettings = providersStore.get();

  // Create new provider config with updated settings
  const updatedProvider = {
    ...currentSettings[provider],
    settings: {
      ...currentSettings[provider].settings,
      ...settings,
    },
  };

  // Update the store with new settings
  providersStore.setKey(provider, updatedProvider);

  // Save to localStorage
  const allSettings = providersStore.get();
  localStorage.setItem(PROVIDER_SETTINGS_KEY, JSON.stringify(allSettings));

  if (updatedProvider.settings.enabled !== undefined) {
    updateAutoEnabledTracking(provider, updatedProvider.settings.enabled);
  }
};

// Update auto-enabled tracking when user manually changes provider settings
const updateAutoEnabledTracking = (providerName: string, isEnabled: boolean) => {
  if (!isBrowser) {
    return;
  }

  try {
    const currentAutoEnabled = readNameList(AUTO_ENABLED_KEY);
    const userDisabled = readUserDisabledProviders();

    if (isEnabled) {
      if (!currentAutoEnabled.includes(providerName)) {
        currentAutoEnabled.push(providerName);
        localStorage.setItem(AUTO_ENABLED_KEY, JSON.stringify(currentAutoEnabled));
      }

      if (userDisabled.includes(providerName)) {
        localStorage.setItem(USER_DISABLED_KEY, JSON.stringify(userDisabled.filter((name) => name !== providerName)));
      }
    } else {
      localStorage.setItem(
        AUTO_ENABLED_KEY,
        JSON.stringify(currentAutoEnabled.filter((name) => name !== providerName)),
      );

      if (!userDisabled.includes(providerName)) {
        userDisabled.push(providerName);
        localStorage.setItem(USER_DISABLED_KEY, JSON.stringify(userDisabled));
      }
    }
  } catch (error) {
    console.error('Error updating auto-enabled tracking:', error);
  }
};

function readNameList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed.filter((name) => typeof name === 'string') : [];
  } catch {
    return [];
  }
}

function readUserDisabledProviders() {
  return readNameList(USER_DISABLED_KEY);
}

function migratePriorOptOuts() {
  const existing = readUserDisabledProviders();

  if (!isBrowser || localStorage.getItem(USER_DISABLED_MIGRATED_KEY) === '1') {
    return existing;
  }

  const migrated = new Set(existing);
  const autoEnabledKeyPresent = localStorage.getItem(AUTO_ENABLED_KEY) !== null;

  if (autoEnabledKeyPresent) {
    const autoEnabled = readNameList(AUTO_ENABLED_KEY);

    try {
      const saved = JSON.parse(localStorage.getItem(PROVIDER_SETTINGS_KEY) || '{}') as ProviderSetting;

      for (const name of LOCAL_PROVIDERS) {
        const enabled = saved?.[name]?.settings?.enabled;

        if (enabled === false && !autoEnabled.includes(name)) {
          migrated.add(name);
        }
      }
    } catch {
      // Keep the current list when the saved settings cannot be read.
    }
  }

  const next = [...migrated];
  localStorage.setItem(USER_DISABLED_KEY, JSON.stringify(next));
  localStorage.setItem(USER_DISABLED_MIGRATED_KEY, '1');

  return next;
}

export const isDebugMode = atom(false);

// Define keys for localStorage
const SETTINGS_KEYS = {
  LATEST_BRANCH: 'isLatestBranch',
  AUTO_SELECT_TEMPLATE: 'autoSelectTemplate',
  CONTEXT_OPTIMIZATION: 'contextOptimizationEnabled',
  EVENT_LOGS: 'isEventLogsEnabled',
  PROMPT_ID: 'promptId',
  DEVELOPER_MODE: 'isDeveloperMode',
} as const;

// Initialize settings from localStorage or defaults
const getInitialSettings = () => {
  const getStoredBoolean = (key: string, defaultValue: boolean): boolean => {
    if (!isBrowser) {
      return defaultValue;
    }

    const stored = localStorage.getItem(key);

    if (stored === null) {
      return defaultValue;
    }

    try {
      return JSON.parse(stored);
    } catch {
      return defaultValue;
    }
  };

  return {
    latestBranch: getStoredBoolean(SETTINGS_KEYS.LATEST_BRANCH, false),
    autoSelectTemplate: getStoredBoolean(SETTINGS_KEYS.AUTO_SELECT_TEMPLATE, true),
    contextOptimization: getStoredBoolean(SETTINGS_KEYS.CONTEXT_OPTIMIZATION, true),
    eventLogs: getStoredBoolean(SETTINGS_KEYS.EVENT_LOGS, true),
    promptId: isBrowser ? localStorage.getItem(SETTINGS_KEYS.PROMPT_ID) || 'default' : 'default',
    developerMode: getStoredBoolean(SETTINGS_KEYS.DEVELOPER_MODE, false),
  };
};

// Initialize stores with persisted values
const initialSettings = getInitialSettings();

export const latestBranchStore = atom<boolean>(initialSettings.latestBranch);
export const autoSelectStarterTemplate = atom<boolean>(initialSettings.autoSelectTemplate);
export const enableContextOptimizationStore = atom<boolean>(initialSettings.contextOptimization);
export const isEventLogsEnabled = atom<boolean>(initialSettings.eventLogs);
export const promptStore = atom<string>(initialSettings.promptId);

// Helper functions to update settings with persistence
export const updateLatestBranch = (enabled: boolean) => {
  latestBranchStore.set(enabled);
  localStorage.setItem(SETTINGS_KEYS.LATEST_BRANCH, JSON.stringify(enabled));
};

export const updateAutoSelectTemplate = (enabled: boolean) => {
  autoSelectStarterTemplate.set(enabled);
  localStorage.setItem(SETTINGS_KEYS.AUTO_SELECT_TEMPLATE, JSON.stringify(enabled));
};

export const updateContextOptimization = (enabled: boolean) => {
  enableContextOptimizationStore.set(enabled);
  localStorage.setItem(SETTINGS_KEYS.CONTEXT_OPTIMIZATION, JSON.stringify(enabled));
};

export const updateEventLogs = (enabled: boolean) => {
  isEventLogsEnabled.set(enabled);
  localStorage.setItem(SETTINGS_KEYS.EVENT_LOGS, JSON.stringify(enabled));
};

export const updatePromptId = (id: string) => {
  promptStore.set(id);
  localStorage.setItem(SETTINGS_KEYS.PROMPT_ID, id);
};

// Initialize tab configuration from localStorage or defaults
const getInitialTabConfiguration = (): TabWindowConfig => {
  const defaultConfig: TabWindowConfig = {
    userTabs: DEFAULT_TAB_CONFIG.filter((tab): tab is UserTabConfig => tab.window === 'user'),
  };

  if (!isBrowser) {
    return defaultConfig;
  }

  try {
    const saved = localStorage.getItem('bolt_tab_configuration');

    if (!saved) {
      return defaultConfig;
    }

    const parsed = JSON.parse(saved);

    if (!parsed?.userTabs) {
      return defaultConfig;
    }

    // Ensure proper typing of loaded configuration
    const savedTabs = parsed.userTabs.filter(
      (tab: TabVisibilityConfig): tab is UserTabConfig => tab.window === 'user' && Boolean(tab.id),
    );

    const savedIds = new Set(savedTabs.map((tab: UserTabConfig) => tab.id));
    const missingDefaults = defaultConfig.userTabs.filter((tab) => !savedIds.has(tab.id));

    return { userTabs: [...savedTabs, ...missingDefaults] };
  } catch (error) {
    console.warn('Failed to parse tab configuration:', error);
    return defaultConfig;
  }
};

// console.log('Initial tab configuration:', getInitialTabConfiguration());

export const tabConfigurationStore = map<TabWindowConfig>(getInitialTabConfiguration());

// Helper function to reset tab configuration
export const resetTabConfiguration = () => {
  const defaultConfig: TabWindowConfig = {
    userTabs: DEFAULT_TAB_CONFIG.filter((tab): tab is UserTabConfig => tab.window === 'user'),
  };

  tabConfigurationStore.set(defaultConfig);
  localStorage.setItem('bolt_tab_configuration', JSON.stringify(defaultConfig));
};

// First, let's define the SettingsStore interface
interface SettingsStore {
  isOpen: boolean;
  selectedTab: string;
  openSettings: () => void;
  closeSettings: () => void;
  setSelectedTab: (tab: string) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  isOpen: false,
  selectedTab: 'user', // Default tab

  openSettings: () => {
    set({
      isOpen: true,
      selectedTab: 'user', // Always open to user tab
    });
  },

  closeSettings: () => {
    set({
      isOpen: false,
      selectedTab: 'user', // Reset to user tab when closing
    });
  },

  setSelectedTab: (tab: string) => {
    set({ selectedTab: tab });
  },
}));
