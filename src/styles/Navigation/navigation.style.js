'use client';
import styled from '@emotion/styled';

export const NavigationWrapper = styled.div`
  position: fixed;
  top: 15px;
  left: 0;
  width: 300px;
  max-height: 80dvh;
  background-color: white;
  border-radius: 0 8px 8px 0;
  border: 1.6px solid black;
  border-left: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 10;
`;

export const ThemeList = styled.ul`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  list-style: none;
  padding: 0;
`;

export const ThemeItem = styled.div`
  margin-bottom: 0px;
`;

export const ThemeHeader = styled.div`
  padding: 12px;
  border-radius: 6px;
  font-weight: ${props => props.$isExpanded ? '800' : '800'};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Sweet';
  font-size: 1.7rem;
`;

export const ExpandIcon = styled.div`
  font-size: 1rem;
  color: #666;
  transition: transform 0.2s ease;
  margin-left: 8px;
  margin-top: -5px;
`;

export const ThemeTitle = styled.div`
  flex: 1;
`;

export const EmptyText = styled.div`
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 20px;
`;

// Cluster 관련 스타일

export const ClusterList = styled.div`
  margin-top: 8px;
  margin-left: 14px;
  display: ${props => props.$isVisible ? 'flex' : 'none'};
  flex-direction: column;
  gap: 18px;
  height: ${props => props.$isVisible ? 'auto' : '0'};
  // overflow-y: hidden;
  transition: height 0.3s ease;
  margin-bottom: 40px;
`;

export const ClusterItem = styled.li`
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  font-family: 'Sweet';
  font-size: 1.3rem;
  list-style: none;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  color: #333;

  &:hover {
    // color:rgb(50, 149, 255);
    font-weight: 800;
  }
`;

export const ClusterTitle = styled.div`
  flex: 1;
`;

export const ToggleSwitch = styled.button`
  position: relative;
  width: 35px;
  height: 16px;
  background-color: ${props => props.$isActive ? 'blue' : '#ccc'};
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
  outline: none;

  &:hover {
    background-color: ${props => props.$isActive ? 'blue' : '#bbb'};
  }

  &:focus {
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
  }
`;

export const ToggleSlider = styled.div`
  position: absolute;
  top: 0px;
  left: ${props => props.$isActive ? '22px' : '0px'};
  width: 15px;
  height: 16px;
  background-color: white;
  border-radius: 50%;
  transition: left 0.3s ease;
  box-shadow: 0 2px 6px rgba(25, 37, 103, 0.42);
`;


