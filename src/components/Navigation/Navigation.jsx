'use client';

import * as S from '@/styles/Navigation/navigation.style';
import useTheme from '@/hooks/useTheme';
import useMobile from '@/hooks/useMobile';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import ThemeSection from '@/components/Navigation/ThemeSection';
import AddButton from '@/components/admin/AddButton';
import EditButton from '@/components/admin/EditButton';

function Navigation() {
  const { themes, loading, error, createTheme, updateTheme, fetchThemes } = useTheme();
  const isMobile = useMobile();
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAddingTheme, setIsAddingTheme] = useState(false);
  const [newThemeTitle, setNewThemeTitle] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const [localThemes, setLocalThemes] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
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

  // 순서 변경 모드일 때 로컬 상태로 themes 관리
  useEffect(() => {
    if (isOrdering) {
      setLocalThemes([...themes]);
    }
  }, [isOrdering, themes]);

  // 기본적으로는 themes 사용, 순서 변경 모드일 때는 localThemes 사용
  const displayThemes = isOrdering ? localThemes : themes;

  const handleOrder = (e) => {
    e?.stopPropagation();
    setIsOrdering(prev => !prev);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    setLocalThemes(prev => {
      const newThemes = [...prev];
      [newThemes[index - 1], newThemes[index]] = [newThemes[index], newThemes[index - 1]];
      return newThemes;
    });
  };

  const handleMoveDown = (index) => {
    if (index === localThemes.length - 1) return;
    setLocalThemes(prev => {
      const newThemes = [...prev];
      [newThemes[index], newThemes[index + 1]] = [newThemes[index + 1], newThemes[index]];
      return newThemes;
    });
  };

  const handleSaveOrder = async () => {
    setIsSaving(true);
    try {
      // 모든 theme를 순서대로 업데이트 (1, 2, 3, 4...)
      // 기존 데이터는 유지하고 order만 업데이트
      const updatePromises = localThemes.map((theme, index) =>
        updateTheme(theme.id, theme.title, index + 1)
      );

      await Promise.all(updatePromises);

      // 데이터 새로고침 - 전체 themes 목록 다시 가져오기
      await fetchThemes();

      alert('순서가 저장되었습니다.');
      setIsOrdering(false);
    } catch (err) {
      console.error('Save order error:', err);
      alert('순서 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelOrder = () => {
    // 원래 순서로 복원
    setLocalThemes([...themes]);
    setIsOrdering(false);
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
        {isAdmin && !isOrdering && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginLeft: 'auto', marginRight: '18px', marginTop: '5px', marginBottom: '16px', transform: 'scale(1.2)' }}>
            <EditButton onOrder={handleOrder} themeOrder={true} text="테마" />
          </div>
        )}
        {isOrdering && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginLeft: 'auto', marginRight: '18px', marginTop: '5px', marginBottom: '16px' }}>
            <S.SaveButton onClick={handleSaveOrder} disabled={isSaving}>
              {isSaving ? '저장 중...' : '순서 저장'}
            </S.SaveButton>
            <S.CancelButton onClick={handleCancelOrder} disabled={isSaving}>
              취소
            </S.CancelButton>
          </div>
        )}
        <S.ThemeList $isMobile={isMobile} $isOpen={isNavOpen}>
          {displayThemes.length === 0 && !loading ? (
            <S.EmptyText>등록된 테마가 없습니다.</S.EmptyText>
          ) : (
            displayThemes.map((theme, index) => (
              isOrdering ? (
                <S.ThemeItem key={theme.id}>
                  <S.ThemeHeader $isExpanded={false}>
                    <S.ThemeTitle>{theme.title}</S.ThemeTitle>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <S.OrderButton
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                      >
                        ↑
                      </S.OrderButton>
                      <S.OrderButton
                        onClick={() => handleMoveDown(index)}
                        disabled={index === displayThemes.length - 1}
                      >
                        ↓
                      </S.OrderButton>
                    </div>
                  </S.ThemeHeader>
                </S.ThemeItem>
              ) : (
                <ThemeSection
                  key={theme.id}
                  theme={theme}
                  isAdmin={isAdmin}
                />
              )
            ))
          )}
        </S.ThemeList>
        {isAdmin && !isOrdering && (
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