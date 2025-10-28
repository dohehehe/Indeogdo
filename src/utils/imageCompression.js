/**
 * 이미지 압축 유틸 함수
 * 1MB를 넘는 이미지를 압축하여 1MB 이하로 만듭니다.
 */

/**
 * 이미지 파일을 압축합니다.
 * @param {File} file - 압축할 이미지 파일
 * @param {number} maxSizeInMB - 최대 파일 크기 (MB 단위, 기본값: 1)
 * @param {number} quality - 압축 품질 (0.1 ~ 1.0, 기본값: 0.8)
 * @returns {Promise<File>} 압축된 이미지 파일
 */
export const compressImageToWebP = (file, maxSizeInMB = 0.5, initialQuality = 0.8) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return resolve(file);

    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size <= maxSizeInBytes) return resolve(file);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = async () => {
      let { width, height } = img;

      const maxDimension = 1920;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const outputType = 'image/webp';
      let quality = initialQuality;

      const compressLoop = () => {
        return new Promise((res, rej) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) return rej(new Error('이미지 압축 실패'));
              if (blob.size <= maxSizeInBytes || quality <= 0.1) {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
                  type: outputType,
                  lastModified: Date.now(),
                });
                res(compressedFile);
              } else {
                quality -= 0.1;
                res(compressLoop()); // 재귀로 반복 압축
              }
            },
            outputType,
            quality
          );
        });
      };

      try {
        const compressedFile = await compressLoop();
        resolve(compressedFile);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error('이미지 로드 실패'));
    const reader = new FileReader();
    reader.onload = (e) => (img.src = e.target.result);
    reader.onerror = () => reject(new Error('파일 읽기 실패'));
    reader.readAsDataURL(file);
  });
};

/**
 * 이미지 파일의 크기를 확인하고 필요시 압축합니다.
 * @param {File} file - 확인할 이미지 파일
 * @param {number} maxSizeInMB - 최대 파일 크기 (MB 단위, 기본값: 1)
 * @returns {Promise<File>} 압축된 이미지 파일 또는 원본 파일
 */
export const checkAndCompressImage = async (file, maxSizeInMB = 1) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  if (file.size <= maxSizeInBytes) {
    return file; // 압축 불필요
  }

  try {
    console.log(`이미지 압축 중... (원본: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    const compressedFile = await compressImageToWebP(file, maxSizeInMB);
    console.log(`압축 완료: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
    return compressedFile;
  } catch (error) {
    console.error('이미지 압축 실패:', error);
    return file; // 압축 실패시 원본 반환
  }
};

/**
 * 이미지 파일의 정보를 로그로 출력합니다.
 * @param {File} file - 확인할 이미지 파일
 * @param {string} label - 로그 라벨
 */
export const logImageInfo = (file, label = '이미지') => {
  const sizeInMB = (file.size / 1024 / 1024).toFixed(2);
  console.log(`${label}: ${file.name} (${sizeInMB}MB, ${file.type})`);
};
