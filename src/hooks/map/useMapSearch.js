import { useState, useCallback } from 'react';

// 장소 검색을 위한 커스텀 훅
const useMapSearch = (mapInstance, zoomLevel) => {
  const [searchResults, setSearchResults] = useState([]);

  // 장소 검색 함수
  const searchPlaces = useCallback(async (query) => {
    if (!query.trim()) {
      return;
    }

    if (!window.google || !window.google.maps) {
      return;
    }

    if (!mapInstance) {
      return;
    }

    try {
      const service = new window.google.maps.places.PlacesService(mapInstance);
      const request = {
        query: query,
        fields: ['name', 'geometry', 'formatted_address', 'place_id']
      };

      service.textSearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          setSearchResults(results);
        } else {
          setSearchResults([]);
        }
      });
    } catch (error) {
      console.error('검색 중 오류:', error);
      setSearchResults([]);
    }
  }, [mapInstance]);

  // 검색 결과 클릭 핸들러
  const handleResultClick = useCallback((place) => {
    if (!mapInstance) return;

    try {
      // 위치 정보 추출
      const location = place.geometry?.location;
      const name = place.name;

      if (!location) {
        console.error('위치 정보를 찾을 수 없습니다:', place);
        return;
      }

      // 지도 중심 이동 및 줌 설정
      mapInstance.setCenter(location);
      mapInstance.setZoom(zoomLevel);

      // 기존 검색 마커 제거
      if (window._searchMarker) {
        window._searchMarker.setMap(null);
        window._searchMarker = null;
      }

      // 기본 마커 사용 (POI 마커와 동일한 방식)
      const marker = new window.google.maps.Marker({
        position: location,
        map: mapInstance,
        title: name,
        icon: {
          url: '/icon/marker.png',
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16)
        },
        animation: window.google.maps.Animation.DROP
      });

      // 애니메이션 제거
      setTimeout(() => {
        marker.setAnimation(null);
      }, 1000);

      // 마커에 식별자 추가 및 전역 참조 저장
      marker._isSearchMarker = true;
      window._searchMarker = marker;

      setSearchResults([]);
    } catch (error) {
      console.error('마커 추가 중 오류:', error);
    }
  }, [mapInstance, zoomLevel]);

  // 검색 결과 초기화
  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
  }, []);

  return {
    searchResults,
    searchPlaces,
    handleResultClick,
    clearSearchResults
  };
};

export default useMapSearch;
