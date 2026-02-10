import type { Metadata } from 'next';
import Header from './components/Header';
import Hero from './components/Hero';
import CarCards from './components/CarCards';
import AboutUs from './components/AboutUs';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

export const metadata: Metadata = {
  title: 'Family Rent a Car Croatia | Premium Car Rental Zagreb, Split, Dubrovnik',
  description: 'Family Rent a Car - Premium car rental & transfers in Croatia. Quality vehicles in Zagreb, Split & Dubrovnik. Family-owned service at competitive prices. Book now!',
  keywords: 'family rent a car croatia, rent a car croatia, car rental croatia, rent a car zagreb, rent a car split, rent a car dubrovnik, airport transfer croatia, najam auta hrvatska, family owned car rental, croatia car hire',
  openGraph: {
    title: 'Family Rent a Car | Premium Car Rental in Croatia',
    description: 'Your trusted family-owned car rental service. Rent quality vehicles at competitive prices. Car rental and transfer services in Zagreb, Split, Dubrovnik and across Croatia.',
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
