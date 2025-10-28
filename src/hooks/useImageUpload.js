import { useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { checkAndCompressImage, logImageInfo } from '@/utils/imageCompression';
import { uploadImage as uploadImageApi, uploadMultipleImages as uploadMultipleImagesApi } from '@/utils/api/image-upload-api';

/**
 * 이미지 업로드를 위한 커스텀 훅
 * @param {Object} options - 업로드 옵션
 * @param {string} options.bucket - Supabase 버킷 이름 (기본값: 'gallery')
 * @param {number} options.maxSizeInMB - 최대 파일 크기 (MB 단위, 기본값: 1)
 * @returns {Function} 이미지 업로드 함수
 */
export const useImageUpload = (options = {}) => {
  const { bucket = 'gallery', maxSizeInMB = 1 } = options;

  // Supabase 클라이언트 생성
  const supabase = createClient();

  /**
   * 로컬 프리뷰용 이미지 처리 (스토리지 업로드 없음)
   * @param {File} file - 처리할 이미지 파일
   * @returns {Promise<Object>} 처리 결과
   */
  const processImageForPreview = useCallback(async (file) => {
    try {
      // 이미지 정보 로그
      logImageInfo(file, '프리뷰 처리 전');

      // 이미지 압축 (maxSizeInMB 초과시)
      const compressedFile = await checkAndCompressImage(file, maxSizeInMB);

      // 압축 후 이미지 정보 로그
      if (compressedFile !== file) {
        logImageInfo(compressedFile, '압축 후');
      }

      // 로컬 URL 생성
      const localUrl = URL.createObjectURL(compressedFile);

      console.log('이미지 프리뷰 생성 성공:', localUrl);

      return {
        success: 1,
        file: {
          url: localUrl,
          name: compressedFile.name,
          size: compressedFile.size,
          originalFile: compressedFile, // 나중에 업로드할 때 사용
        }
      };
    } catch (error) {
      console.error('이미지 프리뷰 처리 오류:', error);
      return {
        success: 0,
        error: error.message || '이미지 처리에 실패했습니다.'
      };
    }
  }, [maxSizeInMB]);

  /**
   * 이미지 업로드 핸들러 (서버사이드 업로드)
   * @param {File} file - 업로드할 이미지 파일
   * @returns {Promise<Object>} 업로드 결과
   */
  const uploadImageToServer = useCallback(async (file) => {
    try {
      console.log('uploadImageToServer 시작:', { file, bucket, maxSizeInMB });

      // 이미지 정보 로그
      logImageInfo(file, '서버 업로드 전');

      // 이미지 압축 (maxSizeInMB 초과시)
      const compressedFile = await checkAndCompressImage(file, maxSizeInMB);

      // 압축 후 이미지 정보 로그
      if (compressedFile !== file) {
        logImageInfo(compressedFile, '압축 후');
      }

      // 서버사이드 이미지 업로드
      const result = await uploadImageApi(compressedFile, bucket, maxSizeInMB);

      console.log('uploadImage 결과:', result);

      if (result && result.success) {
        console.log('서버사이드 이미지 업로드 성공:', result.data?.url);
        return {
          success: 1,
          file: {
            url: result.data?.url,
            name: result.data?.name,
            size: result.data?.size,
          }
        };
      } else {
        console.error('이미지 업로드 실패:', result);
        throw new Error(result?.error || '이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('서버사이드 이미지 업로드 오류:', error);
      return {
        success: 0,
        error: error.message || '이미지 업로드에 실패했습니다.'
      };
    }
  }, [bucket, maxSizeInMB]);

  /**
   * 이미지 업로드 핸들러 (기존 클라이언트 업로드 - 호환성 유지)
   * @param {File} file - 업로드할 이미지 파일
   * @returns {Promise<Object>} 업로드 결과
   */
  const uploadImage = useCallback(async (file) => {
    try {
      // 이미지 정보 로그
      logImageInfo(file, '업로드 전');

      // 이미지 압축 (maxSizeInMB 초과시)
      const compressedFile = await checkAndCompressImage(file, maxSizeInMB);

      // 압축 후 이미지 정보 로그
      if (compressedFile !== file) {
        logImageInfo(compressedFile, '압축 후');
      }

      // 파일 확장자 추출
      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Supabase Storage에 업로드
      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, compressedFile);

      if (uploadError) {
        throw uploadError;
      }

      // 업로드된 이미지의 공개 URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      console.log('이미지 업로드 성공:', publicUrl);

      return {
        success: 1,
        file: {
          url: publicUrl,
          name: compressedFile.name,
          size: compressedFile.size,
        }
      };
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      return {
        success: 0,
        error: error.message || '이미지 업로드에 실패했습니다.'
      };
    }
  }, [bucket, maxSizeInMB, supabase]);

  /**
   * 여러 이미지 업로드 핸들러
   * @param {File[]} files - 업로드할 이미지 파일 배열
   * @returns {Promise<Object[]>} 업로드 결과 배열
   */
  const uploadMultipleImages = useCallback(async (files) => {
    const uploadPromises = files.map(file => uploadImage(file));
    const results = await Promise.all(uploadPromises);

    return results;
  }, [uploadImage]);

  /**
   * 이미지 삭제 핸들러
   * @param {string|Array<string>} filePath - 삭제할 파일 경로 (문자열 또는 배열)
   * @returns {Promise<Object>} 삭제 결과
   */
  const deleteImage = useCallback(async (filePath) => {
    try {
      // 배열이 아닌 경우 배열로 변환
      const paths = Array.isArray(filePath) ? filePath : [filePath];

      const { error } = await supabase.storage
        .from(bucket)
        .remove(paths);

      if (error) {
        throw error;
      }

      console.log('이미지 삭제 성공:', paths);
      return {
        success: true,
        message: '이미지가 삭제되었습니다.'
      };
    } catch (error) {
      console.error('이미지 삭제 오류:', error);
      return {
        success: false,
        error: error.message || '이미지 삭제에 실패했습니다.'
      };
    }
  }, [bucket, supabase]);

  return {
    uploadImage, // 기존 클라이언트 업로드 (호환성 유지)
    uploadImageToServer, // 새로운 서버사이드 업로드
    uploadMultipleImages,
    deleteImage,
    deleteImageFromServer: deleteImage, // 별칭 추가
    processImageForPreview,
  };
};
