import * as S from '@/styles/Sites/board.style';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@/components/admin/Editor';
import useIcon from '@/hooks/useIcon';
import { useRouter } from 'next/navigation';
import * as EB from '@/styles/admin/editButton.style';
import useSites from '@/hooks/useSites';
import useCluster from '@/hooks/useCluster';

function BoardEditContainer({ siteData, onChange }) {
  const editorRef = useRef(null);
  const [editorData, setEditorData] = useState({ blocks: [] });
  const { icons, loading: iconsLoading, fetchIcons } = useIcon();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const { updateSite } = useSites();
  const { clusters, fetchClusters } = useCluster();

  const { register, watch, reset, handleSubmit, setValue } = useForm({
    defaultValues: {
      title: siteData?.title || '',
      address: siteData?.address || '',
      iconId: siteData?.icon?.id || '',
      clusterId: siteData?.cluster?.id || ''
    }
  });

  const [iconOpen, setIconOpen] = useState(false);
  const iconWrapRef = useRef(null);

  const onSubmit = async () => {
    if (!siteData?.id || saving) return;
    try {
      setSaving(true);
      let contentsBlocks = [];
      if (editorRef.current && editorRef.current.isReady()) {
        const saved = await editorRef.current.save();
        contentsBlocks = saved?.blocks || [];
      }

      const formValues = watch();
      const payload = {
        title: formValues.title || siteData?.title || '',
        address: formValues.address || siteData?.address || '',
        contents: contentsBlocks,
      };

      // icon_id
      const iconRaw = formValues.iconId;
      const iconFallback = siteData?.icon?.id;
      const iconToUse = iconRaw !== undefined && iconRaw !== null && iconRaw !== '' ? iconRaw : iconFallback;
      payload.icon_id = (iconToUse === '' || iconToUse === null || iconToUse === undefined) ? null : iconToUse;

      // cluster_id
      const clusterRaw = formValues.clusterId;
      const clusterFallback = siteData?.cluster?.id;
      const clusterToUse = clusterRaw !== undefined && clusterRaw !== null && clusterRaw !== '' ? clusterRaw : clusterFallback;
      if (clusterToUse !== undefined && clusterToUse !== null && clusterToUse !== '') {
        payload.cluster_id = clusterToUse;
      }

      const updated = await updateSite(siteData.id, payload);
      if (!updated) throw new Error('저장에 실패했습니다.');

      router.push('/admin');
    } catch (e) {
      alert(e.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin');
  };

  useEffect(() => {
    reset({
      title: siteData?.title || '',
      address: siteData?.address || '',
      iconId: siteData?.icon?.id || '',
      clusterId: siteData?.cluster?.id || ''
    });
    setEditorData({ blocks: siteData?.contents || [] });
  }, [siteData?.title, siteData?.address, siteData?.contents, siteData?.icon?.id, reset]);

  const watched = watch();

  useEffect(() => {
    if (typeof onChange === 'function') {
      onChange({ title: watched.title, address: watched.address, iconId: watched.iconId, clusterId: watched.clusterId });
    }
  }, [watched.title, watched.address, watched.iconId, watched.clusterId, onChange]);

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

  useEffect(() => {
    if (!clusters || clusters.length === 0) {
      fetchClusters();
    }
  }, [clusters, fetchClusters]);

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
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 50, transform: 'scale(1.4)', transformOrigin: 'right' }}>
          <EB.EditButtonWrapper>
            <EB.EditButton type="submit" disabled={saving} form="board-edit-form">{saving ? '저장 중...' : '저장'}</EB.EditButton> |
            <EB.EditButton type="button" onClick={handleCancel}>취소</EB.EditButton>
          </EB.EditButtonWrapper>
        </div>
        <S.BoardEditForm id="board-edit-form" onSubmit={handleSubmit(onSubmit)}>
          <S.BoardHeaderWrapper>
            <S.IconSelectWrapper ref={iconWrapRef}>
              <input type="hidden" {...register('iconId')} />
              <S.IconSelectButton type="button" onClick={handleOpenIconSelect} aria-label="아이콘 선택" title="아이콘 선택" $iconOpen={!iconOpen}>
                {selectedIcon?.img && (
                  <S.IconThumb src={selectedIcon.img} alt={selectedIcon?.name || 'icon'} />
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

            <S.BoardClusterSelectWrapper>
              <S.BoardClusterSelect
                value={watched.clusterId || ''}
                onChange={(e) => setValue('clusterId', e.target.value, { shouldDirty: true, shouldTouch: true, shouldValidate: true })}
              >
                <option value="">클러스터 선택</option>
                {clusters?.map((cl) => (
                  <option key={cl.id} value={cl.id}>
                    {(cl.theme?.title || '테마없음')} - {cl.title}
                  </option>
                ))}
              </S.BoardClusterSelect>
              <input type="hidden" {...register('clusterId')} />
            </S.BoardClusterSelectWrapper>
          </S.BoardHeaderWrapper>

          <S.BoardInputGroup>
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