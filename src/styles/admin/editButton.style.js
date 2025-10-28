import styled from '@emotion/styled';
import { theme } from '@/styles/Theme';

export const EditButtonWrapper = styled.div`
  display: flex;
  gap: 5px;
`;

export const EditButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: black;
  transition: all 0.2s ease-in-out;

  &:hover {
    font-weight: 800;
  }
`;