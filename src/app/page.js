'use client';

import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Carousel from '@/components/Carousel';
import Footer from '@/components/Footer';
import Atmosphere from '@/components/Atmosphere';
import styles from './page.module.css';

export default function Home() {
  return (
    <>
      <Atmosphere />
      <Nav />
      <main className={styles.main}>
        <Hero />
        <Carousel />
      </main>
      <Footer />
    </>
  );
}
