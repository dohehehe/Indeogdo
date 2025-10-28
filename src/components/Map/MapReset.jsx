import styled from '@emotion/styled';

const MapResetButton = styled.button`
  position: fixed;
  top: 65px;
  left: 325px;
  z-index: 29;
  background-color: white;
  border: 1.6px solid black;
  border-radius: 50%;
  padding: 5px;
  padding-left: 6px;
  font-size: 1.2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.3s ease-in-out;
  
  &:hover {
    background-color: #f0f0f0;
    transform: scale(1.1);
  }
`;

const MapResetIcon = styled.img`
  width: 30px;
  height: 30px;
  object-fit: contain;
`;

function MapReset({ onReset }) {
  const handleClick = () => {
    if (onReset) {
      onReset();
    }
  };

  return (
    <MapResetButton onClick={handleClick} title="도시공상가로 돌아가기">
      <MapResetIcon src="/icon/logo.png" alt="map-reset" />
    </MapResetButton>
  );
}

export default MapReset;