import Header from './components/Header';
import Hero from './components/Hero';
import CarCards from './components/CarCards';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div className='min-h-screen bg-white'>
      <Header />
      <Hero />
      <CarCards />
      <Footer />
    </div>
  );
}
