'use client';

import { useState, useEffect } from 'react';
import * as S from '@/styles/Navigation/navigation.style';
import EditButton from '@/components/admin/EditButton';
import SiteSection from '@/components/Navigation/SiteSection';
import useSites from '@/hooks/useSites';
import useCluster from '@/hooks/useCluster';
import useClusterSitesStore from '@/stores/clusterSitesStore';
import AddButton from '@/components/admin/AddButton';
import { useRouter } from 'next/navigation';

function ClusterItem({ cluster, isAdmin, themeId }) {
  const { fetchSitesByCluster } = useSites();
  const { updateCluster, deleteCluster } = useCluster();
  const setClusterSites = useClusterSitesStore((state) => state.setClusterSites);
  const removeClusterSites = useClusterSitesStore((state) => state.removeClusterSites);
  const [isActive, setIsActive] = useState(false);
  const [sites, setSites] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const router = useRouter();

  // 클러스터 활성화 시 sites 가져오기
  useEffect(() => {
    if (isActive) {
      if (sites.length === 0) {
        const loadSites = async () => {
          const fetchedSites = await fetchSitesByCluster(cluster.id);
          if (fetchedSites) {
            setSites(fetchedSites);
            // 전역 store에 sites 업데이트
            setClusterSites(cluster.id, fetchedSites);
          }
        };
        loadSites();
      } else {
        // 이미 sites가 있으면 바로 전역 store에 업데이트
        setClusterSites(cluster.id, sites);
      }
    } else {
      // 비활성화 시 전역 store에서 제거
      removeClusterSites(cluster.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, cluster.id]);

  // sites가 변경되면 전역 store 업데이트 (활성화 상태일 때만)
  useEffect(() => {
    if (isActive && sites.length > 0) {
      setClusterSites(cluster.id, sites);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sites]);

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsActive(prev => !prev);
  };

  const handleStartEdit = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditingTitle(cluster.title);
  };

  const handleSaveEdit = async (e) => {
    e?.stopPropagation();
    if (!editingTitle.trim()) return;
    try {
      const result = await updateCluster(cluster.id, editingTitle.trim(), themeId);
      if (result) {
        setIsEditing(false);
        setEditingTitle('');
        alert(`"${cluster.title}" 주제 이름이 수정되었습니다.`);
      } else {
        alert(`"${cluster.title}" 주제 이름 수정에 실패했습니다.`);
      }
    } catch (err) {
      console.error('Update subject error:', err);
      alert(`"${cluster.title}" 주제 이름 수정 중 오류가 발생했습니다.`);
    }
  };

  const handleCancelEdit = (e) => {
    e?.stopPropagation();
    setIsEditing(false);
    setEditingTitle('');
  };

  const handleDelete = async (e) => {
    e?.stopPropagation();
    if (!confirm(`"${cluster.title}" 주제를 삭제하시겠습니까?\n\n**주의**\n아래에 포함된 장소들도 함께 삭제됩니다. \n장소를 다른 주제에 옮기고 수행해주세요\n\n이 작업은 되돌릴 수 없습니다.`)) return;
    try {
      const result = await deleteCluster(cluster.id);
      if (result) {
        alert(`"${cluster.title}" 주제가 삭제되었습니다.`);
      } else {
        alert(`"${cluster.title}" 주제 삭제에 실패했습니다.`);
      }
    } catch (err) {
      console.error('Delete subject error:', err);
      alert(`"${cluster.title}" 주제 삭제 중 오류가 발생했습니다.`);
    }
  };

  const handleStartAddSite = () => {
    router.push(`/admin/sites/create/${cluster.id}`);
  };

  const handleOrder = (e) => {
    e?.stopPropagation();
    setIsOrdering(prev => !prev);
  };

  return (
    <S.ClusterContainer>
      <S.ClusterItem
        $isActive={isActive}
        onClick={handleToggle}
      >
        <S.ToggleSwitch $isActive={isActive}>
          <S.ToggleSlider $isActive={isActive} />
        </S.ToggleSwitch>
        {isEditing ? (
          <S.ClusterTitleInput
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit(e);
              else if (e.key === 'Escape') handleCancelEdit(e);
            }}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <S.ClusterTitle>{cluster.title}</S.ClusterTitle>
        )}
        {isAdmin && (
          isEditing ? (
            <S.EditActionButtons>
              <S.SaveButton onClick={handleSaveEdit}>저장</S.SaveButton>
              <S.CancelButton onClick={handleCancelEdit}>취소</S.CancelButton>
            </S.EditActionButtons>
          ) : (
            <EditButton onEdit={handleStartEdit} onDelete={handleDelete} onOrder={handleOrder} text="장소" />
          )
        )}
      </S.ClusterItem>

      {isAdmin && (
        <>
          <SiteSection
            clusterId={cluster.id}
            isAdmin={isAdmin}
            isOrdering={isOrdering}
            onOrderChange={() => setIsOrdering(false)}
          />
          <div style={{ width: '100px', display: 'flex', margin: '10px 0px 0px 46px', transform: 'scale(0.9)' }}>
            <AddButton onClick={handleStartAddSite}>
              <span>+</span>
              <span>장소 추가</span>
            </AddButton>
          </div>
        </>
      )}
    </S.ClusterContainer>
  );
}

export default ClusterItem;

