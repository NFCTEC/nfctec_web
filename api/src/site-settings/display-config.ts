export const MODULE_KEYS = [
  'products',
  'solutions',
  'blog',
  'downloads',
  'platform',
  'contact',
] as const;

export type ModuleKey = (typeof MODULE_KEYS)[number];

export type ModuleDisplayConfig = {
  enabled: boolean;
  showInNav: boolean;
  mode: 'all' | 'selected';
  selectedIds: string[];
};

export type SiteDisplayConfig = {
  modules: Record<ModuleKey, ModuleDisplayConfig>;
};

export const DISPLAY_CONFIG_KEY = 'display_config';

export const DEFAULT_MODULE_CONFIG: ModuleDisplayConfig = {
  enabled: true,
  showInNav: true,
  mode: 'all',
  selectedIds: [],
};

export const DEFAULT_DISPLAY_CONFIG: SiteDisplayConfig = {
  modules: {
    products: { ...DEFAULT_MODULE_CONFIG },
    solutions: { ...DEFAULT_MODULE_CONFIG },
    blog: { ...DEFAULT_MODULE_CONFIG },
    downloads: { ...DEFAULT_MODULE_CONFIG },
    platform: { ...DEFAULT_MODULE_CONFIG },
    contact: { ...DEFAULT_MODULE_CONFIG },
  },
};

function normalizeModuleConfig(raw: unknown): ModuleDisplayConfig {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_MODULE_CONFIG };
  const o = raw as Record<string, unknown>;
  return {
    enabled: o.enabled !== false,
    showInNav: o.showInNav !== false,
    mode: o.mode === 'selected' ? 'selected' : 'all',
    selectedIds: Array.isArray(o.selectedIds)
      ? o.selectedIds.filter((id): id is string => typeof id === 'string')
      : [],
  };
}

export function mergeDisplayConfig(raw: unknown): SiteDisplayConfig {
  if (!raw || typeof raw !== 'object') return structuredClone(DEFAULT_DISPLAY_CONFIG);
  const modulesRaw = (raw as { modules?: unknown }).modules;
  if (!modulesRaw || typeof modulesRaw !== 'object') return structuredClone(DEFAULT_DISPLAY_CONFIG);

  const modules = { ...DEFAULT_DISPLAY_CONFIG.modules };
  for (const key of MODULE_KEYS) {
    modules[key] = normalizeModuleConfig((modulesRaw as Record<string, unknown>)[key]);
  }
  return { modules };
}

export function filterByDisplayConfig<T extends { id: string }>(
  items: T[],
  moduleConfig: ModuleDisplayConfig,
): T[] {
  if (!moduleConfig.enabled) return [];
  if (moduleConfig.mode === 'all') return items;
  const selected = new Set(moduleConfig.selectedIds);
  return items.filter((item) => selected.has(item.id));
}
