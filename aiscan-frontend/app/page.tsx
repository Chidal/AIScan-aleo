"use client";

import Link from 'next/link';
import WalletConnect from '@/components/WalletConnect';
import { motion, Variants } from 'framer-motion'; // Import Variants
import { useState } from 'react';

// Explicitly type variants as Variants
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut', // Valid easing function
    },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2, // Optional: improves stagger effect
    },
  },
};

export default function Home() {
  const [init, setInit] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 text-white flex flex-col">
      <motion.header
        className="flex justify-between items-center p-6 lg:p-12"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-500 text-shadow-glow">
          AIScan
        </h1>
        <WalletConnect />
      </motion.header>
      <motion.main
        className="flex-grow flex flex-col items-center justify-center px-4 md:px-8 text-center"
        initial="hidden"
        animate={init ? 'visible' : 'hidden'}
        variants={staggerContainer}
      >
        <motion.h2
          className="text-4xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-500 text-shadow-glow"
          variants={fadeIn}
        >
          Real-Time Blockchain Analytics
        </motion.h2>
        <motion.p
          className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl"
          variants={fadeIn}
        >
          Explore the Aleo network with cutting-edge AI insights and real-time data visualization. Connect your wallet and dive into the future of blockchain analytics.
        </motion.p>
        <motion.div className="flex flex-col sm:flex-row gap-4" variants={fadeIn}>
          <Link
            href="/dashboard"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-all duration-300"
          >
            Explore Dashboard
          </Link>
          <Link
            href="/nerds"
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-all duration-300"
          >
            Developer Hub
          </Link>
        </motion.div>
      </motion.main>
      <motion.footer
        className="p-6 text-center text-gray-400"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <p>Powered by Aleo Network & AI Insights</p>
      </motion.footer>
    </div>
  );
}