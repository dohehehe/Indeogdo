'use client';

import { useRef } from 'react';
import * as S from '@/styles/Sites/board.style';
import EditorBoardRender from '@/components/Sites/EditorBoardRender';

function BoardContainer({ siteData }) {
  const boardDetailRef = useRef(null);

  const scrollToTop = () => {
    if (boardDetailRef.current) {
      boardDetailRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <S.BoardDetailWrapper ref={boardDetailRef}>
        <S.BoardClusterWrapper>
          <S.BoardClusterIcon src={siteData?.icon?.img} alt={siteData?.icon?.name} />
          <S.BoardClusterTitle>{siteData?.cluster?.title}</S.BoardClusterTitle>
        </S.BoardClusterWrapper>
        <S.BoardTitle>{siteData?.title}</S.BoardTitle>
        {siteData?.addresses && siteData.addresses.length > 0 && (
          <S.BoardAddress>
            {siteData.addresses.map((addr, index) => (
              <div key={addr.id || index}>{addr.name}</div>
            ))}
          </S.BoardAddress>
        )}
        <EditorBoardRender item={siteData?.contents} />
      </S.BoardDetailWrapper>
      <S.ScrollToTopButton onClick={scrollToTop} title="위로 가기">
        ↑
      </S.ScrollToTopButton>
    </>
  );
}

export default BoardContainer;