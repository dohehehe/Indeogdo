'use client';

import { useState, useMemo } from 'react';
import * as S from '@/styles/Navigation/navigation.style';
import AddButton from '@/components/admin/AddButton';
import ClusterItem from '@/components/Navigation/ClusterItem';
import useCluster from '@/hooks/useCluster';
import { useSyncSitesToMap } from '@/stores/clusterSitesStore';

function ClusterSection({
  themeId,
  isAdmin,
}) {
  const { clusters, loading: clusterLoading, createCluster } = useCluster();
  const [isAdding, setIsAdding] = useState(false);
  const [newClusterTitle, setNewClusterTitle] = useState('');

  // 전역 store의 sites 변경을 지도에 동기화
  useSyncSitesToMap();

  // 현재 themeId에 해당하는 clusters 필터링
  const themeClusters = useMemo(() => {
    return clusters.filter(cluster => cluster.theme_id === themeId);
  }, [clusters, themeId]);

  const handleStartAddCluster = () => {
    setIsAdding(true);
    setNewClusterTitle('');
  };

  const handleCreateCluster = async () => {
    if (!themeId || !newClusterTitle.trim()) return;
    try {
      const result = await createCluster(newClusterTitle.trim(), themeId);
      if (result) {
        setNewClusterTitle('');
        setIsAdding(false);
        alert('클러스터가 생성되었습니다.');
      } else {
        alert('클러스터 생성에 실패했습니다.');
      }
    } catch (e) {
      console.error('Create cluster error:', e);
      alert('클러스터 생성 중 오류가 발생했습니다.');
    }
  };


  return (
    <>
      {isAdmin && (
        <>
          <AddButton onClick={(e) => { e.stopPropagation(); handleStartAddCluster(); }}>
            <span>+</span>
            <span>추가하기</span>
          </AddButton>
          {isAdding && (
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', margin: '6px 4px 6px 0px' }}>
              <S.ToggleSwitch $isActive={isAdding}>
                <S.ToggleSlider $isActive={isAdding} />
              </S.ToggleSwitch>

              <S.ClusterTitleInput
                value={newClusterTitle}
                placeholder="새 클러스터 이름"
                onChange={(e) => setNewClusterTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateCluster();
                  if (e.key === 'Escape') {
                    setNewClusterTitle('');
                    setIsAdding(false);
                  }
                }}
                autoFocus
              />
              <S.EditActionButtons>
                <S.SaveButton onClick={handleCreateCluster}>추가</S.SaveButton>
                <S.CancelButton onClick={() => { setNewClusterTitle(''); setIsAdding(false); }}>취소</S.CancelButton>
              </S.EditActionButtons>
            </div>
          )}
        </>
      )}
      {themeClusters.length === 0 && !clusterLoading ? (
        <S.EmptyText>등록된 클러스터가 없습니다.</S.EmptyText>
      ) : (
        themeClusters.map((cluster) => (
          <ClusterItem
            key={cluster.id}
            cluster={cluster}
            isAdmin={isAdmin}
            themeId={themeId}
          />
        ))
      )}
    </>
  );
}

export default ClusterSection;


