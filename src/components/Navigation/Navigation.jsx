'use client';

import * as S from '@/styles/Navigation/navigation.style';
import useTheme from '@/hooks/useTheme';
import useMobile from '@/hooks/useMobile';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import ThemeSection from '@/components/Navigation/ThemeSection';

function Navigation() {
  const { themes, loading, error } = useTheme();
  const isMobile = useMobile();
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith('/admin')) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [pathname]);

  const toggleNavigation = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <>
      <S.NavigationWrapper $isMobile={isMobile} $isOpen={isNavOpen} isAdmin={isAdmin}>
        {isMobile && (
          <S.MobileToggleButton onClick={toggleNavigation} $isOpen={isNavOpen}>
            <S.HamburgerIcon $isOpen={isNavOpen}>
              <S.HamburgerIconSpan $isOpen={isNavOpen} />
              <S.HamburgerIconSpan $isOpen={isNavOpen} />
              <S.HamburgerIconSpan $isOpen={isNavOpen} />
            </S.HamburgerIcon>
          </S.MobileToggleButton>
        )}
        <S.ThemeList $isMobile={isMobile} $isOpen={isNavOpen}>
          {themes.length === 0 && !loading ? (
            <S.EmptyText>등록된 테마가 없습니다.</S.EmptyText>
          ) : (
            themes.map((theme) => (
              <ThemeSection
                key={theme.id}
                theme={theme}
                isAdmin={isAdmin}
              />
            ))
          )}
        </S.ThemeList>

      </S.NavigationWrapper>
    </>
  );
}

export default Navigation;