import Link from 'next/link';
import Header from './components/Header';
import Footer from './components/Footer';

export default function NotFound() {
  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      <div className='bg-green-800'>
        <Header />
        <div className='h-24' />
      </div>
      <main className='flex-1 flex items-center justify-center px-6 py-20'>
        <div className='text-center max-w-md'>
          <p className='font-poppins text-6xl font-bold text-green-800 mb-4'>404</p>
          <h1 className='font-poppins text-2xl font-bold text-gray-900 mb-3'>
            Page not found
          </h1>
          <p className='font-poppins text-gray-600 mb-8'>
            The page you are looking for does not exist or has moved.
          </p>
          <div className='flex flex-col sm:flex-row gap-3 justify-center'>
            <Link
              href='/'
              className='font-poppins bg-green-800 hover:bg-green-900 text-white font-bold px-6 py-3 rounded-lg'
            >
              Back to homepage
            </Link>
            <Link
              href='/my-bookings'
              className='font-poppins border border-green-800 text-green-800 hover:bg-green-50 font-bold px-6 py-3 rounded-lg'
            >
              Manage booking
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
