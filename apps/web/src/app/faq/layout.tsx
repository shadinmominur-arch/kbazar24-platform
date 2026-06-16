import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'FAQ | Kbazar Korean Cosmetics Store' },
  description: 'Answers about Kbazar product authenticity, delivery, bKash, Nagad, COD, returns, and skincare shopping support across Bangladesh.',
  alternates: { canonical: 'https://kbazar24.com/faq' },
  openGraph: {
    title: 'FAQ | Kbazar Korean Cosmetics Store',
    description: 'Find answers about delivery, payment, returns, authenticity, and more.',
    url: 'https://kbazar24.com/faq',
    siteName: 'Kbazar Korean Cosmetics Store',
    locale: 'en_BD',
    images: [{ url: 'https://kbazar24.com/images/hero-products.png', width: 1200, height: 630, alt: 'Kbazar Korean Cosmetics Store FAQ' }],
  },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
