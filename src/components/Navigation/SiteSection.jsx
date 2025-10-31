'use client';

import { useState, useEffect } from 'react';
import * as S from '@/styles/Navigation/navigation.style';
import EditButton from '@/components/admin/EditButton';
import { useRouter } from 'next/navigation';
import useSites from '@/hooks/useSites';

function SiteSection({ clusterId, isAdmin }) {
  const router = useRouter();
  const { deleteSite, fetchSitesByCluster } = useSites();
  const [sites, setSites] = useState([]);

  // Admin 모드일 때 sites 데이터 가져오기
  useEffect(() => {
    if (isAdmin && clusterId) {
      const loadSites = async () => {
        const fetchedSites = await fetchSitesByCluster(clusterId);
        if (fetchedSites) {
          setSites(fetchedSites);
        }
      };
      loadSites();
    }
  }, [isAdmin, clusterId, fetchSitesByCluster]);

  const handleEditSite = (site) => {
    router.push(`/admin/sites/${site.id}/edit`);
  };

  const handleDeleteSite = async (site) => {
    if (!site) return;
    if (!confirm(`"${site.title}" 사이트를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) return;
    const result = await deleteSite(site.id);
    if (result) {
      // 삭제 성공 시 로컬 상태에서 제거
      setSites(prev => prev.filter(s => s.id !== site.id));
    }
  };

  if (!isAdmin || !sites || sites.length === 0) return null;
  return (
    <S.SiteList>
      {sites.map((site) => (
        <S.SiteItem key={site.id}>
          <S.SiteIcon src={site.icon?.img || undefined} alt={site.title} />
          <S.SiteTitle>{site.title}</S.SiteTitle>
          <EditButton onEdit={() => handleEditSite(site)} onDelete={() => handleDeleteSite(site)} />
        </S.SiteItem>
      ))}
    </S.SiteList>
  );
}

export default SiteSection;


