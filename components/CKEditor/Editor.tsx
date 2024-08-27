import React from 'react';
import { CKEditor } from 'ckeditor4-react';

const CustomEditor = (props: any) => {
  const onChangeHandler = (event: any) => {
    props?.onChange(event.editor.getData());
  };

  return (
    <div className='relative z-50'>
      <div className='bg-primary px-4 py-2 text-primary-foreground'>
        <h2 className='text-lg font-normal'>Letterhead*</h2>
      </div>

      <CKEditor
        initData={props?.initialData}
        onChange={onChangeHandler}
        config={{
          toolbar: [
            {
              name: 'basicstyles',
              items: ['Bold', 'Italic', 'Underline', 'Strike'],
            },
            {
              name: 'paragraph',
              items: [
                'NumberedList',
                'BulletedList',
                '-',
                'Outdent',
                'Indent',
                'Blockquote',
                '-',
                'JustifyLeft',
                'JustifyCenter',
                'JustifyRight',
                'JustifyBlock',
                '-',
                'BidiLtr',
                'BidiRtl',
                'Language',
              ],
            },
            { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },
            // { name: 'colors', items: ['TextColor', 'BGColor'] },
            // { name: 'tools', items: ['Maximize', 'ShowBlocks'] },
          ],
        }}
      />
    </div>
  );
};

export default CustomEditor;
