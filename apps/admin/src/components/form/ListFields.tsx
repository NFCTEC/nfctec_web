import { Button, Form, Input, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

type StringListFieldProps = {
  name: string | (string | number)[];
  label: string;
  placeholder?: string;
};

export function StringListField({ name, label, placeholder }: StringListFieldProps) {
  return (
    <Form.List name={name} rules={[{ validator: async (_, v) => (v?.length ? Promise.resolve() : Promise.reject('Add at least one item')) }]}>
      {(fields, { add, remove }) => (
        <Form.Item label={label} required>
          {fields.map(({ key, name: fieldName, ...rest }) => (
            <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
              <Form.Item {...rest} name={fieldName} rules={[{ required: true, message: 'Required' }]} style={{ flex: 1, marginBottom: 0 }}>
                <Input placeholder={placeholder} style={{ minWidth: 320 }} />
              </Form.Item>
              <MinusCircleOutlined onClick={() => remove(fieldName)} />
            </Space>
          ))}
          <Button type="dashed" onClick={() => add('')} icon={<PlusOutlined />}>
            Add item
          </Button>
        </Form.Item>
      )}
    </Form.List>
  );
}

type PairListFieldProps = {
  name: string | (string | number)[];
  label: string;
  titleLabel?: string;
  descLabel?: string;
};

export function PairListField({ name, label, titleLabel = 'Title', descLabel = 'Description' }: PairListFieldProps) {
  return (
    <Form.List name={name}>
      {(fields, { add, remove }) => (
        <Form.Item label={label}>
          {fields.map(({ key, name: fieldName, ...rest }) => (
            <div key={key} style={{ marginBottom: 12, padding: 12, border: '1px solid #f0f0f0', borderRadius: 8 }}>
              <Form.Item {...rest} name={[fieldName, 'title']} label={titleLabel} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item {...rest} name={[fieldName, 'description']} label={descLabel} rules={[{ required: true }]}>
                <Input.TextArea rows={2} />
              </Form.Item>
              <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(fieldName)}>
                Remove
              </Button>
            </div>
          ))}
          <Button type="dashed" onClick={() => add({ title: '', description: '' })} block icon={<PlusOutlined />}>
            Add row
          </Button>
        </Form.Item>
      )}
    </Form.List>
  );
}

type ResourceListFieldProps = {
  name: string | (string | number)[];
  label: string;
};

export function ResourceListField({ name, label }: ResourceListFieldProps) {
  return (
    <Form.List name={name}>
      {(fields, { add, remove }) => (
        <Form.Item label={label}>
          {fields.map(({ key, name: fieldName, ...rest }) => (
            <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="start">
              <Form.Item {...rest} name={[fieldName, 'title']} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <Input placeholder="Title" style={{ width: 220 }} />
              </Form.Item>
              <Form.Item {...rest} name={[fieldName, 'kind']} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <Input placeholder="Kind (e.g. SDK, Datasheet)" style={{ width: 160 }} />
              </Form.Item>
              <MinusCircleOutlined style={{ marginTop: 8 }} onClick={() => remove(fieldName)} />
            </Space>
          ))}
          <Button type="dashed" onClick={() => add({ title: '', kind: '' })} block icon={<PlusOutlined />}>
            Add resource
          </Button>
        </Form.Item>
      )}
    </Form.List>
  );
}

/** Normalize API JSON arrays to form-friendly shapes. */
export function normalizeStringList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((item) => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object') {
      const o = item as { en?: string; zh?: string };
      return o.en ?? o.zh ?? '';
    }
    return String(item);
  });
}

export function normalizePairs(v: unknown): { title: string; description: string }[] {
  if (!Array.isArray(v)) return [];
  return v.map((item) => {
    if (item && typeof item === 'object') {
      const o = item as Record<string, unknown>;
      if (o.t && typeof o.t === 'object') {
        const t = o.t as { en?: string; zh?: string };
        const d = o.d as { en?: string; zh?: string } | undefined;
        return { title: t.en ?? t.zh ?? '', description: d?.en ?? d?.zh ?? '' };
      }
      return { title: String(o.title ?? ''), description: String(o.description ?? '') };
    }
    return { title: '', description: '' };
  });
}

export function normalizeResources(v: unknown): { title: string; kind: string }[] {
  if (!Array.isArray(v)) return [];
  return v.map((item) => {
    if (item && typeof item === 'object') {
      const o = item as Record<string, unknown>;
      if (o.t && typeof o.t === 'object') {
        const t = o.t as { en?: string; zh?: string };
        const k = o.kind as { en?: string; zh?: string } | undefined;
        return { title: t.en ?? t.zh ?? '', kind: k?.en ?? k?.zh ?? '' };
      }
      return { title: String(o.title ?? ''), kind: String(o.kind ?? '') };
    }
    return { title: '', kind: '' };
  });
}

export function normalizeImages(v: unknown): { src: string; label: string }[] {
  if (!Array.isArray(v)) return [];
  return v.map((item) => {
    if (item && typeof item === 'object') {
      const o = item as Record<string, unknown>;
      return { src: String(o.src ?? ''), label: String(o.label ?? '') };
    }
    return { src: '', label: '' };
  });
}

export function normalizeFeatures(v: unknown): { title: string; description: string; icon: string }[] {
  if (!Array.isArray(v)) return [];
  return v.map((item) => {
    if (item && typeof item === 'object') {
      const o = item as Record<string, unknown>;
      return {
        title: String(o.title ?? ''),
        description: String(o.description ?? ''),
        icon: String(o.icon ?? 'Zap'),
      };
    }
    return { title: '', description: '', icon: 'Zap' };
  });
}

export function normalizeSpecs(v: unknown): { key: string; value: string }[] {
  if (!Array.isArray(v)) return [];
  return v.map((item) => {
    if (item && typeof item === 'object') {
      const o = item as Record<string, unknown>;
      return { key: String(o.key ?? ''), value: String(o.value ?? '') };
    }
    return { key: '', value: '' };
  });
}

type ImageListFieldProps = { name: string | (string | number)[]; label: string };

export function ImageListField({ name, label }: ImageListFieldProps) {
  return (
    <Form.List name={name}>
      {(fields, { add, remove }) => (
        <Form.Item label={label}>
          {fields.map(({ key, name: fieldName, ...rest }) => (
            <div key={key} style={{ marginBottom: 12, padding: 12, border: '1px solid #f0f0f0', borderRadius: 8 }}>
              <Form.Item {...rest} name={[fieldName, 'src']} label="Image URL" rules={[{ required: true }]}>
                <Input placeholder="https://… or /uploads/…" />
              </Form.Item>
              <Form.Item {...rest} name={[fieldName, 'label']} label="Label">
                <Input placeholder="Front / Back" />
              </Form.Item>
              <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(fieldName)}>
                Remove
              </Button>
            </div>
          ))}
          <Button type="dashed" onClick={() => add({ src: '', label: '' })} block icon={<PlusOutlined />}>
            Add image
          </Button>
        </Form.Item>
      )}
    </Form.List>
  );
}

type FeatureListFieldProps = { name: string | (string | number)[]; label: string };

export function FeatureListField({ name, label }: FeatureListFieldProps) {
  return (
    <Form.List name={name}>
      {(fields, { add, remove }) => (
        <Form.Item label={label}>
          {fields.map(({ key, name: fieldName, ...rest }) => (
            <div key={key} style={{ marginBottom: 12, padding: 12, border: '1px solid #f0f0f0', borderRadius: 8 }}>
              <Form.Item {...rest} name={[fieldName, 'icon']} label="Icon (Lucide)">
                <Input placeholder="Zap, Radio, Wrench…" />
              </Form.Item>
              <Form.Item {...rest} name={[fieldName, 'title']} label="Title" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item {...rest} name={[fieldName, 'description']} label="Description" rules={[{ required: true }]}>
                <Input.TextArea rows={2} />
              </Form.Item>
              <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(fieldName)}>
                Remove
              </Button>
            </div>
          ))}
          <Button type="dashed" onClick={() => add({ icon: 'Zap', title: '', description: '' })} block icon={<PlusOutlined />}>
            Add feature
          </Button>
        </Form.Item>
      )}
    </Form.List>
  );
}

type SpecListFieldProps = { name: string | (string | number)[]; label: string };

export function SpecListField({ name, label }: SpecListFieldProps) {
  return (
    <Form.List name={name}>
      {(fields, { add, remove }) => (
        <Form.Item label={label}>
          {fields.map(({ key, name: fieldName, ...rest }) => (
            <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
              <Form.Item {...rest} name={[fieldName, 'key']} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <Input placeholder="Key" style={{ width: 200 }} />
              </Form.Item>
              <Form.Item {...rest} name={[fieldName, 'value']} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <Input placeholder="Value" style={{ width: 280 }} />
              </Form.Item>
              <MinusCircleOutlined onClick={() => remove(fieldName)} />
            </Space>
          ))}
          <Button type="dashed" onClick={() => add({ key: '', value: '' })} block icon={<PlusOutlined />}>
            Add spec row
          </Button>
        </Form.Item>
      )}
    </Form.List>
  );
}
