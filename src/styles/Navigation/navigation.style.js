'use client';

import styled from '@emotion/styled';
import { theme } from '@/styles/Theme';

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
  color: black;

  ${theme.media.mobile} {
    top: 60px;
    padding-top: 10px;
    left: unset;
    right: 7px;
    border-radius: ${props => props.$isOpen ? '10px 150px 10px 10px' : '50%'};
    border: 1.5px solid black;
    transition: all 0.8s ease-in-out;
    width: ${props => props.$isOpen ? '300px' : '43px'};
    max-height: ${props => props.$isOpen ? '80dvh' : '41px'};
    padding: ${props => props.$isOpen ? '0px 12px 0px 5px' : '0'};
  }
`;

export const MobileToggleButton = styled.button`
  display: none;
  ${theme.media.mobile} {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border: none;
    cursor: pointer;
    position: fixed;
    right: 6.6px;
    top: 58px;
    z-index: 20;
    height: 40px;
    width: 40px;
  }
`;

export const HamburgerIcon = styled.div`
  display: none;
  width: 24px;
  height: 12px;
  position: relative;
  cursor: pointer;
  
  ${theme.media.mobile} {
    display: block;
  }
`;

export const HamburgerIconSpan = styled.span`
  display: block;
  width: 90%;
  height: 2px;
  border-radius: 2px;
  background-color: black;
  position: absolute;
  transition: all 0.5s ease;
  outline: 2px solid white;
  
  &:nth-of-type(1) {
    top: ${props => props.$isOpen ? '2px' : '0px'};
    transform: ${props => props.$isOpen ? 'rotate(45deg)' : 'rotate(0deg)'};
  }
  
  &:nth-of-type(2) {
    top: 7px;
    opacity: ${props => props.$isOpen ? '0' : '1'};
    transform: ${props => props.$isOpen ? 'translateX(20px)' : 'translateX(0px)'};
  }
  
  &:nth-of-type(3) {
    top: ${props => props.$isOpen ? '2px' : '14px'};
    transform: ${props => props.$isOpen ? 'rotate(-45deg)' : 'rotate(0deg)'};
  }
`;

export const ThemeList = styled.ul`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  list-style: none;
  padding: 0;
  transition: all 0.5s ease;

  ${theme.media.mobile} {
    height: ${props => props.$isOpen ? '100%' : '0'};
    overflow: hidden;
    overflow-y: auto;
    padding-top: 5px;
    margin-left: 2px;
    gap: 0;
    opacity: ${props => props.$isOpen ? '1' : '0'};
  }
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

  ${theme.media.mobile} {
    font-size: 1.5rem;
    flex-direction: row-reverse;
    justify-content: flex-end;
  }
`;

export const ExpandIcon = styled.div`
  font-size: 1rem;
  color: #666;
  transition: transform 0.2s ease;
  margin-left: 8px;
  margin-top: -5px;

  ${theme.media.mobile} {
    margin-top: -1px;
    margin-left: 2px;
    margin-right: 10px;
  }
`;

export const ThemeTitle = styled.div`
  flex: 1;
  color: black;
  ${theme.media.mobile} {
    flex: unset;
  }
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

  ${theme.media.mobile} {
    margin-bottom: 30px;
  }
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

  ${theme.media.mobile} {
    font-size: 1.3rem;
  }
`;

export const ClusterTitle = styled.div`
  flex: 1;
  color: black;
`;

export const ToggleSwitch = styled.button`
  position: relative;
  width: 35px;
  height: 16px;
  background-color: ${props => props.$isActive ? 'black' : '#ccc'};
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
  outline: none;

  &:hover {
    background-color: ${props => props.$isActive ? 'black' : '#bbb'};
  }

  &:focus {
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
  }

  ${theme.media.mobile} {
    margin-top: 1px;
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


