import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
  message,
} from 'antd';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RichTextEditor } from '../../components/RichTextEditor';
import {
  FeatureListField,
  ImageListField,
  SpecListField,
  StringListField,
  normalizeFeatures,
  normalizeImages,
  normalizeSpecs,
  normalizeStringList,
} from '../../components/form/ListFields';
import { api, type Product } from '../../lib/api';
import { getApiErrorMessage } from '../../lib/errors';

export function ProductFormPage() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    if (!isNew && id) {
      api.get<Product>(`/admin/products/${id}`).then((r) => {
        const d = r.data;
        form.setFieldsValue({
          ...d,
          images: normalizeImages(d.images),
          features: normalizeFeatures(d.features),
          specs: normalizeSpecs(d.specs),
          useCases: normalizeStringList(d.useCases),
          highlights: normalizeStringList(d.highlights),
          bodyHtml: d.body || '',
        });
      });
    }
  }, [id, isNew, form]);

  const filterStrings = (v: unknown) =>
    Array.isArray(v) ? (v as string[]).map((s) => s.trim()).filter(Boolean) : [];

  const filterImages = (v: unknown) => {
    if (!Array.isArray(v)) return [];
    return (v as { src?: string; label?: string }[])
      .map((item) => ({ src: String(item.src ?? '').trim(), label: String(item.label ?? '').trim() }))
      .filter((item) => item.src);
  };

  const filterFeatures = (v: unknown) => {
    if (!Array.isArray(v)) return [];
    return (v as { title?: string; description?: string; icon?: string }[])
      .map((item) => ({
        title: String(item.title ?? '').trim(),
        description: String(item.description ?? '').trim(),
        icon: String(item.icon ?? 'Zap').trim() || 'Zap',
      }))
      .filter((item) => item.title && item.description);
  };

  const filterSpecs = (v: unknown) => {
    if (!Array.isArray(v)) return [];
    return (v as { key?: string; value?: string }[])
      .map((item) => ({ key: String(item.key ?? '').trim(), value: String(item.value ?? '').trim() }))
      .filter((item) => item.key && item.value);
  };

  const onFinish = async (values: Record<string, unknown>) => {
    const payload = {
      locale: values.locale,
      status: values.status,
      sortOrder: values.sortOrder,
      slug: values.slug,
      name: values.name,
      description: values.description,
      tagline: values.tagline || undefined,
      intro: values.intro || undefined,
      category: values.category,
      icon: values.icon,
      heroImage: values.heroImage || undefined,
      images: filterImages(values.images),
      features: filterFeatures(values.features),
      specs: filterSpecs(values.specs),
      useCases: filterStrings(values.useCases),
      highlights: filterStrings(values.highlights),
      body: String(values.bodyHtml ?? '').trim(),
      hasDetailPage: values.hasDetailPage,
      ctaUrl: values.ctaUrl || undefined,
      ctaLabel: values.ctaLabel || undefined,
      secondaryCtaUrl: values.secondaryCtaUrl || undefined,
      secondaryCtaLabel: values.secondaryCtaLabel || undefined,
      seoTitle: values.seoTitle || undefined,
      seoDescription: values.seoDescription || undefined,
      ogImage: values.ogImage || undefined,
    };

    try {
      if (isNew) await api.post('/admin/products', payload);
      else await api.patch(`/admin/products/${id}`, payload);
      message.success('Saved');
      navigate('/products');
    } catch (err: unknown) {
      message.error(getApiErrorMessage(err, 'Save failed'));
    }
  };

  return (
    <Card title={isNew ? 'New product' : 'Edit product'}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          locale: 'en',
          status: 'draft',
          category: 'software',
          icon: 'Boxes',
          sortOrder: 0,
          hasDetailPage: false,
          images: [],
          features: [],
          specs: [],
          useCases: [''],
          highlights: [''],
          bodyHtml: '',
        }}
      >
        <Space wrap>
          <Form.Item name="locale" label="Locale" rules={[{ required: true }]}>
            <Select style={{ width: 100 }} options={[{ value: 'en' }, { value: 'zh' }]} />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select style={{ width: 120 }} options={[{ value: 'draft' }, { value: 'published' }]} />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select style={{ width: 120 }} options={[{ value: 'software' }, { value: 'hardware' }]} />
          </Form.Item>
          <Form.Item name="sortOrder" label="Sort">
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item name="hasDetailPage" label="Detail page" valuePropName="checked">
            <Switch checkedChildren="Yes" unCheckedChildren="No" />
          </Form.Item>
        </Space>

        <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
          <Input placeholder="nfc-field-detector" />
        </Form.Item>
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Card description" rules={[{ required: true }]}>
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name="tagline" label="Detail tagline">
          <Input />
        </Form.Item>
        <Form.Item name="intro" label="Detail intro">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="icon" label="Icon (Lucide name)">
          <Input placeholder="Terminal, Code2, Cpu…" />
        </Form.Item>
        <Form.Item name="heroImage" label="Hero image URL">
          <Input placeholder="https://… or /uploads/…" />
        </Form.Item>

        <ImageListField name="images" label="Product images" />
        <StringListField name="highlights" label="Hero bullet points" placeholder="Highlight" />
        <FeatureListField name="features" label="Features" />
        <SpecListField name="specs" label="Specifications" />
        <StringListField name="useCases" label="Use cases" placeholder="Use case" />

        <Form.Item name="bodyHtml" label="Extra body (HTML)">
          <RichTextEditor placeholder="Optional extra content…" />
        </Form.Item>

        <Space wrap>
          <Form.Item name="ctaUrl" label="Primary CTA URL">
            <Input placeholder="https://amazon.com/… or leave empty for contact" style={{ width: 320 }} />
          </Form.Item>
          <Form.Item name="ctaLabel" label="Primary CTA label">
            <Input placeholder="Buy on Amazon" style={{ width: 200 }} />
          </Form.Item>
        </Space>
        <Space wrap>
          <Form.Item name="secondaryCtaUrl" label="Secondary CTA URL">
            <Input style={{ width: 320 }} />
          </Form.Item>
          <Form.Item name="secondaryCtaLabel" label="Secondary CTA label">
            <Input placeholder="Request a Quote" style={{ width: 200 }} />
          </Form.Item>
        </Space>

        <Form.Item name="seoTitle" label="SEO title">
          <Input />
        </Form.Item>
        <Form.Item name="seoDescription" label="SEO description">
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name="ogImage" label="OG image URL">
          <Input />
        </Form.Item>

        <Space>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
          <Button onClick={() => navigate('/products')}>Cancel</Button>
        </Space>
      </Form>
    </Card>
  );
}
