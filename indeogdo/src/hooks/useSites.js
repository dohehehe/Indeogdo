import { useState, useEffect, useCallback } from 'react';

// Sites 데이터 타입 정의
const useSites = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 모든 사이트 조회
  const fetchSites = useCallback(async (limit = 100, offset = 0, clusterId = null, iconId = null) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });

      if (clusterId) {
        params.append('cluster_id', clusterId);
      }

      if (iconId) {
        params.append('icon_id', iconId);
      }

      const response = await fetch(`/api/sites?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch sites');
      }

      setSites(result.data);
      return result.data;
    } catch (err) {
      setError(err.message);
      console.error('Fetch sites error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 특정 사이트 조회
  const fetchSite = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sites/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch site');
      }

      return result.data;
    } catch (err) {
      setError(err.message);
      console.error('Fetch site error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 사이트 생성
  const createSite = useCallback(async (siteData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(siteData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create site');
      }

      // 로컬 상태 업데이트
      setSites(prev => [result.data, ...prev]);
      return result.data;
    } catch (err) {
      setError(err.message);
      console.error('Create site error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 사이트 수정
  const updateSite = useCallback(async (id, siteData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sites/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(siteData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update site');
      }

      // 로컬 상태 업데이트
      setSites(prev =>
        prev.map(site =>
          site.id === id ? result.data : site
        )
      );
      return result.data;
    } catch (err) {
      setError(err.message);
      console.error('Update site error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 사이트 삭제
  const deleteSite = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sites/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete site');
      }

      // 로컬 상태 업데이트
      setSites(prev => prev.filter(site => site.id !== id));
      return result.data;
    } catch (err) {
      setError(err.message);
      console.error('Delete site error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 특정 클러스터의 사이트만 조회
  const fetchSitesByCluster = useCallback(async (clusterId) => {
    return await fetchSites(100, 0, clusterId);
  }, [fetchSites]);

  // 특정 아이콘의 사이트만 조회
  const fetchSitesByIcon = useCallback(async (iconId) => {
    return await fetchSites(100, 0, null, iconId);
  }, [fetchSites]);

  // 컴포넌트 마운트 시 사이트 목록 로드
  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  return {
    // 상태
    sites,
    loading,
    error,

    // 액션
    fetchSites,
    fetchSite,
    createSite,
    updateSite,
    deleteSite,
    fetchSitesByCluster,
    fetchSitesByIcon,

    // 유틸리티
    clearError: () => setError(null),
  };
};

export default useSites;



