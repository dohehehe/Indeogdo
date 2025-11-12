"use client";

import { useEffect, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { useImageUpload } from '@/hooks/useImageUpload';

const EditorWrapper = styled.div`
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background: white;
  margin-bottom: 20px;
  font-size: 1.25rem;
  line-height: 1.65;
  font-weight: 500;

  & h1 {
    font-size: 1.8rem !important;
    font-weight: 700 !important;
  }

  & h2 {
    font-size: 1.6rem !important;
    font-weight: 700 !important;
  }

  & h3 {
    font-size: 1.5rem !important;
  }
`;

const Editor = forwardRef(({ data }, ref) => {
  const editorInstanceRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  const { uploadImageToServer } = useImageUpload({
    bucket: 'gallery',
    maxSizeInMB: 0.5
  });

  useImperativeHandle(ref, () => ({
    save: async () => {
      if (editorInstanceRef.current) {
        return await editorInstanceRef.current.save();
      }
      throw new Error('Editor is not ready');
    },
    isReady: () => {
      return editorInstanceRef.current !== null;
    }
  }));

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return;

    let editor = null;

    const initEditor = async () => {
      try {
        // DOM 요소가 존재하는지 확인
        const holder = document.getElementById('editorjs');
        if (!holder) {
          console.error('Editor holder not found');
          return;
        }

        // 동적 import로 EditorJS, Header, ImageTool 로드
        const [{ default: EditorJS }, { default: Header }, { default: ImageTool }] = await Promise.all([
          import('@editorjs/editorjs'),
          import('@editorjs/header'),
          import('@editorjs/image')
        ]);

        editor = new EditorJS({
          holder: 'editorjs',
          placeholder: '내용을 입력하세요...',
          tools: {
            header: {
              class: Header,
              shortcut: 'CMD+SHIFT+H',
              config: {
                placeholder: '제목을 입력하세요',
                levels: [1, 2, 3],
                defaultLevel: 1
              }
            },
            image: {
              class: ImageTool,
              config: {
                captionPlaceholder: '이미지 설명을 입력하세요',
                buttonContent: '이미지 선택',
                uploader: {
                  uploadByFile: async (file) => {
                    try {
                      const result = await uploadImageToServer(file);
                      if (result?.success && result?.file?.url) {
                        return {
                          success: 1,
                          file: { url: result.file.url }
                        };
                      }
                      return { success: 0, error: result?.error || '업로드 실패' };
                    } catch (error) {
                      console.error('Editor 이미지 업로드 에러:', error);
                      return { success: 0, error: error.message };
                    }
                  }
                }
              }
            },
          },
          inlineToolbar: ['link', 'bold', 'italic'],
          data: data || { blocks: [] },
        });

        await editor.isReady;
        editorInstanceRef.current = editor;
      } catch (error) {
        console.error('Editor initialization failed:', error);
      }
    };

    // 약간의 지연을 두고 초기화
    const timer = setTimeout(initEditor, 100);

    return () => {
      clearTimeout(timer);
      if (editorInstanceRef.current && typeof editorInstanceRef.current.destroy === 'function') {
        try {
          editorInstanceRef.current.destroy();
        } catch (error) {
          console.warn('Editor destroy failed:', error);
        }
        editorInstanceRef.current = null;
      }
    };
  }, [isMounted, data]);

  if (!isMounted) {
    return (
      <EditorWrapper>
        <div
          style={{
            minHeight: '300px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666'
          }}
        >
          에디터를 로딩 중...
        </div>
      </EditorWrapper>
    );
  }

  return (
    <EditorWrapper>
      <div
        id="editorjs"
        style={{
          minHeight: '300px',
          padding: '20px'
        }}
      />
    </EditorWrapper>
  );
});

Editor.displayName = 'Editor';

export default Editor;
