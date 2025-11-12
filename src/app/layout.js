import "./globals.css";
import Providers from "@/components/Providers";
import MapContainer from "@/container/MapContainer";
import Navigation from "@/components/Navigation/Navigation";

export const metadata = {
  // 기본 메타데이터
  title: "인덕도 : 인덕원 디지털맵",
  description: "인덕원 디지털맵 ‘인덕도’는 지금까지 인덕원을 중심으로 우리가 진행한 도시기록과 문화예술 프로젝트, 그리고 미래의 프로젝트가 하나의 공간에서 공유되는 플랫폼이다. \n\n‘인덕도’에 인덕원의 역사와 현재의 이야기 그리고 미래의 일들이 한눈에 보이게 기록하고 공유해 우리가 알고 있는 지역의 다채로운 모습을 알려 인덕원만의 정체성을 만들고 싶다. \n\n인덕원의 역사, 오래된 가옥, 골목 풍경, 동네 사람들, 개성 있는 작은 가게와 공방, 그리고 텃밭 등을 기록하고 공유하여 유흥가로서의 인덕원이 아닌 사람 사는 냄새가 물씬 나는 마을의 풍경을 소개한다. 또한, 물리적인 환경뿐만 아니라 지역 문화공간 ‘도시공상가’를 중심으로 창작자와 지역 주민이 함께하는 다양한 오프라인 커뮤니티 활동과 마을 사람들의 이야기를 ‘인덕도’에 차곡차곡 기록한다. 그 안에서 자연스럽게 새로운 관계와 추억들이 쌓이게 될 것이다. \n\n결과적으로, 디지털맵 ‘인덕도’는 일상과 추억을 공유하는 저장소가 된다.",
  keywords: ["인덕도", "인덕원", "디지털맵", "도시기록", "문화예술", "지역문화", "도시공상가", "인덕원 마을", "지역 커뮤니티"],
  authors: [
    {
      name: "",
      url: "",
    },
  ],
  creator: "",
  publisher: "",
  category: "디지털맵, 지역문화, 커뮤니티",
  metadataBase: typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : new URL("https://yourdomain.com"), // 사이트 기본 URL - 실제 도메인으로 변경 필요
  alternates: {
    canonical: "/",
    languages: {
      "ko-KR": "/ko",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon/logo.png", sizes: "any" },
    ],
    apple: [],
    other: [],
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SITE_URL
      ? process.env.NEXT_PUBLIC_SITE_URL
      : "https://yourdomain.com", // 실제 도메인으로 변경 필요
    siteName: "인덕도",
    title: "인덕도 : 인덕원 디지털맵",
    description: "인덕원 디지털맵 '인덕도'는 지금까지 인덕원을 중심으로 우리가 진행한 도시기록과 문화예술 프로젝트, 그리고 미래의 프로젝트가 하나의 공간에서 공유되는 플랫폼이다.",
    images: [
      {
        url: "/icon/logo.png",
        width: 1200, // 이미지 너비
        height: 630, // 이미지 높이
        alt: "인덕도 로고",
        type: "image/png",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    site: "", // Twitter 계정 (예: @username)
    creator: "", // 작성자 Twitter 계정
    title: "인덕도 : 인덕원 디지털맵",
    description: "인덕원 디지털맵 ‘인덕도’는 지금까지 인덕원을 중심으로 우리가 진행한 도시기록과 문화예술 프로젝트, 그리고 미래의 프로젝트가 하나의 공간에서 공유되는 플랫폼이다. \n\n‘인덕도’에 인덕원의 역사와 현재의 이야기 그리고 미래의 일들이 한눈에 보이게 기록하고 공유해 우리가 알고 있는 지역의 다채로운 모습을 알려 인덕원만의 정체성을 만들고 싶다. \n\n인덕원의 역사, 오래된 가옥, 골목 풍경, 동네 사람들, 개성 있는 작은 가게와 공방, 그리고 텃밭 등을 기록하고 공유하여 유흥가로서의 인덕원이 아닌 사람 사는 냄새가 물씬 나는 마을의 풍경을 소개한다. 또한, 물리적인 환경뿐만 아니라 지역 문화공간 ‘도시공상가’를 중심으로 창작자와 지역 주민이 함께하는 다양한 오프라인 커뮤니티 활동과 마을 사람들의 이야기를 ‘인덕도’에 차곡차곡 기록한다. 그 안에서 자연스럽게 새로운 관계와 추억들이 쌓이게 될 것이다. \n\n결과적으로, 디지털맵 ‘인덕도’는 일상과 추억을 공유하는 저장소가 된다.",
    images: ["/icon/logo.png"],
  },

  applicationName: "인덕도",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "인덕도",
  },
  other: {},
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body>
        <Providers>
          <MapContainer />
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}
