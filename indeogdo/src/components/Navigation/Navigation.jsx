'use client';

import * as S from '@/styles/Navigation/navigation.style';
import useTheme from '@/hooks/useTheme';
import useCluster from '@/hooks/useCluster';
import { useState, useEffect } from 'react';

function Navigation() {
  const { themes, loading, error } = useTheme();
  const { clusters, loading: clusterLoading } = useCluster();
  const [expandedThemes, setExpandedThemes] = useState(new Set());
  const [selectedClusterIds, setSelectedClusterIds] = useState(new Set());
  const [selectedClusters, setSelectedClusters] = useState([]);
  const [activeClusterIds, setActiveClusterIds] = useState(new Set());

  useEffect(() => {
    if (themes.length > 0) {
      const allThemeIds = new Set(themes.map(theme => theme.id));
      setExpandedThemes(allThemeIds);
    }
  }, [themes]);

  const handleThemeClick = (theme) => {
    const newExpandedThemes = new Set(expandedThemes);
    if (newExpandedThemes.has(theme.id)) {
      newExpandedThemes.delete(theme.id);
    } else {
      newExpandedThemes.add(theme.id);
    }
    setExpandedThemes(newExpandedThemes);
  };

  const handleClusterClick = (cluster) => {
    const newSelectedClusterIds = new Set(selectedClusterIds);
    const newSelectedClusters = [...selectedClusters];

    if (newSelectedClusterIds.has(cluster.id)) {
      newSelectedClusterIds.delete(cluster.id);
      setSelectedClusters(newSelectedClusters.filter(c => c.id !== cluster.id));
    } else {
      newSelectedClusterIds.add(cluster.id);
      newSelectedClusters.push(cluster);
      setSelectedClusters(newSelectedClusters);
    }

    setSelectedClusterIds(newSelectedClusterIds);
  };

  const handleClusterToggle = (clusterId, event) => {
    event.stopPropagation();
    const newActiveClusterIds = new Set(activeClusterIds);

    if (newActiveClusterIds.has(clusterId)) {
      newActiveClusterIds.delete(clusterId);
    } else {
      newActiveClusterIds.add(clusterId);
    }

    setActiveClusterIds(newActiveClusterIds);
  };

  return (
    <S.NavigationWrapper>
      <S.ThemeList>
        {themes.length === 0 && !loading ? (
          <S.EmptyText>등록된 테마가 없습니다.</S.EmptyText>
        ) : (
          themes.map((theme) => {
            const themeClusters = clusters.filter(cluster => cluster.theme_id === theme.id);
            const isExpanded = expandedThemes.has(theme.id);

            return (
              <S.ThemeItem key={theme.id}>
                <S.ThemeHeader
                  onClick={() => handleThemeClick(theme)}
                  $isExpanded={isExpanded}
                >
                  <S.ThemeTitle>{theme.title}</S.ThemeTitle>
                  <S.ExpandIcon $isExpanded={isExpanded}>
                    {isExpanded ? '▼' : '▶'}
                  </S.ExpandIcon>
                </S.ThemeHeader>

                <S.ClusterList $isVisible={isExpanded}>
                  {themeClusters.length === 0 && !clusterLoading ? (
                    <S.EmptyText>등록된 클러스터가 없습니다.</S.EmptyText>
                  ) : (
                    themeClusters.map((cluster) => (
                      <S.ClusterItem
                        key={cluster.id}
                        onClick={() => handleClusterClick(cluster)}
                        $isSelected={selectedClusterIds.has(cluster.id)}
                        $isActive={activeClusterIds.has(cluster.id)}
                      >
                        <S.ToggleSwitch
                          onClick={(e) => handleClusterToggle(cluster.id, e)}
                          $isActive={activeClusterIds.has(cluster.id)}
                        >
                          <S.ToggleSlider $isActive={activeClusterIds.has(cluster.id)} />
                        </S.ToggleSwitch>
                        <S.ClusterTitle>{cluster.title}</S.ClusterTitle>

                      </S.ClusterItem>
                    ))
                  )}
                </S.ClusterList>
              </S.ThemeItem>
            );
          })
        )}
      </S.ThemeList>

    </S.NavigationWrapper>
  );
}

export default Navigation;