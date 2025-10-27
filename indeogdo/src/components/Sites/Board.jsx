'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import * as S from '@/styles/Sites/board.style';

function Board({ children }) {
  const [widthMode, setWidthMode] = useState('normal'); // 'wide', 'normal', 'narrow'
  const pathname = usePathname();

  // 경로가 변경될 때마다 widthMode를 normal로 리셋
  useEffect(() => {
    setWidthMode('normal');
  }, [pathname]);

  const expandWidth = () => {
    if (widthMode === 'narrow') {
      setWidthMode('normal');
    } else if (widthMode === 'normal') {
      setWidthMode('wide');
    }
  };

  const collapseWidth = () => {
    if (widthMode === 'wide') {
      setWidthMode('normal');
    } else if (widthMode === 'normal') {
      setWidthMode('narrow');
    }
  };

  return (
    <S.BoardWrapper $widthMode={widthMode}>
      <S.BoardButtonWrapper>
        <S.BoardButton
          onClick={expandWidth}
          $disabled={widthMode === 'wide'}
          $widthMode={'wide'}
          title="확장"
        >
          &lt;
        </S.BoardButton>
        <S.BoardButton
          onClick={collapseWidth}
          $disabled={widthMode === 'narrow'}
          $widthMode={'narrow'}
          title="축소"
        >
          &gt;
        </S.BoardButton>
      </S.BoardButtonWrapper>
      {children}
    </S.BoardWrapper>
  );
}

export default Board;
