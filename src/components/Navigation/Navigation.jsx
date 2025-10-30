'use client';

import * as S from '@/styles/Navigation/navigation.style';
import useTheme from '@/hooks/useTheme';
import useCluster from '@/hooks/useCluster';
import useSites from '@/hooks/useSites';
import useMobile from '@/hooks/useMobile';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import EditButton from '@/components/admin/EditButton';
import AddButton from '@/components/admin/AddButton';

function Navigation() {
  const { themes, loading, error } = useTheme();
  const { clusters, loading: clusterLoading, deleteCluster, updateCluster, createCluster } = useCluster();
  const { fetchSitesByCluster, deleteSite } = useSites();
  const isMobile = useMobile();
  const [expandedThemes, setExpandedThemes] = useState(new Set());
  const [activeClusterIds, setActiveClusterIds] = useState(new Set());
  const [clusterSitesCache, setClusterSitesCache] = useState(new Map());
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingClusterId, setEditingClusterId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [addingThemeId, setAddingThemeId] = useState(null);
  const [newClusterTitle, setNewClusterTitle] = useState('');
  const [clusterSites, setClusterSites] = useState(new Map()); // 각 cluster의 sites 데이터
  const router = useRouter(); // 라우터 인스턴스 생성
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith('/admin')) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [pathname]);

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

  const toggleNavigation = () => {
    setIsNavOpen(!isNavOpen);
  };

  // Cluster 관리 핸들러 함수들
  const handleEditCluster = (cluster) => {
    console.log('Edit cluster:', cluster);
    setEditingClusterId(cluster.id);
    setEditingTitle(cluster.title);
  };

  const handleSaveEdit = async () => {
    if (!editingClusterId || !editingTitle.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    try {
      const result = await updateCluster(editingClusterId, editingTitle.trim());

      if (result) {
        alert('클러스터가 성공적으로 수정되었습니다.');
        setEditingClusterId(null);
        setEditingTitle('');
      } else {
        alert('클러스터 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Update cluster error:', error);
      alert('클러스터 수정 중 오류가 발생했습니다.');
    }
  };

  const handleCancelEdit = () => {
    setEditingClusterId(null);
    setEditingTitle('');
  };

  const handleStartAddCluster = (themeId) => {
    setAddingThemeId(themeId);
    setNewClusterTitle('');
  };

  const handleCreateCluster = async () => {
    if (!addingThemeId || !newClusterTitle.trim()) return;
    try {
      const result = await createCluster(newClusterTitle.trim(), addingThemeId);
      if (result) {
        setNewClusterTitle('');
        setAddingThemeId(null);
        alert('클러스터가 생성되었습니다.');
      } else {
        alert('클러스터 생성에 실패했습니다.');
      }
    } catch (e) {
      console.error('Create cluster error:', e);
      alert('클러스터 생성 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteCluster = async (cluster) => {
    console.log('Delete cluster:', cluster);

    // 삭제 확인
    if (confirm(`"${cluster.title}" 클러스터를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      try {
        const result = await deleteCluster(cluster.id);

        if (result) {
          // 삭제 성공 시 UI 상태 업데이트
          setActiveClusterIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(cluster.id);
            return newSet;
          });

          // 캐시에서도 제거
          setClusterSitesCache(prev => {
            const newMap = new Map(prev);
            newMap.delete(cluster.id);
            return newMap;
          });

          alert('클러스터가 성공적으로 삭제되었습니다.');
        } else {
          alert('클러스터 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('Delete cluster error:', error);
        alert('클러스터 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleEditSite = (site) => {
    router.push(`/admin/sites/${site.id}/edit`);
  };

  const handleDeleteSite = async (site) => {
    if (!site) return;
    if (!confirm(`"${site.title}" 사이트를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) return;

    try {
      const result = await deleteSite(site.id);
      if (result) {
        // Admin 목록 상태에서 제거
        setClusterSites(prev => {
          const newMap = new Map(prev);
          const list = newMap.get(site.cluster_id) || [];
          newMap.set(site.cluster_id, list.filter(s => s.id !== site.id));
          return newMap;
        });

        // 활성화된 캐시에서도 제거 (맵 연동용)
        setClusterSitesCache(prev => {
          const newMap = new Map(prev);
          if (newMap.has(site.cluster_id)) {
            const list = newMap.get(site.cluster_id) || [];
            newMap.set(site.cluster_id, list.filter(s => s.id !== site.id));
          }
          return newMap;
        });

        alert('사이트가 성공적으로 삭제되었습니다.');
      } else {
        alert('사이트 삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('Delete site error:', err);
      alert('사이트 삭제 중 오류가 발생했습니다.');
    }
  };

  // 개별 클러스터의 sites 데이터 가져오기 (캐시 활용)
  const fetchSitesForCluster = useCallback(async (clusterId) => {
    try {
      const sites = await fetchSitesByCluster(clusterId);

      if (sites) {
        // 캐시에 저장
        setClusterSitesCache(prev => new Map(prev).set(clusterId, sites));
      }
    } catch (error) {
      console.error(`Failed to fetch sites for cluster ${clusterId}:`, error);
    }
  }, [fetchSitesByCluster]);

  // Admin 모드에서 각 cluster의 sites 데이터 가져오기
  const fetchSitesForAdmin = useCallback(async (clusterId) => {
    try {
      const sites = await fetchSitesByCluster(clusterId);
      if (sites) {
        setClusterSites(prev => new Map(prev).set(clusterId, sites));
      }
    } catch (error) {
      console.error(`Failed to fetch sites for admin cluster ${clusterId}:`, error);
    }
  }, [fetchSitesByCluster]);

  // Admin 모드일 때 모든 cluster의 sites 데이터 가져오기
  useEffect(() => {
    if (isAdmin && clusters.length > 0) {
      clusters.forEach(cluster => {
        if (!clusterSites.has(cluster.id)) {
          fetchSitesForAdmin(cluster.id);
        }
      });
    }
  }, [isAdmin, clusters, clusterSites, fetchSitesForAdmin]);


  const handleClusterToggle = useCallback(async (clusterId, event) => {
    event.stopPropagation();
    const newActiveClusterIds = new Set(activeClusterIds);

    if (newActiveClusterIds.has(clusterId)) {
      // 클러스터 비활성화
      newActiveClusterIds.delete(clusterId);
    } else {
      // 클러스터 활성화
      newActiveClusterIds.add(clusterId);

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
      window.onSitesSelected(currentActiveSites);
    }
  }, [activeClusterIds, clusterSitesCache]);

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
                      {isExpanded ? '▲' : '▼'}
                    </S.ExpandIcon>
                  </S.ThemeHeader>

                  <S.ClusterList $isVisible={isExpanded}>
                    {isAdmin && (
                      <>
                        <AddButton onClick={(e) => { e.stopPropagation(); handleStartAddCluster(theme.id); }} />
                        {addingThemeId === theme.id && (
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                            <S.ClusterTitleInput
                              value={newClusterTitle}
                              placeholder="새 클러스터 이름"
                              onChange={(e) => setNewClusterTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCreateCluster();
                                if (e.key === 'Escape') { setAddingThemeId(null); setNewClusterTitle(''); }
                              }}
                              autoFocus
                            />
                            <S.SaveButton onClick={handleCreateCluster}>추가</S.SaveButton>
                            <S.CancelButton onClick={() => { setAddingThemeId(null); setNewClusterTitle(''); }}>취소</S.CancelButton>
                          </div>
                        )}
                      </>
                    )}
                    {themeClusters.length === 0 && !clusterLoading ? (
                      <S.EmptyText>등록된 클러스터가 없습니다.</S.EmptyText>
                    ) : (
                      themeClusters.map((cluster) => {
                        const clusterSitesList = clusterSites.get(cluster.id) || [];

                        return (
                          <S.ClusterContainer key={cluster.id}>
                            <S.ClusterItem
                              $isActive={activeClusterIds.has(cluster.id)}
                              onClick={(e) => handleClusterToggle(cluster.id, e)}
                            >
                              <S.ToggleSwitch
                                $isActive={activeClusterIds.has(cluster.id)}
                              >
                                <S.ToggleSlider $isActive={activeClusterIds.has(cluster.id)} />
                              </S.ToggleSwitch>
                              {editingClusterId === cluster.id ? (
                                <S.ClusterTitleInput
                                  value={editingTitle}
                                  onChange={(e) => setEditingTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSaveEdit();
                                    } else if (e.key === 'Escape') {
                                      handleCancelEdit();
                                    }
                                  }}
                                  autoFocus
                                />
                              ) : (
                                <S.ClusterTitle>{cluster.title}</S.ClusterTitle>
                              )}
                              {isAdmin && (
                                editingClusterId === cluster.id ? (
                                  <S.EditActionButtons>
                                    <S.SaveButton onClick={handleSaveEdit}>저장</S.SaveButton>
                                    <S.CancelButton onClick={handleCancelEdit}>취소</S.CancelButton>
                                  </S.EditActionButtons>
                                ) : (
                                  <EditButton
                                    onEdit={() => handleEditCluster(cluster)}
                                    onDelete={() => handleDeleteCluster(cluster)}
                                  />
                                )
                              )}
                            </S.ClusterItem>

                            {/* Admin 모드일 때만 site 목록 표시 */}
                            {isAdmin && clusterSitesList.length > 0 && (
                              <S.SiteList>
                                {clusterSitesList.map((site) => (
                                  <S.SiteItem key={site.id}>
                                    <S.SiteIcon src={site.icon?.img} alt={site.title} />
                                    <S.SiteTitle>{site.title}</S.SiteTitle>
                                    <EditButton
                                      onEdit={() => handleEditSite(site)}
                                      onDelete={() => handleDeleteSite(site)}
                                    />
                                  </S.SiteItem>
                                ))}

                              </S.SiteList>
                            )}
                          </S.ClusterContainer>
                        );
                      })
                    )}
                  </S.ClusterList>
                </S.ThemeItem>
              );
            })
          )}
        </S.ThemeList>

      </S.NavigationWrapper>
    </>
  );
}

export default Navigation;