'use client';

import styled from '@emotion/styled';
import { memo } from 'react';
import { theme } from '@/styles/Theme';

const EditorArticle = styled.article`
  display: flex;
  flex-direction: column;
  margin-top: 90px;
  margin-left: 5px;

  ${theme.media.mobile} {
    margin-left: 0px;
  }
`
const EditorPara = styled.p`
  font-weight: 500;
  font-size: 1.1rem;
  line-height: 1.5;
  margin-bottom: 30px;
  
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
    font-size: 1.2rem;
    line-height: 1.6;
  }
`

const EditorImgWrapper = styled.div`
  width: 100%;
  margin-bottom: 30px;
`

const EditorImg = styled.img`
  width: 100%;
  border: 2px solid black;

  ${theme.media.mobile} {
    border: 1px solid black;
  }
`
const EditorImgCaption = styled.div`
  margin-top: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #666;
`

function EditorBoardRender({ item }) {
  return (
    <>
      <EditorArticle>
        {item?.map((block, idx) => (
          <div key={idx}>
            {block.type === 'paragraph' ? (
              <>
                <EditorPara dangerouslySetInnerHTML={{ __html: block.data.text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\n/g, '<br />').replace(/\*/g, '<span class="sticker">*</span>') }} />
              </>
            ) : (
              ''
            )}
            {block.type === 'image' ? (
              <EditorImgWrapper>
                <EditorImg src={block.data.file.url} alt={block.data.caption ? block.data.caption : 'Image'} />
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
