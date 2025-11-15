'use client';

import { useEffect, useRef } from 'react';
import useMapPolygon from '@/hooks/map/useMapPolygon';
import { polygonsData } from '@/lib/polygonsData';
import { areaPolygonData } from '@/lib/areaPolygonData';

/**
 * 지도에 여러 다각형을 표시하는 컴포넌트
 * polygonsData에서 데이터를 가져와서 모든 다각형을 렌더링합니다.
 * selectedSites 중 area가 true인 site가 있으면 areaPolygonData도 표시합니다.
 */
function MapPolygons({ mapInstance, mapInitialized, zoomLevel, selectedSites = [] }) {
  // 지도가 초기화되지 않았거나 mapInstance가 없으면 렌더링하지 않음
  if (!mapInitialized || !mapInstance) {
    return null;
  }

  // area가 true인 site가 있는지 확인
  const hasAreaSite = selectedSites.some(site => site.area === true);
  const areaTextMarkerRef = useRef(null);

  // polygon의 중심점 계산
  const calculateCentroid = (coordinates) => {
    if (!coordinates || coordinates.length === 0) return null;

    let sumLat = 0;
    let sumLng = 0;

    coordinates.forEach(coord => {
      sumLat += coord[0];
      sumLng += coord[1];
    });

    return {
      lat: sumLat / coordinates.length,
      lng: sumLng / coordinates.length
    };
  };

  // areaPolygon 텍스트 마커 생성/제거
  useEffect(() => {
    if (!mapInstance || !window.google || !window.google.maps) return;

    if (hasAreaSite) {
      // 텍스트 마커 생성
      const centroid = calculateCentroid(areaPolygonData.coordinates);
      if (centroid) {
        // 텍스트 레이블을 위한 Canvas 아이콘 생성
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const fontSize = 18;
        const text = '인덕도';

        context.font = `bold ${fontSize}px Arial, sans-serif`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        const textWidth = context.measureText(text).width;
        const padding = 8;
        const totalWidth = textWidth + padding * 2;
        const totalHeight = fontSize + padding * 2;

        canvas.width = totalWidth;
        canvas.height = totalHeight;

        // 다시 폰트 설정
        context.font = `bold ${fontSize}px Arial, sans-serif`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        // 흰색 테두리
        context.strokeStyle = '#ffffff';
        context.lineWidth = 3;
        context.lineJoin = 'round';
        context.miterLimit = 2;
        context.strokeText(text, totalWidth / 2, totalHeight / 2);

        // 검정색 텍스트
        context.fillStyle = '#000000';
        context.fillText(text, totalWidth / 2, totalHeight / 2);

        const marker = new window.google.maps.Marker({
          position: centroid,
          map: mapInstance,
          icon: {
            url: canvas.toDataURL(),
            size: new window.google.maps.Size(totalWidth, totalHeight),
            anchor: new window.google.maps.Point(totalWidth / 2, totalHeight / 2)
          },
          zIndex: 3, // polygon보다 위에 표시
          optimized: false
        });

        areaTextMarkerRef.current = marker;
      }
    } else {
      // 텍스트 마커 제거
      if (areaTextMarkerRef.current) {
        areaTextMarkerRef.current.setMap(null);
        areaTextMarkerRef.current = null;
      }
    }

    return () => {
      if (areaTextMarkerRef.current) {
        areaTextMarkerRef.current.setMap(null);
        areaTextMarkerRef.current = null;
      }
    };
  }, [hasAreaSite, mapInstance]);

  // 각 다각형을 렌더링 (시각적 요소는 없지만 훅 실행을 위해 컴포넌트로 처리)
  // areaPolygon을 마지막에 렌더링하여 다른 polygon들 위에 표시되도록 함
  return (
    <>
      {/* 일반 polygon들 */}
      {polygonsData.map((polygonData) => (
        <PolygonItem
          key={polygonData.id}
          mapInstance={mapInstance}
          polygonData={polygonData}
          zoomLevel={zoomLevel}
        />
      ))}
      {/* area가 true인 site가 있으면 area polygon 표시 */}
      {hasAreaSite && (
        <PolygonItem
          key={areaPolygonData.id}
          mapInstance={mapInstance}
          polygonData={areaPolygonData}
          zoomLevel={zoomLevel}
        />
      )}
    </>
  );
}

/**
 * 개별 다각형을 관리하는 내부 컴포넌트
 */
function PolygonItem({ mapInstance, polygonData, zoomLevel }) {
  const {
    createPolygon,
    removePolygon
  } = useMapPolygon({
    mapInstance,
    coordinates: polygonData.coordinates,
    fillColor: polygonData.fillColor,
    strokeColor: polygonData.strokeColor,
    strokeWidth: polygonData.strokeWidth,
    fillOpacity: polygonData.fillOpacity !== undefined ? polygonData.fillOpacity : 1.0,
    strokeOpacity: polygonData.strokeOpacity !== undefined ? polygonData.strokeOpacity : 1.0,
    minZoom: polygonData.minZoom !== undefined ? polygonData.minZoom : null,
    zoomLevel: zoomLevel,
    options: {
      ...(polygonData.options || {}),
      ...(polygonData.zIndex !== undefined ? { zIndex: polygonData.zIndex } : {})
    }
  });

  // visible prop과 coordinates에 따라 다각형 표시/숨김
  useEffect(() => {
    if (!mapInstance) return;

    const isVisible = polygonData.visible !== undefined ? polygonData.visible : true;

    if (isVisible && polygonData.coordinates.length >= 3) {
      createPolygon();
    } else {
      removePolygon();
    }

    return () => {
      removePolygon();
    };
  }, [
    mapInstance,
    polygonData.visible,
    polygonData.coordinates,
    createPolygon,
    removePolygon
  ]);

  // 시각적 요소는 렌더링하지 않음
  return null;
}

export default MapPolygons;
