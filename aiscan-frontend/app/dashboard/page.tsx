"use client";

import TransactionTracker from '@/components/TransactionTracker';
import BlockExplorer from '@/components/BlockExplorer';
import AIInsights from '@/components/AIInsights';
import WalletConnect from '@/components/WalletConnect';
import CrossChainOverview from '@/components/CrossChainOverview'; // Import the new component
import { motion, Variants } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Transaction } from '@/types';

// Framer Motion Variants
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
};

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Real-time EventSource (only runs in browser)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const eventSource = new EventSource('/api/events');

    eventSource.onmessage = (event) => {
      try {
        const newTx: Transaction = JSON.parse(event.data);
        setTransactions((prev) => [newTx, ...prev].slice(0, 50));
      } catch (err) {
        console.error("Failed to parse event:", err);
      }
    };

    eventSource.onerror = () => {
      console.warn("EventSource failed. Retrying...");
      setIsConnected(false);
    };

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 text-white overflow-x-hidden">
      {/* Header */}
      <motion.header
        className="flex flex-col sm:flex-row justify-between items-center p-6 lg:p-12 gap-4"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-lg animate-pulse">
          AIScan
        </h1>
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full animate-ping ${
              isConnected ? 'bg-green-400' : 'bg-red-500'
            }`}
          />
          <span className="text-sm font-medium">
            {isConnected ? 'Live' : 'Reconnecting...'}
          </span>
          <WalletConnect />
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main
        className="max-w-7xl mx-auto px-4 md:px-8 py-8"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.h2
          className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-10 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-purple-400 to-pink-500 drop-shadow-md"
          variants={fadeIn}
        >
          Real-Time AIScan Chain Intelligence
        </motion.h2>

        {/* Feature Grid – Updated for 4 cards (AggLayer overview added) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
          {/* Transaction Tracker */}
          <motion.div
            className="relative bg-gray-800/40 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-cyan-500/30 overflow-hidden group"
            variants={fadeIn}
            whileHover={{ scale: 1.02, borderColor: 'rgba(34, 211, 238, 0.6)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <TransactionTracker />
          </motion.div>

          {/* Block Explorer */}
          <motion.div
            className="relative bg-gray-800/40 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden group"
            variants={fadeIn}
            whileHover={{ scale: 1.02, borderColor: 'rgba(168, 85, 247, 0.6)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <BlockExplorer />
          </motion.div>

          {/* AI Insights */}
          <motion.div
            className="relative bg-gray-800/40 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-pink-500/30 overflow-hidden group"
            variants={fadeIn}
            whileHover={{ scale: 1.02, borderColor: 'rgba(236, 72, 153, 0.6)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-yellow-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <AIInsights transactions={transactions} />
          </motion.div>

          {/* AggLayer Cross-Chain Overview */}
          <motion.div
            variants={fadeIn}
            whileHover={{ scale: 1.02 }}
          >
            <CrossChainOverview />
          </motion.div>
        </div>

        {/* Connection Status Bar */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-sm text-gray-400">
            Streaming live from <span className="text-cyan-400 font-mono">Aleo Mainnet</span> ·{' '}
            {transactions.length} events cached
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Mainnet Contract: <span className="font-mono text-cyan-400">0xd9aC52cCaD325f96398A06ADad409B30b3768d24</span>
          </p>
        </motion.div>
      </motion.main>
    </div>
  );
}