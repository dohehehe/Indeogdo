'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import MapSearch from '@/components/Map/MapSearch';
import MapReset from '@/components/Map/MapReset';

function MapContainer() {
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [mapInstance, setMapInstance] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(18); // 줌 레벨을 더 확대되도록 설정
  const [selectedSites, setSelectedSites] = useState([]);
  const [siteMarkers, setSiteMarkers] = useState([]);
  const siteMarkersRef = useRef([]);

  // 초기 위치 정보 저장
  const [initialPosition, setInitialPosition] = useState(null);

  // 선택된 sites 데이터를 받아서 POI 마커 생성
  const createSiteMarkers = useCallback((sites) => {
    console.log('createSiteMarkers called with:', sites);
    console.log('mapInstance available:', !!mapInstance);
    console.log('sites length:', sites?.length);

    if (!mapInstance) {
      console.error('mapInstance not available');
      return;
    }

    // 기존 site 마커들 제거 (항상 실행)
    clearSiteMarkers();

    if (!sites || sites.length === 0) {
      console.log('No sites to create markers for - all markers cleared');
      return;
    }

    const newMarkers = [];

    sites.forEach((site, index) => {
      console.log(`Processing site ${index + 1}:`, site);

      if (site.latitude && site.longitude) {
        console.log(`Creating marker for site: ${site.title} at ${site.latitude}, ${site.longitude}`);

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

        // 인포윈도우 생성
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; max-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333;">${site.title}</h3>
              ${site.address ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">${site.address}</p>` : ''}
              ${site.contents ? `<p style="margin: 0; font-size: 12px; color: #888;">${site.contents}</p>` : ''}
              ${site.cluster ? `<p style="margin: 8px 0 0 0; font-size: 12px; color: #2196f3; font-weight: bold;">클러스터: ${site.cluster.title}</p>` : ''}
            </div>
          `
        });

        // 마커 클릭 시 인포윈도우 표시
        marker.addListener('click', () => {
          infoWindow.open(mapInstance, marker);
        });

        // 마커에 식별자 추가
        marker._isSiteMarker = true;
        marker._siteId = site.id;

        newMarkers.push(marker);
        console.log(`Marker created for ${site.title}`);
      } else {
        console.warn(`Site ${site.title} missing latitude or longitude:`, {
          latitude: site.latitude,
          longitude: site.longitude
        });
      }
    });

    siteMarkersRef.current = newMarkers;
    setSiteMarkers(newMarkers);
    console.log(`Successfully created ${newMarkers.length} site markers`);
  }, [mapInstance]);

  // 기존 site 마커들 제거
  const clearSiteMarkers = useCallback(() => {
    console.log('Clearing site markers, current count:', siteMarkersRef.current.length);
    siteMarkersRef.current.forEach(marker => {
      console.log('Removing marker:', marker);
      marker.setMap(null);
    });
    siteMarkersRef.current = [];
    setSiteMarkers([]);
    console.log('All site markers cleared');
  }, []);

  // Navigation에서 선택된 sites 데이터를 받는 전역 함수 설정
  const handleSitesSelected = useCallback((sites) => {
    console.log('MapContainer: Received sites from Navigation:', sites);
    console.log('MapContainer: mapInstance available:', !!mapInstance);
    setSelectedSites(sites);
    if (mapInstance) {
      createSiteMarkers(sites);
    } else {
      console.warn('MapContainer: mapInstance not available, cannot create markers');
    }
  }, [mapInstance, createSiteMarkers]);

  useEffect(() => {
    window.onSitesSelected = handleSitesSelected;

    return () => {
      if (window.onSitesSelected) {
        delete window.onSitesSelected;
      }
    };
  }, [handleSitesSelected]);

  // 구글 지도 초기화
  useEffect(() => {
    const initMap = async () => {

      // DOM 요소가 준비될 때까지 대기
      const waitForElement = () => {
        if (!mapRef.current) {
          setTimeout(waitForElement, 100);
          return;
        }

        startMapInitialization();
      };

      const startMapInitialization = async () => {
        try {
          setLoading(true);
          setError(null);

          // 모바일 감지
          const isMobile = window.innerWidth <= 768;
          const lat = isMobile ? 37.567750 : 37.567836;
          const lng = isMobile ? 126.996055 : 126.997402;
          const zoom = isMobile ? 18.3 : 18.8;

          // 서버에서 API 키 가져오기
          const response = await fetch('/api/maps/script');
          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error || 'Failed to get API key');
          }

          // 구글 지도 스크립트가 이미 로드되었는지 확인
          if (window.google && window.google.maps) {
            // 이미 로드된 경우 바로 지도 생성
            const map = new google.maps.Map(mapRef.current, {
              center: { lat, lng },
              zoom: zoomLevel, // 동적 줌 레벨 사용
              mapTypeId: 'roadmap',
              disableDefaultUI: true,
              styles: getMapStyles()
            });
            setMapInstance(map);
            setLoading(false);
            setMapInitialized(true);

            // 초기 위치 저장 (지도 생성 후)
            setInitialPosition({ lat, lng, zoom: zoomLevel });
            return;
          }

          // 구글 지도 스크립트 동적 로드 (새로운 API 지원)
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places&v=weekly`;
          script.async = true;
          script.defer = true;

          script.onload = () => {
            // 약간의 지연을 두고 지도 초기화
            setTimeout(() => {
              try {
                const map = new google.maps.Map(mapRef.current, {
                  center: { lat, lng },
                  zoom: zoomLevel, // 동적 줌 레벨 사용
                  mapTypeId: 'roadmap',
                  disableDefaultUI: true,
                  styles: getMapStyles()
                });
                setMapInstance(map);
                setLoading(false);
                setMapInitialized(true);

                // 초기 위치 저장 (지도 생성 후)
                setInitialPosition({ lat, lng, zoom: zoomLevel });
              } catch (error) {
                console.error('Map initialization error:', error);
                setError(error.message);
                setLoading(false);
              }
            }, 500);
          };

          script.onerror = () => {
            setError('Failed to load Google Maps script');
            setLoading(false);
          };

          document.head.appendChild(script);

        } catch (error) {
          setError(error.message);
          setLoading(false);
        }
      };

      waitForElement();
    };

    // DOM이 완전히 마운트된 후 실행
    const timer = setTimeout(() => {
      initMap();
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  // 장소 검색 함수 (기존 PlacesService 사용)
  const searchPlaces = async (query) => {
    console.log('검색 시작:', query);

    if (!query.trim()) {
      console.log('검색어가 비어있음');
      return;
    }

    if (!window.google || !window.google.maps) {
      console.log('Google Maps API가 로드되지 않음');
      return;
    }

    if (!mapInstance) {
      console.log('지도 인스턴스가 없음');
      return;
    }

    try {
      console.log('기존 PlacesService 사용...');
      const service = new window.google.maps.places.PlacesService(mapInstance);
      const request = {
        query: query,
        fields: ['name', 'geometry', 'formatted_address', 'place_id']
      };

      console.log('검색 요청:', request);

      service.textSearch(request, (results, status) => {
        console.log('검색 결과:', { results, status });
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          console.log('검색 성공, 결과 개수:', results.length);
          setSearchResults(results);
        } else {
          console.error('검색 실패:', status);
          setSearchResults([]);
        }
      });
    } catch (error) {
      console.error('검색 중 오류:', error);
      setSearchResults([]);
    }
  };


  // 지도 리셋 함수
  const handleMapReset = () => {

    if (!mapInstance) {
      console.log('mapInstance가 없습니다');
      return;
    }

    if (!initialPosition) {
      console.log('initialPosition이 없습니다');
      return;
    }

    try {

      // 초기 위치로 이동
      mapInstance.setCenter({
        lat: initialPosition.lat,
        lng: initialPosition.lng
      });
      mapInstance.setZoom(initialPosition.zoom);

      // 모든 마커 제거
      const markers = document.querySelectorAll('[data-marker]');
      markers.forEach(marker => marker.remove());

      // site 마커들도 제거
      clearSiteMarkers();

      // 검색 결과 리셋
      setSearchResults([]);
      setSelectedSites([]);

      console.log('지도가 초기 위치로 리셋됨:', initialPosition);
    } catch (error) {
      console.error('지도 리셋 중 오류:', error);
    }
  };

  // 검색 결과 클릭 핸들러
  const handleResultClick = (place) => {
    if (!mapInstance) return;

    try {
      // 위치 정보 추출 (기존 API 형식)
      const location = place.geometry?.location;
      const name = place.name;

      if (!location) {
        console.error('위치 정보를 찾을 수 없습니다:', place);
        return;
      }

      // 지도 중심 이동 및 줌 설정
      mapInstance.setCenter(location);
      mapInstance.setZoom(zoomLevel);

      // 기존 마커 제거
      const markers = document.querySelectorAll('[data-marker]');
      markers.forEach(marker => marker.remove());

      // 기존 Marker 사용
      const marker = new window.google.maps.Marker({
        position: location,
        map: mapInstance,
        title: name
      });

      // 마커에 식별자 추가 (다른 방법 사용)
      if (marker.getElement && typeof marker.getElement === 'function') {
        marker.getElement().setAttribute('data-marker', 'true');
      } else {
        // 마커 객체 자체에 식별자 저장
        marker._isSearchMarker = true;
      }

      console.log('마커 추가됨:', name, '줌 레벨:', zoomLevel);
      setSearchResults([]);
    } catch (error) {
      console.error('마커 추가 중 오류:', error);
    }
  };

  // 지도 스타일 함수
  const getMapStyles = () => {
    return [
      {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#322F18" }]
      },
      {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#ffffff" }]
      },
      {
        "featureType": "all",
        "elementType": "labels.icon",
        "stylers": [{ "visibility": "off" }]
      },
      {
        "featureType": "administrative",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#322F18" }]
      },
      {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [{ "color": "#322F18" }]
      },
      {
        "featureType": "landscape",
        "elementType": "geometry.fill",
        "stylers": [
          { "lightness": "35" },
          { "hue": "#00ff61" }
        ]
      },
      {
        "featureType": "landscape",
        "elementType": "geometry.stroke",
        "stylers": [{ "color": "#322F18" }]
      },
      {
        "featureType": "landscape",
        "elementType": "labels",
        "stylers": [{ "visibility": "off" }]
      },
      {
        "featureType": "poi",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#ffffff" }]
      },
      {
        "featureType": "poi",
        "elementType": "labels",
        "stylers": [{ "visibility": "off" }]
      },
      {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [
          { "color": "#42ff89" },
          { "weight": "6" },
          { "lightness": "34" }
        ]
      },
      {
        "featureType": "road",
        "elementType": "geometry.stroke",
        "stylers": [
          { "color": "#73fca7" },
          { "visibility": "off" }
        ]
      },
      {
        "featureType": "road",
        "elementType": "labels",
        "stylers": [{ "visibility": "off" }]
      },
      {
        "featureType": "transit",
        "elementType": "labels",
        "stylers": [
          { "visibility": "simplified" },
          { "hue": "#322F18" }
        ]
      },
      {
        "featureType": "transit",
        "elementType": "labels.text.stroke",
        "stylers": [
          { "weight": "0.83" },
          { "color": "#ffffff" }
        ]
      },
      {
        "featureType": "transit.line",
        "elementType": "all",
        "stylers": [
          { "visibility": "on" },
          { "weight": "5.46" },
          { "hue": "#322F18" },
          { "lightness": "-34" }
        ]
      },
      {
        "featureType": "transit.station.bus",
        "elementType": "labels",
        "stylers": [{ "visibility": "off" }]
      },
      {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#ffffff" }]
      },
      {
        "featureType": "water",
        "elementType": "labels.icon",
        "stylers": [{ "visibility": "off" }]
      }
    ];
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      try {
        // 지도 인스턴스 정리
        if (window.mapInstance) {
          window.mapInstance = null;
        }

        // 전역 함수 정리
        if (window.initMap) {
          delete window.initMap;
        }
        if (window.onMapReady) {
          delete window.onMapReady;
        }
      } catch (error) {
        console.warn('Error during component cleanup:', error);
      }
    };
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100dvw', height: '100dvh' }}>
      {/* 검색 컴포넌트 - 지도가 초기화된 후에만 표시 */}
      {mapInitialized && (
        <MapSearch
          onSearch={searchPlaces}
          searchResults={searchResults}
          onResultClick={handleResultClick}
          onFocusOut={() => setSearchResults([])}
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