'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import MapSearch from '@/components/Map/MapSearch';
import MapReset from '@/components/Map/MapReset';
import useMapInitialization from '@/hooks/map/useMapInitialization';
import useSiteMarkers from '@/hooks/map/useSiteMarkers';
import useMapSearch from '@/hooks/map/useMapSearch';

function MapContainer() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith('/admin')) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [pathname]);
  // 지도 초기화 훅
  const {
    mapRef,
    loading,
    error,
    mapInitialized,
    mapInstance,
    zoomLevel,
    initialPosition,
    setZoomLevel
  } = useMapInitialization();

  // POI 마커 관리 훅
  const {
    siteMarkers,
    createSiteMarkers,
    clearSiteMarkers
  } = useSiteMarkers(mapInstance);

  // 장소 검색 훅
  const {
    searchResults,
    searchPlaces,
    handleResultClick,
    clearSearchResults
  } = useMapSearch(mapInstance, zoomLevel);

  const [selectedSites, setSelectedSites] = useState([]);

  // Navigation에서 선택된 sites 데이터를 받는 전역 함수 설정
  const handleSitesSelected = useCallback((sites) => {
    setSelectedSites(sites);
    if (mapInstance) {
      createSiteMarkers(sites);
    }
  }, [mapInstance, createSiteMarkers]);

  // POI 클릭 시 라우팅 처리
  const handlePOIClick = useCallback((site) => {
    router.push(`/sites/${site.id}`);
  }, [router]);

  // Navigation에서 선택된 sites 데이터를 받는 전역 함수 설정
  useEffect(() => {
    window.onSitesSelected = handleSitesSelected;
    window.onPOIClick = handlePOIClick;

    return () => {
      if (window.onSitesSelected) {
        delete window.onSitesSelected;
      }
      if (window.onPOIClick) {
        delete window.onPOIClick;
      }
    };
  }, [handleSitesSelected, handlePOIClick]);


  // 지도 리셋 함수
  const handleMapReset = useCallback(() => {
    if (!mapInstance || !initialPosition) {
      return;
    }

    try {
      // 초기 위치로 이동
      mapInstance.setCenter({
        lat: initialPosition.lat,
        lng: initialPosition.lng
      });
      mapInstance.setZoom(initialPosition.zoom);

      // 검색 마커만 제거 (POI 마커는 유지)
      const searchMarkers = document.querySelectorAll('[data-marker]');
      searchMarkers.forEach(marker => marker.remove());

      // 검색 결과만 리셋 (POI는 유지)
      clearSearchResults();

      // selectedSites는 유지하여 POI 마커가 계속 표시되도록 함
    } catch (error) {
      console.error('지도 리셋 중 오류:', error);
    }
  }, [mapInstance, initialPosition, clearSearchResults]);



  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100dvw', height: '100dvh' }}>
      {/* 검색 컴포넌트 - 지도가 초기화된 후에만 표시 */}
      {mapInitialized && !isAdmin && (
        <MapSearch
          onSearch={searchPlaces}
          searchResults={searchResults}
          onResultClick={handleResultClick}
          onFocusOut={clearSearchResults}
          placeholder="장소를 검색하세요..."
        />
      )}

      {/* 지도 컨테이너 */}
      <div
        id="map"
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          cursor: 'pointer',
          position: 'relative',
        }}
      />

      {loading && (
        <>loading...</>
      )}

      {error && (
        <>error...</>
      )}

      {/* 리셋 버튼 - 지도가 초기화된 후에만 표시 */}
      {mapInitialized && (
        <MapReset onReset={handleMapReset} />
      )}
    </div>
  );
};

export default MapContainer;