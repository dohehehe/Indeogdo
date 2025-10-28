import "./globals.css";
import Providers from "@/components/Providers";
import MapContainer from "@/container/MapContainer";
import Navigation from "@/components/Navigation/Navigation";

export const metadata = {
  title: "인덕도",
  description: "인덕도 소개 사이트",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
