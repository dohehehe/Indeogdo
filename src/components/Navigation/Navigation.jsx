'use client';

import * as S from '@/styles/Navigation/navigation.style';
import useTheme from '@/hooks/useTheme';
import useMobile from '@/hooks/useMobile';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import ThemeSection from '@/components/Navigation/ThemeSection';
import AddButton from '@/components/admin/AddButton';

function Navigation() {
  const { themes, loading, error, createTheme } = useTheme();
  const isMobile = useMobile();
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAddingTheme, setIsAddingTheme] = useState(false);
  const [newThemeTitle, setNewThemeTitle] = useState('');
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

  const handleStartAddTheme = (e) => {
    e.stopPropagation();
    setIsAddingTheme(true);
    setNewThemeTitle('');
  };

  const handleSaveTheme = async (e) => {
    e?.stopPropagation();
    if (!newThemeTitle.trim()) return;
    try {
      const result = await createTheme(newThemeTitle.trim());
      if (result) {
        setIsAddingTheme(false);
        setNewThemeTitle('');
        alert('테마가 추가되었습니다.');
      } else {
        alert('테마 추가에 실패했습니다.');
      }
    } catch (err) {
      console.error('Create theme error:', err);
      alert('테마 추가 중 오류가 발생했습니다.');
    }
  };

  const handleCancelAddTheme = (e) => {
    e?.stopPropagation();
    setIsAddingTheme(false);
    setNewThemeTitle('');
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
        {isAdmin && (
          <div style={{ marginBottom: '40px', borderTop: '1px solid #e0e0e0', padding: '22px 10px 0px 13px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {isAddingTheme ? (
              <div style={{ display: 'flex', gap: 10, paddingLeft: '4px', alignItems: 'center' }}>
                <S.ClusterTitleInput
                  value={newThemeTitle}
                  onChange={(e) => setNewThemeTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTheme(e);
                    else if (e.key === 'Escape') handleCancelAddTheme(e);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="테마 이름을 입력하세요"
                  autoFocus
                />
                <S.EditActionButtons>
                  <S.SaveButton onClick={handleSaveTheme}>저장</S.SaveButton>
                  <S.CancelButton onClick={handleCancelAddTheme}>취소</S.CancelButton>
                </S.EditActionButtons>
                <S.ExpandIcon >
                  ▲
                </S.ExpandIcon>
              </div>
            ) : (
              <AddButton onClick={handleStartAddTheme} $themeSize={true}>
                <span>+</span>
                <span>테마 추가</span>
              </AddButton>
            )
            }
          </div>
        )}
      </S.NavigationWrapper>
    </>
  );
}

export default Navigation;