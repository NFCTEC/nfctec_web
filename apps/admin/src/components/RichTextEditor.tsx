import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { PictureOutlined } from '@ant-design/icons';
import { Button, Space, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import './RichTextEditor.css';

type RichTextEditorProps = {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
};

export function RichTextEditor({ value = '', onChange, placeholder }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
    ],
    content: value || '<p></p>',
    editorProps: {
      attributes: {
        class: 'rich-text-editor__content',
        'data-placeholder': placeholder ?? 'Write content…',
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange?.(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || '<p></p>';
    if (current !== next) editor.commands.setContent(next, { emitUpdate: false });
  }, [editor, value]);

  const uploadImage = async (file: File) => {
    if (!editor) return;
    if (!file.type.startsWith('image/')) {
      message.error('Please select an image file');
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post<{ url: string }>('/admin/media/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const alt = file.name.replace(/\.[^.]+$/, '');
      editor.chain().focus().setImage({ src: data.url, alt }).run();
      message.success('Image inserted');
    } catch {
      message.error('Image upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!editor) {
    return <div className="rich-text-editor rich-text-editor--loading">Loading editor…</div>;
  }

  return (
    <div className="rich-text-editor">
      <Space wrap className="rich-text-editor__toolbar">
        <Button size="small" type={editor.isActive('bold') ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </Button>
        <Button size="small" type={editor.isActive('italic') ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </Button>
        <Button size="small" type={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </Button>
        <Button size="small" type={editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </Button>
        <Button size="small" type={editor.isActive('bulletList') ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          List
        </Button>
        <Button size="small" type={editor.isActive('orderedList') ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          Numbered
        </Button>
        <Button size="small" type={editor.isActive('blockquote') ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          Quote
        </Button>
        <Button
          size="small"
          icon={<PictureOutlined />}
          loading={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          Image
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadImage(file);
          }}
        />
      </Space>
      <EditorContent editor={editor} />
    </div>
  );
}
