import * as S from '@/styles/admin/editButton.style';

function EditButton({ onEdit, onDelete }) {
  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <S.EditButtonWrapper>
      <S.EditButton onClick={handleEdit}>수정</S.EditButton> |
      <S.EditButton onClick={handleDelete}>삭제</S.EditButton>
    </S.EditButtonWrapper>
  );
}

export default EditButton;