'use client';

import { useState } from 'react';
import * as S from '@/styles/Navigation/navigation.style';
import ClusterSection from '@/components/Navigation/ClusterSection';

function ThemeSection({
  theme,
  isAdmin,
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleToggleTheme = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <S.ThemeItem>
      <S.ThemeHeader
        onClick={handleToggleTheme}
        $isExpanded={isExpanded}
      >
        <S.ThemeTitle>{theme.title}</S.ThemeTitle>
        <S.ExpandIcon $isExpanded={isExpanded}>
          {isExpanded ? '▲' : '▼'}
        </S.ExpandIcon>
      </S.ThemeHeader>

      <S.ClusterList $isVisible={isExpanded}>
        <ClusterSection
          themeId={theme.id}
          isAdmin={isAdmin}
        />
      </S.ClusterList>
    </S.ThemeItem>
  );
}

export default ThemeSection;


