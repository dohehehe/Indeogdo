import { useEffect, useRef, useState, useCallback } from 'react';

// 지도 초기화를 위한 커스텀 훅
const useMapInitialization = () => {
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(17);
  const [initialPosition, setInitialPosition] = useState(null);

  // 지도 스타일 함수
  const getMapStyles = useCallback(() => {
    return [
      {
        "featureType": "all",
        "elementType": "all",
        "stylers": [
          {
            "visibility": "on"
          }
        ]
      },
      {
        "featureType": "all",
        "elementType": "geometry",
        "stylers": [
          {
            "visibility": "on"
          }
        ]
      },
      {
        "featureType": "all",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "color": "#add5ff"
          }
        ]
      },
      {
        "featureType": "all",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#000000"
          },
          {
            "weight": "1.07"
          }
        ]
      },
      {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#000000"
          },
          {
            "weight": "0.01"
          }
        ]
      },
      {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "color": "#ffffff"
          },
          {
            "weight": "1.00"
          }
        ]
      },
      {
        "featureType": "all",
        "elementType": "labels.icon",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "administrative",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "weight": "1.14"
          }
        ]
      },
      {
        "featureType": "administrative.locality",
        "elementType": "all",
        "stylers": [
          {
            "visibility": "on"
          }
        ]
      },
      {
        "featureType": "administrative.locality",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "color": "#040404"
          },
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "administrative.land_parcel",
        "elementType": "all",
        "stylers": [
          {
            "visibility": "on"
          }
        ]
      },
      {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "weight": "0.70"
          },
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "landscape",
        "elementType": "labels.icon",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "landscape.man_made",
        "elementType": "all",
        "stylers": [
          {
            "visibility": "on"
          }
        ]
      },
      {
        "featureType": "landscape.natural.landcover",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "landscape.natural.terrain",
        "elementType": "all",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "poi.attraction",
        "elementType": "all",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "poi.medical",
        "elementType": "all",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "visibility": "off"
          },
          {
            "color": "#e5e5e7"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "color": "#fffbfb"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "labels.icon",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
          {
            "visibility": "on"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "color": "#ffffff"
          },
          {
            "weight": "14.00"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#000000"
          },
          {
            "weight": "1.20"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#FFFFFF"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "labels.icon",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "road.highway.controlled_access",
        "elementType": "all",
        "stylers": [
          {
            "visibility": "off"
          },
          {
            "weight": "1.00"
          }
        ]
      },
      {
        "featureType": "road.highway.controlled_access",
        "elementType": "labels.icon",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "road.arterial",
        "elementType": "all",
        "stylers": [
          {
            "visibility": "on"
          }
        ]
      },
      {
        "featureType": "road.arterial",
        "elementType": "labels",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "road.local",
        "elementType": "all",
        "stylers": [
          {
            "visibility": "on"
          },
          {
            "weight": "0.97"
          }
        ]
      },
      {
        "featureType": "road.local",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "visibility": "on"
          },
          {
            "color": "#fbfbfb"
          }
        ]
      },
      {
        "featureType": "road.local",
        "elementType": "labels.icon",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "transit",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "color": "#ff0000"
          }
        ]
      },
      {
        "featureType": "transit",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#ff0000"
          }
        ]
      },
      {
        "featureType": "transit",
        "elementType": "labels.icon",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
          {
            "color": "#000000"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "visibility": "on"
          },
          {
            "color": "#000000"
          },
          {
            "weight": "0.56"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#ffffff"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "color": "#fcfcfc"
          },
          {
            "weight": "3.67"
          }
        ]
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
          const lat = isMobile ? 37.400409 : 37.400409;
          const lng = isMobile ? 126.974294 : 126.974294;

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
          script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&loading=async&region=KR&language=ko&libraries=places&v=weekly`;
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
