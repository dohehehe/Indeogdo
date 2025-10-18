'use client';

import * as S from '@/styles/Navigation/navigation.style';
import useTheme from '@/hooks/useTheme';
import useCluster from '@/hooks/useCluster';
import useSites from '@/hooks/useSites';
import { useState, useEffect, useMemo, useCallback } from 'react';

function Navigation() {
  const { themes, loading, error } = useTheme();
  const { clusters, loading: clusterLoading } = useCluster();
  const { fetchSitesByCluster } = useSites();
  const [expandedThemes, setExpandedThemes] = useState(new Set());
  const [selectedClusterIds, setSelectedClusterIds] = useState(new Set());
  const [selectedClusters, setSelectedClusters] = useState([]);
  const [activeClusterIds, setActiveClusterIds] = useState(new Set());
  const [selectedSites, setSelectedSites] = useState([]);
  const [clusterSitesCache, setClusterSitesCache] = useState(new Map());

  // 활성화된 클러스터들의 sites 데이터를 메모이제이션
  const activeSites = useMemo(() => {
    const sites = [];
    for (const clusterId of activeClusterIds) {
      const cachedSites = clusterSitesCache.get(clusterId);
      if (cachedSites) {
        sites.push(...cachedSites);
      }
    }
    return sites;
  }, [activeClusterIds, clusterSitesCache]);

  useEffect(() => {
    if (themes.length > 0) {
      const allThemeIds = new Set(themes.map(theme => theme.id));
      setExpandedThemes(allThemeIds);
    }
  }, [themes]);

  // 활성화된 sites가 변경될 때마다 MapContainer에 전달
  useEffect(() => {
    if (window.onSitesSelected) {
      console.log('Sending active sites to MapContainer:', activeSites);
      console.log('Active cluster IDs:', Array.from(activeClusterIds));
      window.onSitesSelected(activeSites);
    }
  }, [activeSites, activeClusterIds]);

  const handleThemeClick = (theme) => {
    const newExpandedThemes = new Set(expandedThemes);
    if (newExpandedThemes.has(theme.id)) {
      newExpandedThemes.delete(theme.id);
    } else {
      newExpandedThemes.add(theme.id);
    }
    setExpandedThemes(newExpandedThemes);
  };

  const handleClusterClick = async (cluster) => {
    const newSelectedClusterIds = new Set(selectedClusterIds);
    const newSelectedClusters = [...selectedClusters];

    if (newSelectedClusterIds.has(cluster.id)) {
      // 이미 선택된 클러스터라면 선택 해제
      newSelectedClusterIds.delete(cluster.id);
      setSelectedClusters(newSelectedClusters.filter(c => c.id !== cluster.id));
    } else {
      // 선택되지 않은 클러스터라면 선택 추가
      newSelectedClusterIds.add(cluster.id);
      newSelectedClusters.push(cluster);
      setSelectedClusters(newSelectedClusters);
    }

    setSelectedClusterIds(newSelectedClusterIds);

    // 선택된 클러스터들의 sites 데이터 가져오기
    await fetchSelectedSites(newSelectedClusterIds);
  };

  // 개별 클러스터의 sites 데이터 가져오기 (캐시 활용)
  const fetchSitesForCluster = useCallback(async (clusterId) => {
    try {
      console.log(`Fetching sites for cluster ${clusterId}`);
      const sites = await fetchSitesByCluster(clusterId);
      console.log(`Sites for cluster ${clusterId}:`, sites);

      if (sites) {
        // 캐시에 저장
        setClusterSitesCache(prev => new Map(prev).set(clusterId, sites));
      }
    } catch (error) {
      console.error(`Failed to fetch sites for cluster ${clusterId}:`, error);
    }
  }, [fetchSitesByCluster]);

  // 선택된 클러스터들의 sites 데이터 가져오기 (기존 로직 유지)
  const fetchSelectedSites = async (clusterIds) => {
    try {
      console.log('Fetching sites for cluster IDs:', Array.from(clusterIds));
      const allSites = [];

      for (const clusterId of clusterIds) {
        console.log(`Fetching sites for cluster ${clusterId}`);
        const sites = await fetchSitesByCluster(clusterId);
        console.log(`Sites for cluster ${clusterId}:`, sites);
        if (sites) {
          allSites.push(...sites);
        }
      }

      console.log('All selected sites:', allSites);
      setSelectedSites(allSites);

      // 부모 컴포넌트에 선택된 sites 데이터 전달
      if (window.onSitesSelected) {
        console.log('Calling window.onSitesSelected with sites:', allSites);
        window.onSitesSelected(allSites);
      } else {
        console.warn('window.onSitesSelected is not defined');
      }
    } catch (error) {
      console.error('Failed to fetch sites for selected clusters:', error);
    }
  };

  const handleClusterToggle = useCallback(async (clusterId, event) => {
    event.stopPropagation();
    const newActiveClusterIds = new Set(activeClusterIds);

    if (newActiveClusterIds.has(clusterId)) {
      // 클러스터 비활성화
      newActiveClusterIds.delete(clusterId);
      console.log(`Deactivating cluster ${clusterId}`);
    } else {
      // 클러스터 활성화
      newActiveClusterIds.add(clusterId);
      console.log(`Activating cluster ${clusterId}`);

      // 캐시에 없는 경우에만 sites 데이터 가져오기
      if (!clusterSitesCache.has(clusterId)) {
        await fetchSitesForCluster(clusterId);
      }
    }

    setActiveClusterIds(newActiveClusterIds);

    // 즉시 활성화된 sites 업데이트 (비활성화 시 빈 배열 전달)
    const currentActiveSites = [];
    for (const id of newActiveClusterIds) {
      const cachedSites = clusterSitesCache.get(id);
      if (cachedSites) {
        currentActiveSites.push(...cachedSites);
      }
    }

    if (window.onSitesSelected) {
      console.log('Immediately sending updated active sites:', currentActiveSites);
      window.onSitesSelected(currentActiveSites);
    }
  }, [activeClusterIds, clusterSitesCache]);

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