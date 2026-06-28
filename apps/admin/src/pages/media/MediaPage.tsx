import { Button, Input, Table, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

type Media = {
  id: string;
  filename: string;
  url: string;
  alt: string | null;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
};

export function MediaPage() {
  const [data, setData] = useState<Media[]>([]);
  const load = () => api.get<Media[]>('/admin/media').then((r) => setData(r.data));
  useEffect(() => {
    load();
  }, []);

  const upload = async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    await api.post('/admin/media/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    message.success('Uploaded');
    load();
    return false;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Media</h2>
        <Upload beforeUpload={upload} showUploadList={false}>
          <Button icon={<UploadOutlined />}>Upload</Button>
        </Upload>
      </div>
      <Table
        rowKey="id"
        dataSource={data}
        columns={[
          { title: 'File', dataIndex: 'filename' },
          { title: 'URL', dataIndex: 'url', render: (url: string) => <a href={url} target="_blank" rel="noreferrer">{url}</a> },
          { title: 'Type', dataIndex: 'mimeType' },
          {
            title: 'Alt',
            dataIndex: 'alt',
            render: (alt, row) => (
              <Input
                defaultValue={alt ?? ''}
                onBlur={async (e) => {
                  await api.patch(`/admin/media/${row.id}`, { alt: e.target.value || null });
                  message.success('Alt updated');
                }}
              />
            ),
          },
          {
            title: '',
            render: (_, row) => (
              <Button type="link" danger onClick={async () => { await api.delete(`/admin/media/${row.id}`); load(); }}>Delete</Button>
            ),
          },
        ]}
      />
    </div>
  );
}
