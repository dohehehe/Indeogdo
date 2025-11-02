import { getSiteData } from '@/lib/siteData';

// 동적 메타데이터 생성 함수
export async function generateMetadata({ params }) {
  try {
    const { id } = await params;
    const { data, error } = await getSiteData(id);

    if (error || !data) {
      return {
        title: "인덕도 : 사이트 상세 페이지",
        description: "인덕도 : 사이트 상세 페이지",
      };
    }

    // 사이트 데이터로 메타데이터 구성
    const siteTitle = data.title || '사이트';
    const siteAddress = data.address || '';
    const clusterTitle = data.cluster?.title || '';
    const themeTitle = data.cluster?.theme?.title || '';
    const siteDescription = `${themeTitle} : ${clusterTitle} - ${siteTitle} (${data.address})`;


    // 이미지 URL (icon이 있으면 사용, 없으면 기본 로고)
    const imageUrl = data.icon?.img || '/icon/logo.png';
    const siteUrl = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/sites/${id}`
      : `https://yourdomain.com/sites/${id}`;

    // 키워드 생성
    const keywords = [
      siteTitle,
      siteAddress,
      clusterTitle,
      themeTitle,
      "인덕도",
      "인덕원",
      "디지털맵",
      "도시기록",
    ].filter(Boolean);

    return {
      title: `${siteTitle} : 인덕도`,
      description: siteDescription,
      keywords: keywords,

      // Open Graph
      openGraph: {
        title: `${siteTitle} : 인덕도`,
        description: siteDescription,
        url: siteUrl,
        siteName: "인덕도",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: siteTitle,
          },
        ],
        locale: 'ko_KR',
        type: 'website',
      },

      // Twitter Card
      twitter: {
        card: 'summary_large_image',
        title: `${siteTitle} : 인덕도`,
        description: siteDescription,
        images: [imageUrl],
      },

      alternates: {
        canonical: `/sites/${id}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    // 에러 발생 시 기본 메타데이터 반환
    return {
      title: "인덕도 : 사이트 상세 페이지",
      description: "인덕도 : 사이트 상세 페이지",
    };
  }
}

export default function SitePageLayout({ children }) {
  return (
    <>
      {children}
    </>
  );
}
