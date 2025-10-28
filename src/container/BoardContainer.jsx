import * as S from '@/styles/Sites/board.style';
import EditorBoardRender from '@/components/Sites/EditorBoardRender';

function BoardContainer({ siteData }) {
  return (
    <>

      <S.BoardDetailWrapper>
        <S.BoardClusterWrapper>
          <S.BoardClusterIcon src={siteData?.icon?.img} alt={siteData?.icon?.name} />
          <S.BoardClusterTitle>{siteData?.cluster?.title}</S.BoardClusterTitle>
        </S.BoardClusterWrapper>
        <S.BoardTitle>{siteData?.title}</S.BoardTitle>
        <S.BoardAddress>{siteData?.address}</S.BoardAddress>
        <EditorBoardRender item={siteData?.contents} />
      </S.BoardDetailWrapper>
    </>
  );
}

export default BoardContainer;