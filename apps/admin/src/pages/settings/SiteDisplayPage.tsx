import { Button, Card, Divider, Radio, Select, Space, Switch, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import {
  api,
  type DownloadGroup,
  type ModuleDisplayConfig,
  type ModuleKey,
  type Post,
  type Product,
  type SiteDisplayConfig,
  type Solution,
} from '../../lib/api';
import { getApiErrorMessage } from '../../lib/errors';

const MODULE_KEYS: ModuleKey[] = ['products', 'solutions', 'blog', 'downloads', 'platform', 'contact'];

const MODULE_LABELS: Record<ModuleKey, string> = {
  products: 'Products',
  solutions: 'Solutions',
  blog: 'Blog',
  downloads: 'Downloads',
  platform: 'Platform',
  contact: 'Contact',
};

const DEFAULT_MODULE: ModuleDisplayConfig = {
  enabled: true,
  showInNav: true,
  mode: 'all',
  selectedIds: [],
};

const DEFAULT_CONFIG: SiteDisplayConfig = {
  modules: {
    products: { ...DEFAULT_MODULE },
    solutions: { ...DEFAULT_MODULE },
    blog: { ...DEFAULT_MODULE },
    downloads: { ...DEFAULT_MODULE },
    platform: { ...DEFAULT_MODULE },
    contact: { ...DEFAULT_MODULE },
  },
};

type SelectOption = { value: string; label: string };

export function SiteDisplayPage() {
  const [locale, setLocale] = useState<'en' | 'zh'>('en');
  const [config, setConfig] = useState<SiteDisplayConfig>(DEFAULT_CONFIG);
  const [options, setOptions] = useState<Record<ModuleKey, SelectOption[]>>({
    products: [],
    solutions: [],
    blog: [],
    downloads: [],
    platform: [],
    contact: [],
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadOptions = useCallback(async (loc: 'en' | 'zh') => {
    const [products, solutions, posts, downloads] = await Promise.all([
      api.get<Product[]>('/admin/products', { params: { locale: loc, status: 'published' } }),
      api.get<Solution[]>('/admin/solutions', { params: { locale: loc, status: 'published' } }),
      api.get<Post[]>('/admin/posts', { params: { locale: loc, status: 'published' } }),
      api.get<DownloadGroup[]>('/admin/downloads/groups', { params: { locale: loc } }),
    ]);

    setOptions({
      products: products.data.map((p) => ({ value: p.id, label: `${p.name} (${p.category})` })),
      solutions: solutions.data.map((s) => ({ value: s.id, label: s.name })),
      blog: posts.data.map((p) => ({ value: p.id, label: p.title })),
      downloads: downloads.data.map((g) => ({ value: g.id, label: g.name })),
      platform: [],
      contact: [],
    });
  }, []);

  const loadConfig = useCallback(async (loc: 'en' | 'zh') => {
    setLoading(true);
    try {
      const { data } = await api.get<SiteDisplayConfig>('/admin/site-settings/display-config', {
        params: { locale: loc },
      });
      setConfig({
        modules: {
          ...DEFAULT_CONFIG.modules,
          ...data.modules,
        },
      });
      await loadOptions(loc);
    } catch {
      message.error('Failed to load display config');
    } finally {
      setLoading(false);
    }
  }, [loadOptions]);

  useEffect(() => {
    void loadConfig(locale);
  }, [locale, loadConfig]);

  const updateModule = (key: ModuleKey, patch: Partial<ModuleDisplayConfig>) => {
    setConfig((prev) => ({
      modules: {
        ...prev.modules,
        [key]: { ...prev.modules[key], ...patch },
      },
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/admin/site-settings/display-config', { locale, config });
      message.success('Display settings saved');
    } catch (err: unknown) {
      message.error(getApiErrorMessage(err, 'Save failed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      title="Site display"
      extra={
        <Space>
          <Select
            value={locale}
            onChange={setLocale}
            options={[
              { value: 'en', label: 'English' },
              { value: 'zh', label: '中文' },
            ]}
            style={{ width: 120 }}
          />
          <Button type="primary" loading={saving} onClick={() => void save()}>
            Save
          </Button>
        </Space>
      }
      loading={loading}
    >
      <p style={{ color: '#666', marginTop: 0 }}>
        Control which modules appear on the website and which published items are visible per locale.
      </p>

      {MODULE_KEYS.map((key) => {
        const mod = config.modules[key] ?? DEFAULT_MODULE;
        const isStatic = key === 'platform' || key === 'contact';
        return (
          <div key={key}>
            <Divider titlePlacement="left">{MODULE_LABELS[key]}</Divider>
            <Space wrap size="large" style={{ marginBottom: 12 }}>
              <Space>
                <span>Enabled</span>
                <Switch
                  checked={mod.enabled}
                  onChange={(enabled) => updateModule(key, { enabled })}
                />
              </Space>
              <Space>
                <span>Show in navigation</span>
                <Switch
                  checked={mod.showInNav}
                  onChange={(showInNav) => updateModule(key, { showInNav })}
                />
              </Space>
            </Space>

            {!isStatic && (
              <>
                <Radio.Group
                  value={mod.mode}
                  onChange={(e) => updateModule(key, { mode: e.target.value as 'all' | 'selected' })}
                  style={{ marginBottom: 12 }}
                >
                  <Radio value="all">Show all published</Radio>
                  <Radio value="selected">Show selected only</Radio>
                </Radio.Group>

                {mod.mode === 'selected' && (
                  <Select
                    mode="multiple"
                    allowClear
                    placeholder={`Select ${MODULE_LABELS[key].toLowerCase()} to display`}
                    style={{ width: '100%', maxWidth: 640 }}
                    value={mod.selectedIds}
                    onChange={(selectedIds) => updateModule(key, { selectedIds })}
                    options={options[key]}
                  />
                )}
              </>
            )}
          </div>
        );
      })}
    </Card>
  );
}
