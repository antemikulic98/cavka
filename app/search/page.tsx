'use client';

import { Suspense } from 'react';
import SearchResults from './SearchResults';

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
