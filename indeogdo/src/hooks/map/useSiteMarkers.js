import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
// POI 마커 관리를 위한 커스텀 훅
const useSiteMarkers = (mapInstance) => {
  const [siteMarkers, setSiteMarkers] = useState([]);
  const siteMarkersRef = useRef([]);
  const router = useRouter();
  // 기존 site 마커들 제거
  const clearSiteMarkers = useCallback(() => {
    siteMarkersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    siteMarkersRef.current = [];
    setSiteMarkers([]);
  }, []);

  // 선택된 sites 데이터를 받아서 POI 마커 생성 (최적화된 버전)
  const createSiteMarkers = useCallback((sites) => {
    if (!mapInstance) {
      return;
    }

    // 현재 활성화된 site ID들
    const currentSiteIds = new Set(sites?.map(site => site.id) || []);

    // 기존 마커들 중 제거해야 할 것들 찾기
    const markersToRemove = siteMarkersRef.current.filter(marker =>
      !currentSiteIds.has(marker._siteId)
    );

    // 새로 추가해야 할 sites 찾기
    const existingSiteIds = new Set(siteMarkersRef.current.map(marker => marker._siteId));
    const sitesToAdd = sites?.filter(site => !existingSiteIds.has(site.id)) || [];

    // 제거할 마커들 제거
    markersToRemove.forEach(marker => {
      marker.setMap(null);
    });

    // 새로 추가할 마커들 생성
    const newMarkers = [];
    sitesToAdd.forEach((site) => {
      if (site.latitude && site.longitude) {
        // 커스텀 아이콘 생성
        const icon = site.icon?.img ? {
          url: site.icon.img,
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16)
        } : null;

        const marker = new window.google.maps.Marker({
          position: {
            lat: parseFloat(site.latitude),
            lng: parseFloat(site.longitude)
          },
          map: mapInstance,
          title: site.title,
          icon: icon,
          animation: window.google.maps.Animation.DROP
        });

        // 애니메이션을 잠시 후에 중지 (새로 추가되는 마커만)
        setTimeout(() => {
          marker.setAnimation(null);
        }, 1000);

        // 인포윈도우 생성
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; max-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333;">${site.title}</h3>
              ${site.address ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">${site.address}</p>` : ''}
              ${site.cluster ? `<p style="margin: 8px 0 0 0; font-size: 12px; color: #2196f3; font-weight: bold;">클러스터: ${site.cluster.title}</p>` : ''}
            </div>
          `
        });

        // 마커 클릭 시 인포윈도우 표시 및 라우팅
        marker.addListener('click', () => {
          // infoWindow.open(mapInstance, marker);

          // POI 상세 페이지로 라우팅
          if (window.onPOIClick) {
            window.onPOIClick(site);
          }
        });

        // 마커에 식별자 추가
        marker._isSiteMarker = true;
        marker._siteId = site.id;

        newMarkers.push(marker);
      }
    });

    // 기존 마커들 중 유지할 것들과 새로 추가할 마커들 합치기
    const markersToKeep = siteMarkersRef.current.filter(marker =>
      currentSiteIds.has(marker._siteId)
    );

    const allMarkers = [...markersToKeep, ...newMarkers];
    siteMarkersRef.current = allMarkers;
    setSiteMarkers(allMarkers);
  }, [mapInstance]);

  return {
    siteMarkers,
    createSiteMarkers,
    clearSiteMarkers
  };
};

export default useSiteMarkers;
