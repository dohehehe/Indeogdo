'use client';

import styled from '@emotion/styled';
import { memo } from 'react';
import { theme } from '@/styles/Theme';

const EditorArticle = styled.article`
  display: flex;
  // flex-direction: column;
  flex-wrap: wrap;
  margin-top: 50px;
  margin-left: 5px;
  color: black;
  gap: 10px;

  /* .stretched 클래스를 가진 자식을 가진 부모 div 선택 */
  & > div:has(.small) {
    width: calc(50% - 5px);
  }

  & div {
    width: 100%;
  }

  ${theme.media.mobile} {
    margin-left: 0px;
    margin-top: 70px;
  }
`
const EditorPara = styled.p`
  font-weight: 500;
  font-size: 1.25rem;
  line-height: 1.65;
  margin-bottom: 20px;
  color: black;
  word-break: keep-all;
  & b {
    font-weight: 800;
  }

  & mark {
    background: none;
    position: relative;
    display: inline;
    text-decoration: underline dotted 2px black;
    text-underline-position: under;
    text-underline-offset: 4.5px;
    line-height: 2.1;
  }

  ${theme.media.mobile} {
    font-size: 1.25rem;
    line-height: 1.7;
  }
`

const EditorHeader = styled.div`
  margin-bottom: 10px;
  color: black;
  word-break: keep-all;
  line-height: 1.3;

  & h1 {
    font-size: 1.8rem !important;
    font-weight: 800 !important;
    margin: 0;
  }

  & h2 {
    font-size: 1.6rem !important;
    font-weight: 700 !important;
    margin: 0;
  }

  & h3 {
    font-size: 1.4rem !important;
    font-weight: 700 !important;
    margin: 0;
  }

  ${theme.media.mobile} {
    & h1 {
      font-size: 1.7rem !important;
    }

    & h2 {
      font-size: 1.6rem !important;
    }

    & h3 {
      font-size: 1.5rem !important;
    }
  }
`

const EditorImgWrapper = styled.div`
  width: 100%;
  margin-bottom: 20px;
`

const EditorImg = styled.img`
  width: 100%;
  border: 1.4px solid black;

  ${theme.media.mobile} {
    border: 1px solid black;
  }
`
const EditorImgCaption = styled.div`
  margin-top: 6px;
  font-size: 1rem;
  font-weight: 500;
  color: #666;
`

function EditorBoardRender({ item }) {
  return (
    <>
      <EditorArticle>
        {item?.map((block, idx) => (
          <div key={idx}>
            {block.type === 'header' ? (
              <EditorHeader>
                {(() => {
                  const level = block.data.level || 1;
                  const processedText = block.data.text
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/\n/g, '<br />')
                    .replace(/\*/g, '<span class="sticker">*</span>');

                  if (level === 1) {
                    return <h1 dangerouslySetInnerHTML={{ __html: processedText }} />;
                  } else if (level === 2) {
                    return <h2 dangerouslySetInnerHTML={{ __html: processedText }} />;
                  } else if (level === 3) {
                    return <h3 dangerouslySetInnerHTML={{ __html: processedText }} />;
                  } else {
                    return <h1 dangerouslySetInnerHTML={{ __html: processedText }} />;
                  }
                })()}
              </EditorHeader>
            ) : (
              ''
            )}
            {block.type === 'paragraph' ? (
              <>
                <EditorPara dangerouslySetInnerHTML={{ __html: block.data.text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\n/g, '<br />').replace(/\*/g, '<span class="sticker">*</span>') }} />
              </>
            ) : (
              ''
            )}
            {block.type === 'image' ? (
              <EditorImgWrapper
                className={[
                  block.data.stretched && 'stretched',
                  !block.data.stretched && 'small'
                ].filter(Boolean).join(' ')}
              >
                <EditorImg
                  src={block.data.file.url}
                  alt={block.data.caption ? block.data.caption : 'Image'}
                  withBorder={block.data.withBorder}
                />
                {block.data.caption ? (
                  <EditorImgCaption
                    dangerouslySetInnerHTML={{
                      __html: block.data.caption.replace(/\n/g, '<br />'),
                    }}
                  />
                ) : (
                  <></>
                )}
              </EditorImgWrapper>
            ) : (
              <></>
            )}
          </div >
        )
        )
        }
      </EditorArticle >
    </>
  )
}

export default memo(EditorBoardRender);
