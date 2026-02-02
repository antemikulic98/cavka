import type { Metadata } from 'next';
import Header from './components/Header';
import Hero from './components/Hero';
import CarCards from './components/CarCards';
import AboutUs from './components/AboutUs';
import Footer from './components/Footer';

export const metadata: Metadata = {
  title: 'HIT Rent a Car | Rent a Car Croatia | Car Rental & Transfer Services',
  description: 'HIT Rent a Car offers premium car rental and transfer services across Croatia. Rent quality vehicles in Zagreb, Split, Dubrovnik at competitive prices. Book your car online today!',
  keywords: 'rent a car croatia, car rental croatia, hit rent a car, rent a car zagreb, rent a car split, airport transfer, najam auta hrvatska',
  openGraph: {
    title: 'HIT Rent a Car | Premium Car Rental in Croatia',
    description: 'Rent quality vehicles at competitive prices. Car rental and transfer services in Zagreb, Split, Dubrovnik and across Croatia.',
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
      <Footer />
    </div>
  );
}
