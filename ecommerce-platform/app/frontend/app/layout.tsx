import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { getPublicSettings } from "../lib/settings";
import { getImageUrl } from "../lib/image-url";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

export async function generateMetadata(): Promise<Metadata> {
  const { general, seo } = await getPublicSettings();
  const favicon = general.faviconUrl ? getImageUrl(general.faviconUrl) : "/favicon.ico";

  return {
    title: {
      default: seo.metaTitle || general.storeName || "TechBite - Sàn Thương Mại Điện Tử & Nạp Năng Lượng Lập Trình Viên",
      template: `%s | ${general.storeName || "TechBite"}`,
    },
    description: seo.metaDescription || "Combo Thức Khuya giảm giá 20% — Chỉ dành cho anh em chạy deadline. Giao nhanh 15 phút.",
    keywords: seo.metaKeywords ? seo.metaKeywords.split(',').map((k) => k.trim()) : undefined,
    alternates: seo.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    robots: seo.metaRobots ? seo.metaRobots : 'index, follow',
    verification: seo.googleSiteVerification ? { google: seo.googleSiteVerification } : undefined,
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
    openGraph: {
      title: seo.ogTitle || seo.metaTitle || general.storeName,
      description: seo.ogDescription || seo.metaDescription,
      images: seo.ogImageUrl ? [getImageUrl(seo.ogImageUrl)] : undefined,
      type: 'website',
      url: seo.canonicalUrl || undefined,
      siteName: general.storeName || 'TechBite',
    },
    twitter: {
      card: (seo.twitterCard as 'summary' | 'summary_large_image') || 'summary_large_image',
      site: seo.twitterSite || undefined,
      title: seo.ogTitle || seo.metaTitle || general.storeName,
      description: seo.ogDescription || seo.metaDescription,
      images: seo.ogImageUrl ? [getImageUrl(seo.ogImageUrl)] : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { seo } = await getPublicSettings();

  return (
    <html lang="vi">
      <head>
        {/* Custom Head Script (Google Tag Manager / Analytics) */}
        {seo.customHeadScript && (
          <script
            id="custom-head-script"
            dangerouslySetInnerHTML={{ __html: seo.customHeadScript }}
          />
        )}
      </head>
      <body className={`${inter.variable} antialiased`}>
        {/* Google Analytics 4 Script nếu được cấu hình */}
        {seo.googleAnalyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${seo.googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${seo.googleAnalyticsId}');
              `}
            </Script>
          </>
        )}

        {children}

        {/* Custom Body Script */}
        {seo.customBodyScript && (
          <script
            id="custom-body-script"
            dangerouslySetInnerHTML={{ __html: seo.customBodyScript }}
          />
        )}
      </body>
    </html>
  );
}
