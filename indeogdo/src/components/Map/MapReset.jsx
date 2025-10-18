import styled from '@emotion/styled';

const MapResetButton = styled.button`
  position: fixed;
  top: 70px;
  left: 20px;
  z-index: 9;
  background-color: white;
  border: 1px solid black;
  border-radius: 20px;
  padding: 12px 15px 12px 20px;
  font-size: 1.2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

function MapReset({ onReset }) {
  const handleClick = () => {
    if (onReset) {
      onReset();
    }
  };

  return (
    <MapResetButton onClick={handleClick}>
      Reset
    </MapResetButton>
  );
}

export default MapReset;