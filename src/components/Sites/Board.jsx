'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import * as S from '@/styles/Sites/board.style';

function Board({ children }) {
  const [widthMode, setWidthMode] = useState('normal'); // 'wide', 'normal', 'narrow'
  const pathname = usePathname();
  const router = useRouter();
  const boardRef = useRef(null);

  // 경로가 변경될 때마다 widthMode를 normal로 리셋
  useEffect(() => {
    setWidthMode('normal');
  }, [pathname]);

  // POI 클릭 시 보드를 펼침 (같은 POI 재클릭 포함)
  useEffect(() => {
    const handlePOIClicked = (event) => {
      const isSitesPage = pathname.match(/^\/sites\/(.+)$/);
      if (isSitesPage) {
        // narrow 상태일 때만 normal로 변경
        if (widthMode === 'narrow') {
          setWidthMode('normal');
        }
      }
    };

    window.addEventListener('poiClicked', handlePOIClicked);

    return () => {
      window.removeEventListener('poiClicked', handlePOIClicked);
    };
  }, [pathname, widthMode]);

  // 보드 외부 클릭 시 narrow로 변경
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (widthMode === 'narrow') return;

      if (boardRef.current && !boardRef.current.contains(event.target)) {
        setWidthMode('narrow');
      }
    };

    // 이벤트 리스너 추가
    document.addEventListener('mousedown', handleClickOutside);

    // cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleMobileClick = () => {
    router.push('/');
  };

  return (
    <S.BoardWrapper ref={boardRef} $widthMode={widthMode}>
      <S.BoardButtonWrapper>
        <S.BoardButtonMobile onClick={handleMobileClick}>
          <span></span>
          <span></span>
        </S.BoardButtonMobile>
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
