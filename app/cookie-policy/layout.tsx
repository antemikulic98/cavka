import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'How Hit Rent Croatia uses cookies on hit-rent.com and how you can manage your preferences.',
  alternates: { canonical: '/cookie-policy' },
};

export default function CookiePolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
