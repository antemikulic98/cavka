import type { Metadata } from 'next';
import Header from './components/Header';
import Hero from './components/Hero';
import CarCards from './components/CarCards';
import AboutUs from './components/AboutUs';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

export const metadata: Metadata = {
  title: { absolute: 'Hit Rent Croatia | Car Rental Split Airport & Transfers' },
  description: 'Hit Rent - car rental at Split Airport and Split city, plus private transfers along the Dalmatian coast. Family-owned service at competitive prices. Book now!',
  keywords: 'hit rent croatia, rent a car split, rent a car split airport, car rental croatia, airport transfer split, najam auta split, family owned car rental, croatia car hire',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Hit Rent | Car Rental & Transfers in Split, Croatia',
    description: 'Your trusted family-owned car rental service in Split. Quality vehicles at competitive prices, airport pickup and private transfers along the Dalmatian coast.',
    url: 'https://hit-rent.com',
    type: 'website',
  },
};

export default function Home() {
  return (
    <div className='min-h-screen bg-white'>
      <Header />
      <Hero />
      <CarCards />
      <AboutUs />
      <FAQ />
      <Footer />
    </div>
  );
}
