import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'FAQ — Frequently Asked Questions | Emart Skincare Bangladesh' },
  description: 'Answers to common questions about Emart: product authenticity, delivery times, payment methods (bKash, Nagad, COD), returns, and shipping across Bangladesh.',
  alternates: { canonical: 'https://e-mart.com.bd/faq' },
  openGraph: {
    title: 'FAQ | Emart Skincare Bangladesh',
    description: 'Find answers about delivery, payment, returns, authenticity, and more.',
    url: 'https://e-mart.com.bd/faq',
    images: [{ url: 'https://e-mart.com.bd/images/hero-products.png', width: 1200, height: 630, alt: 'Emart Skincare Bangladesh FAQ' }],
  },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
