// components/Editor.tsx
'use client';
import React, { FC, useMemo } from 'react';
// import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import the styles
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';
interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  title?: string;
}

const Editor: FC<EditorProps> = ({ value, onChange, title }) => {
  const ReactQuill = useMemo(
    () => dynamic(() => import('react-quill'), { ssr: false }),
    []
  );
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote'],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ['clean'],
    ],
  };

  const formats: any[] = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'color',
    'background',
  ];

  return (
    <div className='overflow-hidden rounded-sm border-0  bg-card text-card-foreground '>
      {title && (
        <div className='bg-primary px-4 py-2 text-primary-foreground'>
          <h2 className='text-lg font-normal'>{title}</h2>
        </div>
      )}
      <ReactQuill
        value={value}
        onChange={onChange}
        className='flex h-60 flex-col'
        modules={modules}
        formats={formats}
      />
    </div>
  );
};

export default Editor;
