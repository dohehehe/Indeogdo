'use client';
import styled from '@emotion/styled';

const AddButtonWrapper = styled.button`
  background-color: #fff;
  border: 1px solid gray;
  border-radius: 12px;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  color: black;
  // position: relative;
  // left: 50%;
  // transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -10px;
  gap: 5px;

  &:hover {
    background-color: #f0f0f0;
  }
`;

function AddButton({ onClick }) {

  return (
    <AddButtonWrapper type="button" onClick={onClick}>
      <span>+</span>
      <span>추가하기</span>
    </AddButtonWrapper>
  );
}

export default AddButton;