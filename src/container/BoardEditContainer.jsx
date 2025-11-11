import * as S from '@/styles/Sites/board.style';
import { useEffect, useRef, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import Editor from '@/components/admin/Editor';
import useIcon from '@/hooks/useIcon';
import { useRouter } from 'next/navigation';
import * as EB from '@/styles/admin/editButton.style';
import useSites from '@/hooks/useSites';
import useCluster from '@/hooks/useCluster';
import AddressSearch from '@/components/admin/AddressSearch';
import useAddress from '@/hooks/useAddress';

function BoardEditContainer({ siteData, onChange, clusterId }) {
  const editorRef = useRef(null);
  const [editorData, setEditorData] = useState({ blocks: [] });
  const { icons, loading: iconsLoading, fetchIcons } = useIcon();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const { updateSite, createSite } = useSites();
  const { clusters, fetchClusters } = useCluster();
  const { createAddress, updateAddress, deleteAddress, fetchAddressesBySite } = useAddress();
  const originalAddressesRef = useRef([]);
  const removedAddressIdsRef = useRef(new Set());

  const {
    register,
    watch,
    reset,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: siteData?.title || '',
      iconId: siteData?.icon?.id || '',
      clusterId: clusterId || siteData?.cluster?.id || '',
      addresses: [
        {
          addressId: null,
          address: '',
          latitude: null,
          longitude: null,
        },
      ],
    },
  });

  const {
    fields: addressFields,
    append: appendAddress,
    remove: removeAddress,
    replace: replaceAddresses,
  } = useFieldArray({
    control,
    name: 'addresses',
  });

  const [iconOpen, setIconOpen] = useState(false);
  const iconWrapRef = useRef(null);

  const onSubmit = async () => {
    if (saving) return;

    const isEditing = !!siteData?.id;

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

      let result;
      const siteId = siteData?.id;
      if (isEditing) {
        // 수정 모드
        result = await updateSite(siteData.id, payload);
        if (!result) throw new Error('저장에 실패했습니다.');
      } else {
        // 생성 모드
        if (!payload.cluster_id) {
          throw new Error('이 장소가 들어갈 주제를 선택해주세요.');
        }
        result = await createSite(payload);
        if (!result) throw new Error('저장에 실패했습니다.');
      }

      const targetSiteId = isEditing ? siteId : result.id;
      const submittedAddresses = (formValues.addresses || []).map((entry) => ({
        addressId: entry.addressId || null,
        address: entry.address?.trim() || '',
        latitude: entry.latitude ?? null,
        longitude: entry.longitude ?? null,
      }));

      const originalAddressesMap = new Map(
        (originalAddressesRef.current || []).map((addr) => [addr.addressId, addr])
      );

      const addressesToCreate = [];
      const addressesToUpdate = [];

      submittedAddresses.forEach((entry) => {
        if (entry.addressId) {
          if (!entry.address) {
            removedAddressIdsRef.current.add(entry.addressId);
            return;
          }

          const original = originalAddressesMap.get(entry.addressId);

          if (
            !original ||
            original.address !== entry.address ||
            original.latitude !== entry.latitude ||
            original.longitude !== entry.longitude
          ) {
            addressesToUpdate.push(entry);
          }
          originalAddressesMap.delete(entry.addressId);
        } else if (entry.address || entry.latitude || entry.longitude) {
          addressesToCreate.push(entry);
        }
      });

      // 나머지 original은 폼에서 제거된 것
      const addressesToDelete = new Set(removedAddressIdsRef.current);
      originalAddressesMap.forEach((addr) => {
        if (addr?.addressId) {
          addressesToDelete.add(addr.addressId);
        }
      });

      if (addressesToDelete.size > 0) {
        await Promise.all(
          Array.from(addressesToDelete).map((addressId) =>
            deleteAddress(addressId).catch((err) => {
              console.error('Delete address error:', err);
              throw err;
            })
          )
        );
      }

      if (addressesToUpdate.length > 0) {
        await Promise.all(
          addressesToUpdate.map((addr) =>
            updateAddress(addr.addressId, {
              name: addr.address,
              latitude: addr.latitude,
              longitude: addr.longitude,
              site_id: targetSiteId,
            }).catch((err) => {
              console.error('Update address error:', err);
              throw err;
            })
          )
        );
      }

      if (addressesToCreate.length > 0) {
        await Promise.all(
          addressesToCreate.map((addr) =>
            createAddress({
              site_id: targetSiteId,
              name: addr.address,
              latitude: addr.latitude,
              longitude: addr.longitude,
            }).catch((err) => {
              console.error('Create address error:', err);
              throw err;
            })
          )
        );
      }

      removedAddressIdsRef.current = new Set();

      if (!isEditing) {
        originalAddressesRef.current = [];
      }

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
    const loadAddresses = async () => {
      const defaultAddress = [
        {
          addressId: null,
          address: '',
          latitude: null,
          longitude: null,
        },
      ];

      let addressesForForm = defaultAddress;

      if (siteData?.id) {
        try {
          const fetched = await fetchAddressesBySite(siteData.id);
          if (fetched && fetched.length > 0) {
            addressesForForm = fetched.map((addr) => ({
              addressId: addr.id,
              address: addr.name || '',
              latitude: addr.latitude ?? null,
              longitude: addr.longitude ?? null,
            }));
            originalAddressesRef.current = fetched.map((addr) => ({
              addressId: addr.id,
              address: addr.name || '',
              latitude: addr.latitude ?? null,
              longitude: addr.longitude ?? null,
            }));
          } else {
            originalAddressesRef.current = [];
          }
        } catch (error) {
          console.error('Failed to fetch addresses:', error);
          originalAddressesRef.current = [];
        }
      } else {
        originalAddressesRef.current = [];
      }

      reset({
        title: siteData?.title || '',
        iconId: siteData?.icon?.id || '',
        clusterId: clusterId || siteData?.cluster?.id || '',
        addresses: addressesForForm,
      });
      replaceAddresses(addressesForForm);
      setEditorData({ blocks: siteData?.contents || [] });
    };

    loadAddresses();
  }, [siteData?.id, siteData?.title, siteData?.contents, siteData?.icon?.id, clusterId, fetchAddressesBySite, reset, replaceAddresses]);

  const watched = watch();

  useEffect(() => {
    if (typeof onChange === 'function') {
      onChange({
        title: watched.title,
        iconId: watched.iconId,
        clusterId: watched.clusterId,
        addresses: watched.addresses,
      });
    }
  }, [watched.title, watched.iconId, watched.clusterId, watched.addresses, onChange]);

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

  const handleAddAddress = () => {
    appendAddress({
      addressId: null,
      address: '',
      latitude: null,
      longitude: null,
    });
  };

  const handleRemoveAddress = (index) => {
    const field = addressFields[index];
    if (field?.addressId) {
      removedAddressIdsRef.current.add(field.addressId);
    }
    removeAddress(index);
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
                <option value="">주제 선택</option>
                {clusters?.map((cl) => (
                  <option key={cl.id} value={cl.id}>
                    {(cl.theme?.title || '주제없음')} - {cl.title}
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
            <S.AddressList>
              {addressFields.map((field, index) => (
                <S.AddressItem key={field.id ?? `address-${index}`}>
                  <S.AddressInputWrapper>
                    <AddressSearch
                      setValue={setValue}
                      register={register}
                      namePrefix={`addresses.${index}`}
                      error={errors?.addresses?.[index]?.address?.message}
                    />
                  </S.AddressInputWrapper>
                  {addressFields.length > 1 && (
                    <S.AddressActions>
                      <S.AddressRemoveButton
                        type="button"
                        onClick={() => handleRemoveAddress(index)}
                      >
                        삭제
                      </S.AddressRemoveButton>
                    </S.AddressActions>
                  )}
                </S.AddressItem>
              ))}
              <S.AddressAddButton type="button" onClick={handleAddAddress}>
                + 주소 추가
              </S.AddressAddButton>
            </S.AddressList>
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