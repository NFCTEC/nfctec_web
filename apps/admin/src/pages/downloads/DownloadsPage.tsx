import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Upload,
  message,
} from 'antd';
import { EditOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useState } from 'react';
import { api, type DownloadGroup } from '../../lib/api';
import { getApiErrorMessage } from '../../lib/errors';

type MediaRow = {
  id: string;
  filename: string;
  url: string;
  sizeBytes: number;
};

type ItemRow = DownloadGroup['items'][number];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DownloadsPage() {
  const [locale, setLocale] = useState<'en' | 'zh'>('en');
  const [groups, setGroups] = useState<DownloadGroup[]>([]);
  const [media, setMedia] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [groupForm] = Form.useForm();
  const [itemForm] = Form.useForm();
  const [itemModal, setItemModal] = useState<{ open: boolean; editing: ItemRow | null; groupId: string | null }>({
    open: false,
    editing: null,
    groupId: null,
  });
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async (loc: 'en' | 'zh') => {
    setLoading(true);
    try {
      const { data } = await api.get<DownloadGroup[]>('/admin/downloads/groups', { params: { locale: loc } });
      setGroups(data);
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Failed to load downloads'));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMedia = useCallback(async () => {
    try {
      const { data } = await api.get<MediaRow[]>('/admin/media');
      setMedia(data);
    } catch {
      /* optional — manual URL still works */
    }
  }, []);

  useEffect(() => {
    void load(locale);
  }, [locale, load]);

  const createGroup = async (values: { name: string; sortOrder?: number }) => {
    try {
      await api.post('/admin/downloads/groups', { locale, name: values.name, sortOrder: values.sortOrder ?? 0 });
      groupForm.resetFields();
      message.success('Group created');
      await load(locale);
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Failed to create group'));
    }
  };

  const deleteGroup = async (id: string) => {
    try {
      await api.delete(`/admin/downloads/groups/${id}`);
      message.success('Group deleted');
      await load(locale);
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Failed to delete group'));
    }
  };

  const openItemModal = (groupId: string, editing: ItemRow | null = null) => {
    setItemModal({ open: true, editing, groupId });
    if (editing) {
      itemForm.setFieldsValue(editing);
    } else {
      itemForm.resetFields();
      itemForm.setFieldsValue({ status: 'published', sortOrder: 0 });
    }
    void loadMedia();
  };

  const closeItemModal = () => {
    setItemModal({ open: false, editing: null, groupId: null });
    itemForm.resetFields();
  };

  const saveItem = async (values: Record<string, unknown>) => {
    const payload = {
      groupId: itemModal.groupId,
      name: values.name,
      version: values.version || undefined,
      fileUrl: values.fileUrl || undefined,
      fileSize: values.fileSize || undefined,
      sortOrder: values.sortOrder ?? 0,
      status: values.status,
    };

    try {
      if (itemModal.editing) {
        await api.patch(`/admin/downloads/items/${itemModal.editing.id}`, payload);
        message.success('Item updated');
      } else {
        await api.post('/admin/downloads/items', payload);
        message.success('Item created');
      }
      closeItemModal();
      await load(locale);
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Save failed'));
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await api.delete(`/admin/downloads/items/${id}`);
      message.success('Item deleted');
      await load(locale);
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Failed to delete item'));
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post<{ url: string; sizeBytes: number; filename: string }>(
        '/admin/media/upload',
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      itemForm.setFieldsValue({ fileUrl: data.url, fileSize: formatBytes(data.sizeBytes) });
      message.success('File uploaded');
      await loadMedia();
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Upload failed'));
    } finally {
      setUploading(false);
    }
    return false;
  };

  const itemColumns = (groupId: string) => [
    { title: 'Name', dataIndex: 'name', ellipsis: true },
    { title: 'Version', dataIndex: 'version', width: 100, render: (v: string | null) => v ?? '—' },
    { title: 'Size', dataIndex: 'fileSize', width: 90, render: (v: string | null) => v ?? '—' },
    {
      title: 'Downloads',
      dataIndex: 'downloadCount',
      width: 100,
      render: (n: number) => (n ?? 0).toLocaleString(),
    },
    {
      title: 'File',
      dataIndex: 'fileUrl',
      ellipsis: true,
      render: (url: string | null) =>
        url ? (
          <a href={url} target="_blank" rel="noreferrer">
            {url.replace(/^https?:\/\/[^/]+/, '')}
          </a>
        ) : (
          <Tag color="warning">No file</Tag>
        ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 100,
      render: (s: string) => <Tag color={s === 'published' ? 'green' : 'default'}>{s}</Tag>,
    },
    { title: 'Sort', dataIndex: 'sortOrder', width: 60 },
    {
      title: '',
      width: 140,
      render: (_: unknown, row: ItemRow) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openItemModal(groupId, row)}>
            Edit
          </Button>
          <Popconfirm title="Delete this item?" onConfirm={() => void deleteItem(row.id)}>
            <Button type="link" size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Downloads</h2>
        <Select
          value={locale}
          onChange={setLocale}
          options={[
            { value: 'en', label: 'English' },
            { value: 'zh', label: '中文' },
          ]}
          style={{ width: 120 }}
        />
      </div>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Alert
          type="info"
          showIcon
          message={`Managing downloads for ${locale === 'zh' ? '中文' : 'English'} (${locale.toUpperCase()})`}
          description="Groups and files are per locale. The website shows groups for the matching language. Add files and set Status to Published so users can download them."
        />
        <Card title={`New group (${locale.toUpperCase()})`} size="small">
          <Form form={groupForm} layout="inline" onFinish={createGroup} initialValues={{ sortOrder: 0 }}>
            <Form.Item name="name" rules={[{ required: true, message: 'Group name required' }]}>
              <Input placeholder="e.g. SDKs, Drivers, Certifications" style={{ width: 280 }} />
            </Form.Item>
            <Form.Item name="sortOrder" label="Sort">
              <InputNumber min={0} />
            </Form.Item>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
              Add group
            </Button>
          </Form>
        </Card>

        {groups.length === 0 && !loading ? (
          <Card>
            <p style={{ margin: 0, color: '#666' }}>
              No download groups for {locale.toUpperCase()} yet. Create a group above, then add files.
            </p>
          </Card>
        ) : (
          groups.map((g) => (
            <Card
              key={g.id}
              title={
                <Space wrap>
                  <span>{g.name}</span>
                  <Tag>{g.items.length} items</Tag>
                  {g.items.filter((i) => i.status === 'published').length === 0 && (
                    <Tag color="warning">No published files yet</Tag>
                  )}
                </Space>
              }
              extra={
                <Space>
                  <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => openItemModal(g.id)}>
                    Add file
                  </Button>
                  <Popconfirm
                    title="Delete group and all its files?"
                    onConfirm={() => void deleteGroup(g.id)}
                  >
                    <Button size="small" danger>
                      Delete group
                    </Button>
                  </Popconfirm>
                </Space>
              }
            >
              <Table
                rowKey="id"
                size="small"
                pagination={false}
                loading={loading}
                dataSource={g.items}
                columns={itemColumns(g.id)}
                locale={{ emptyText: 'No files — click Add file' }}
              />
            </Card>
          ))
        )}
      </Space>

      <Modal
        title={itemModal.editing ? 'Edit download' : 'Add download'}
        open={itemModal.open}
        onCancel={closeItemModal}
        footer={null}
        destroyOnClose
        width={560}
      >
        <Form form={itemForm} layout="vertical" onFinish={saveItem}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. NFC Reader SDK v2.1" />
          </Form.Item>
          <Space wrap style={{ width: '100%' }}>
            <Form.Item name="version" label="Version">
              <Input placeholder="2.1.0" style={{ width: 140 }} />
            </Form.Item>
            <Form.Item name="fileSize" label="Size">
              <Input placeholder="12.4 MB" style={{ width: 120 }} />
            </Form.Item>
            <Form.Item name="sortOrder" label="Sort">
              <InputNumber min={0} style={{ width: 80 }} />
            </Form.Item>
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Select
                style={{ width: 120 }}
                options={[
                  { value: 'published', label: 'Published' },
                  { value: 'draft', label: 'Draft' },
                ]}
              />
            </Form.Item>
          </Space>

          <Form.Item name="fileUrl" label="File URL" extra="Upload a file or pick from media library">
            <Input placeholder="/uploads/… or https://…" />
          </Form.Item>

          <Space wrap style={{ marginBottom: 16 }}>
            <Upload beforeUpload={uploadFile} showUploadList={false} accept=".pdf,.zip,.tar,.gz,.7z,.doc,.docx,.xls,.xlsx,.txt,.bin,.hex,.apk,.dmg,.exe,.msi">
              <Button icon={<UploadOutlined />} loading={uploading}>
                Upload file
              </Button>
            </Upload>
            <Select
              placeholder="Pick from media library"
              style={{ width: 260 }}
              allowClear
              showSearch
              optionFilterProp="label"
              options={media.map((m) => ({
                value: m.url,
                label: `${m.filename} (${formatBytes(m.sizeBytes)})`,
              }))}
              onChange={(url) => {
                if (!url) return;
                const row = media.find((m) => m.url === url);
                itemForm.setFieldsValue({
                  fileUrl: url,
                  fileSize: row ? formatBytes(row.sizeBytes) : itemForm.getFieldValue('fileSize'),
                });
              }}
            />
          </Space>

          <Space>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
            <Button onClick={closeItemModal}>Cancel</Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
