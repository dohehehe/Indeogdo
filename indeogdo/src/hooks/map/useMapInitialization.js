import { useEffect, useRef, useState, useCallback } from 'react';

// 지도 초기화를 위한 커스텀 훅
const useMapInitialization = () => {
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(18);
  const [initialPosition, setInitialPosition] = useState(null);

  // 지도 스타일 함수
  const getMapStyles = useCallback(() => {
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
  }, []);

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
              zoom: zoomLevel,
              mapTypeId: 'roadmap',
              disableDefaultUI: true,
              styles: getMapStyles()
            });
            setMapInstance(map);
            setLoading(false);
            setMapInitialized(true);
            setInitialPosition({ lat, lng, zoom: zoomLevel });
            return;
          }

          // 구글 지도 스크립트 동적 로드
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places&v=weekly`;
          script.async = true;
          script.defer = true;

          script.onload = () => {
            setTimeout(() => {
              try {
                const map = new google.maps.Map(mapRef.current, {
                  center: { lat, lng },
                  zoom: zoomLevel,
                  mapTypeId: 'roadmap',
                  disableDefaultUI: true,
                  styles: getMapStyles()
                });
                setMapInstance(map);
                setLoading(false);
                setMapInitialized(true);
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
  }, [zoomLevel, getMapStyles]);

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

  return {
    mapRef,
    loading,
    error,
    mapInitialized,
    mapInstance,
    zoomLevel,
    initialPosition,
    setZoomLevel
  };
};

export default useMapInitialization;
