import * as S from '@/styles/admin/editButton.style';

function EditButton({ onEdit, onDelete }) {
  const handleEdit = (e) => {
    if (onEdit) {
      onEdit(e);
    }
  };

  const handleDelete = (e) => {
    if (onDelete) {
      onDelete(e);
    }
  };

  return (
    <S.EditButtonWrapper>
      <S.EditButton onClick={handleEdit}>수정</S.EditButton> <span>|</span>
      <S.EditButton onClick={handleDelete}>삭제</S.EditButton>
    </S.EditButtonWrapper>
  );
}

export default EditButton;