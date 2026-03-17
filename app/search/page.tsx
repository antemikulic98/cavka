'use client';

import { Suspense } from 'react';
import SearchResults from './SearchResults';

// Tell Next.js to skip pre-rendering this page (client component)
// Note: These exports are ignored in client components, but SearchResults uses useSearchParams
// which naturally makes the page dynamic

export default function SearchPage() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <Suspense
        fallback={
          <div className='flex justify-center items-center h-screen'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-800'></div>
          </div>
        }
      >
        <SearchResults />
      </Suspense>
    </div>
  );
}
