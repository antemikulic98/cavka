// This file prevents Next.js from pre-rendering /search page
// The search page uses URL search params which are only available at runtime

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;
