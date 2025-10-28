'use client';

import styled from '@emotion/styled';
import { theme } from '@/styles/Theme';

export const BoardWrapper = styled.div`
  position: fixed;
  font-family: 'Sweet';
  top: 70px;
  right: 0;
  width: ${props => {
    switch (props.$widthMode) {
      case 'wide': return 'calc(100dvw - 390px)';
      case 'normal': return '40dvw';
      case 'narrow': return '60px';
      default: return '40dvw';
    }
  }};
  height: calc(100dvh - 70px);
  background-color: white;
  border-radius: 12px 0 0 0;
  box-shadow: 0 4px 20px rgba(9, 36, 50, 0.39);
  overflow: hidden;
  z-index: 1000;
  display: flex;
  border: 2px solid black;
  border-right: none;
  border-bottom: none;
  transition: width 0.7s ease-in-out, box-shadow 0.3s ease-in-out;

  &:hover {
    box-shadow: 0 4px 30px rgba(6, 109, 160, 0.8);
  }

  /* 모바일에서의 스타일 */
  ${theme.media.mobile} {
    width: calc(100dvw - 20px);
    margin: 0 10px;
    top: unset;
    bottom: 10px;
    right: unset;
    border-radius: 12px;
    border: 1px solid black;
    height: 80dvh;
    flex-direction: column;

    &:hover {
      box-shadow: 0 0px 20px rgba(12, 73, 104, 0.56);
    }
  }
`;

export const BoardButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0px;
  min-width: 50px;
  margin-right: 15px;
  align-items: center;
  justify-content: center;
  padding-left: 10px;
  position: relative;
  z-index: 2;

  ${theme.media.mobile} {
    padding-top: 5px;
    padding-right:0px;
  }
`;

export const BoardButtonMobile = styled.button`
  display: none;
  ${theme.media.mobile} {
    display: block;
    background-color: transparent;
    border: none;
    cursor: pointer;
    font-size: 3rem;
    font-weight: 600;
    color: black;
    opacity: 0.7;
    border-radius: 50%;
    margin-left: auto;
  }
`;

export const BoardButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  font-size: 2rem;
  font-weight: 100;
  color: ${props => props.$disabled ? '#ccc' : 'black'};
  opacity: 0.7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;
  pointer-events: ${props => props.$disabled ? 'none' : 'auto'};
  padding: 8px 13px;
  padding: ${props => {
    switch (props.$widthMode) {
      case 'wide': return '8px 14px 8px 12px';
      case 'normal': return '8px 13px';
      case 'narrow': return '8px 10px 8px 15px';
      default: return '8px 13px';
    }
  }};

  &:hover {
    background-color: ${props => props.$disabled ? 'transparent' : '#f0f0f0'};
    opacity: ${props => props.$disabled ? 0.3 : 1};
  }

  ${theme.media.mobile} {
    display: none;
  }
`;

export const BoardDetailWrapper = styled.div`
  padding: 50px 50px 30px 10px;
  overflow-y: auto;
  height: 100%;
  min-width: 200px;

    
  /* 스크롤바 숨기기 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }

  ${theme.media.mobile} {
    padding: 30px 20px;
    margin-top: -43px;
    padding-top: 25px;
  }
`;

export const BoardClusterWrapper = styled.div`
  display: flex;
  gap: 13px;
  align-items: center;
  margin-bottom: 40px;
`;

export const BoardClusterIcon = styled.img`
  width: 27px;
  height: 27px;
  object-fit: cover;
`;

export const BoardClusterTitle = styled.h2`
  font-size: 2.1rem;
  font-weight: 900;
`;

export const BoardTitle = styled.h1`
  font-size: 1.9rem;
  font-weight: 800;
  margin-bottom: 12px;
`;

export const BoardAddress = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 10px;
`