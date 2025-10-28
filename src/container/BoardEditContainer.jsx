import * as S from '@/styles/Sites/board.style';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@/components/admin/Editor';
import useIcon from '@/hooks/useIcon';

function BoardEditContainer({ siteData, onChange }) {
  const editorRef = useRef(null);
  const [editorData, setEditorData] = useState({ blocks: [] });
  const { icons, loading: iconsLoading, fetchIcons } = useIcon();

  const { register, watch, reset, handleSubmit, setValue } = useForm({
    defaultValues: {
      title: siteData?.title || '',
      address: siteData?.address || '',
      iconId: siteData?.icon?.id || '',
    }
  });

  const [iconOpen, setIconOpen] = useState(false);
  const iconWrapRef = useRef(null);

  const onSubmit = (data) => {
    console.log(data);
  };

  useEffect(() => {
    reset({
      title: siteData?.title || '',
      address: siteData?.address || '',
      iconId: siteData?.icon?.id || '',
    });
    setEditorData({ blocks: siteData?.contents || [] });
  }, [siteData?.title, siteData?.address, siteData?.contents, siteData?.icon?.id, reset]);

  const watched = watch();

  useEffect(() => {
    if (typeof onChange === 'function') {
      onChange({ title: watched.title, address: watched.address, iconId: watched.iconId });
    }
  }, [watched.title, watched.address, watched.iconId, onChange]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!iconWrapRef.current) return;
      if (!iconWrapRef.current.contains(e.target)) {
        setIconOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const selectedIcon = icons?.find(i => String(i.id) === String(watched.iconId)) || siteData?.icon;

  const handleOpenIconSelect = async () => {
    setIconOpen((prev) => !prev);
    if (!icons || icons.length === 0) {
      await fetchIcons?.();
    }
  };

  const handlePickIcon = (icon) => {
    setValue('iconId', icon.id, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    setIconOpen(false);
  };

  return (
    <>
      <S.BoardEditWrapper>
        <S.BoardEditForm onSubmit={handleSubmit(onSubmit)}>
          <S.BoardClusterWrapper>
            <S.BoardClusterIcon src={selectedIcon?.img} alt={selectedIcon?.name} />
            <S.BoardClusterTitle>{siteData?.cluster?.title}</S.BoardClusterTitle>
          </S.BoardClusterWrapper>

          <S.BoardInputGroup>

            <S.BoardInputGroup>
              <S.BoardInputLabel>아이콘</S.BoardInputLabel>
              {/* hidden input to keep RHF field */}
              <input type="hidden" {...register('iconId')} />

              <S.IconSelectWrapper ref={iconWrapRef}>
                <S.IconSelectButton type="button" onClick={handleOpenIconSelect}>
                  {selectedIcon?.img ? (
                    <S.IconThumb src={selectedIcon.img} alt={selectedIcon?.name || 'icon'} />
                  ) : (
                    <S.IconThumb src="" alt="no-icon" style={{ visibility: 'hidden' }} />
                  )}
                </S.IconSelectButton>

                {iconOpen && (
                  <S.IconSelectList>
                    {icons?.map((icon) => (
                      <S.IconSelectItem key={icon.id} onClick={() => handlePickIcon(icon)}>
                        <S.IconThumb src={icon.img} alt={icon.name || `icon-${icon.id}`} />
                      </S.IconSelectItem>
                    ))}
                  </S.IconSelectList>
                )}
              </S.IconSelectWrapper>
            </S.BoardInputGroup>

            <S.BoardInputLabel htmlFor="title">제목</S.BoardInputLabel>
            <S.BoardTextInput
              type="text"
              placeholder="제목을 입력하세요"
              id="title"
              name="title"
              required
              {...register('title')}
            />
          </S.BoardInputGroup>

          <S.BoardInputGroup>
            <S.BoardInputLabel htmlFor="address" >주소</S.BoardInputLabel>
            <S.BoardTextInput
              type="text"
              placeholder="주소를 입력하세요"
              id="address"
              name="address"
              required
              {...register('address')}
            />
          </S.BoardInputGroup>



          <S.BoardInputGroup>
            <S.BoardInputLabel htmlFor="contents">내용</S.BoardInputLabel>
            <Editor ref={editorRef} data={editorData} />
          </S.BoardInputGroup>
        </S.BoardEditForm>
      </S.BoardEditWrapper>
    </>
  );
}

export default BoardEditContainer;