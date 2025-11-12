'use client';

import { useEffect } from 'react';
import useMapPolygon from '@/hooks/map/useMapPolygon';
import { polygonsData } from '@/lib/polygonsData';

/**
 * 지도에 여러 다각형을 표시하는 컴포넌트
 * polygonsData에서 데이터를 가져와서 모든 다각형을 렌더링합니다.
 */
function MapPolygons({ mapInstance, mapInitialized, zoomLevel }) {
  // 지도가 초기화되지 않았거나 mapInstance가 없으면 렌더링하지 않음
  if (!mapInitialized || !mapInstance) {
    return null;
  }

  // 각 다각형을 렌더링 (시각적 요소는 없지만 훅 실행을 위해 컴포넌트로 처리)
  return (
    <>
      {polygonsData.map((polygonData) => (
        <PolygonItem
          key={polygonData.id}
          mapInstance={mapInstance}
          polygonData={polygonData}
          zoomLevel={zoomLevel}
        />
      ))}
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
    options: polygonData.options || {}
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
