'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 로그인 함수
  const login = async (email, password) => {
    try {
      setLoading(true);
      // 실제 로그인 API 호출
      // const response = await fetch('/api/auth/login', { ... });
      // const userData = await response.json();

      // 임시 더미 데이터
      const userData = { id: 1, email, name: '사용자' };
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃 함수
  const logout = () => {
    setUser(null);
    // 로컬 스토리지 정리 등
  };

  // 회원가입 함수
  const register = async (email, password, name) => {
    try {
      setLoading(true);
      // 실제 회원가입 API 호출
      const userData = { id: Date.now(), email, name };
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // 초기 로딩 시 토큰 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 토큰이 있다면 사용자 정보 가져오기
        const token = localStorage.getItem('token');
        if (token) {
          // API 호출로 사용자 정보 확인
          // const response = await fetch('/api/auth/me', { ... });
          // setUser(response.data);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 커스텀 훅
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
