'use client';

import { useEffect, useState } from 'react';
import Board from '@/components/Sites/Board';
import BoardContainer from '@/container/BoardContainer';

export default function Home() {
  const DEFAULT_SITE_ID = '261ef9c4-8889-4392-817d-dd22a2fe17ae';
  const [siteData, setSiteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 버말로 POI 데이터 설정
    window.poiData = [
      // {
      //   latitude: 37.40290728423603,
      //   longitude: 126.97292833814231,
      //   name: '벌말로',
      //   fontSize: 14,
      //   minZoom: 17
      // },
      {
        latitude: 37.402860408746776,
        longitude: 126.97339772471992,
        name: '비그라운드\n아키텍츠',
        fontSize: 12,
        minZoom: 19
      },
      {
        latitude: 37.40440150071914,
        longitude: 126.97294095933603,
        name: '관악대로',
        fontSize: 14,
        minZoom: 17
      },
      {
        latitude: 37.39989469326408,
        longitude: 126.97684265610809,
        name: '흥안대로',
        fontSize: 14,
        minZoom: 17
      },
      {
        latitude: 37.40375422258425,
        longitude: 126.97783989395577,
        name: '과천대로',
        fontSize: 14,
        minZoom: 17
      }
    ];

    // 초기 로드 시 기본 site 데이터 가져오기
    const fetchSiteData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/sites/${DEFAULT_SITE_ID}`);
        if (!response.ok) {
          throw new Error('Failed to fetch site data');
        }
        const result = await response.json();

        if (result.success && result.data) {
          setSiteData(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch site data');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching site data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSiteData();

    return () => {
      if (window.poiData) {
        delete window.poiData;
      }
    };
  }, []);

  if (loading) {
    return null; // 로딩 중에는 아무것도 표시하지 않음 (지도만 보임)
  }

  if (error) {
    return null; // 에러 시에도 아무것도 표시하지 않음
  }

  // siteData가 있으면 BoardContainer 렌더링 (URL은 변경되지 않음)
  return siteData ? <Board><BoardContainer siteData={siteData} /></Board> : null;
}
