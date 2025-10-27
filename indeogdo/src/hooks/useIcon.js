import { useState, useEffect, useCallback } from 'react';

// Icon 데이터 타입 정의
const useIcon = () => {
  const [icons, setIcons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 모든 아이콘 조회
  const fetchIcons = useCallback(async (limit = 100, offset = 0) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/icon?limit=${limit}&offset=${offset}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch icons');
      }

      setIcons(result.data);
      return result.data;
    } catch (err) {
      setError(err.message);
      console.error('Fetch icons error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 특정 아이콘 조회
  const fetchIcon = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/icon/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch icon');
      }

      return result.data;
    } catch (err) {
      setError(err.message);
      console.error('Fetch icon error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 아이콘 생성
  const createIcon = useCallback(async (img) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/icon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ img }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create icon');
      }

      // 로컬 상태 업데이트
      setIcons(prev => [result.data, ...prev]);
      return result.data;
    } catch (err) {
      setError(err.message);
      console.error('Create icon error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 아이콘 수정
  const updateIcon = useCallback(async (id, img) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/icon/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ img }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update icon');
      }

      // 로컬 상태 업데이트
      setIcons(prev =>
        prev.map(icon =>
          icon.id === id ? result.data : icon
        )
      );
      return result.data;
    } catch (err) {
      setError(err.message);
      console.error('Update icon error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 아이콘 삭제
  const deleteIcon = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/icon/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete icon');
      }

      // 로컬 상태 업데이트
      setIcons(prev => prev.filter(icon => icon.id !== id));
      return result.data;
    } catch (err) {
      setError(err.message);
      console.error('Delete icon error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 아이콘 목록 로드
  useEffect(() => {
    fetchIcons();
  }, [fetchIcons]);

  return {
    // 상태
    icons,
    loading,
    error,

    // 액션
    fetchIcons,
    fetchIcon,
    createIcon,
    updateIcon,
    deleteIcon,

    // 유틸리티
    clearError: () => setError(null),
  };
};

export default useIcon;


