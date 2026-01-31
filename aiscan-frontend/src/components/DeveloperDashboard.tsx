"use client";

import { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { ClipboardIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { Transaction, WalletActivity } from '@/types';

// Framer Motion Variants
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const DeveloperDashboard: React.FC = () => {
  const [events, setEvents] = useState<(Transaction | WalletActivity)[]>([]);
  const [search, setSearch] = useState('');
  const [aggregatedTVL, setAggregatedTVL] = useState(0);
  const [rwaTVL, setRwaTVL] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time events via SSE
  useEffect(() => {
    const eventSource = new EventSource('/api/events');
    eventSource.onmessage = (event) => {
      try {
        const newEvent: Transaction | WalletActivity = JSON.parse(event.data);
        setEvents((prev) => [newEvent, ...prev].slice(0, 100));
      } catch (err) {
        console.error('Parse error:', err);
      }
    };
    return () => eventSource.close();
  }, []);

  // Fetch AggLayer & RWA stats (Dec 2025 data proxies)
  useEffect(() => {
    Promise.all([
      fetch('https://api.llama.fi/chains').then(res => res.json()),
      fetch('https://api.rwa.xyz/v1/overview?network=polygon').then(res => res.json()).catch(() => ({ total: 1130000000 })),
    ])
      .then(([chains, rwa]) => {
        const polygonChains = chains.filter((c: any) => c.name.toLowerCase().includes('polygon'));
        const totalTVL = polygonChains.reduce((sum: number, c: any) => sum + c.tvl, 0);
        setAggregatedTVL(totalTVL);
        setRwaTVL(rwa.total || 1130000000);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // Filter events
  const filteredEvents = events.filter((e) =>
    JSON.stringify(e).toLowerCase().includes(search.toLowerCase())
  );

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied!');
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ['Type,Hash/Address,From,To,Amount,Token'];
    const rows = filteredEvents.map((e) =>
      'hash' in e
        ? [`Tx`, e.hash, e.from, e.to, '', e.tokenSymbol]
        : [`Activity`, e.address, '', '', e.amount, e.tokenSymbol]
    );
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'polygon-pulse-events.csv';
    a.click();
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 p-8"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.h1 className="text-4xl font-bold text-white mb-2" variants={fadeIn}>
        Aleo Developer Dashboard (/nerds)
      </motion.h1>
      <motion.p className="text-gray-400 mb-8" variants={fadeIn}>
        Mainnet Contract: <span className="font-mono text-cyan-400">0xd9aC52cCaD325f96398A06ADad409B30b3768d24</span>
      </motion.p>

      {/* AggLayer & RWA Stats */}
      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10" variants={fadeIn}>
        <div className="bg-gray-800/40 backdrop-blur-xl p-6 rounded-2xl border border-cyan-500/30">
          <h3 className="text-xl text-cyan-300">AggLayer Unified TVL</h3>
          <p className="text-2xl font-bold">{isLoading ? 'Loading...' : `$${aggregatedTVL.toLocaleString()}`}</p>
        </div>
        <div className="bg-gray-800/40 backdrop-blur-xl p-6 rounded-2xl border border-purple-500/30">
          <h3 className="text-xl text-purple-300">RWA TVL (Polygon Lead)</h3>
          <p className="text-2xl font-bold">{isLoading ? 'Loading...' : `$${rwaTVL.toLocaleString()}`}</p>
        </div>
        <div className="bg-gray-800/40 backdrop-blur-xl p-6 rounded-2xl border border-pink-500/30">
          <h3 className="text-xl text-pink-300">Live Events Cached</h3>
          <p className="text-2xl font-bold">{events.length}</p>
        </div>
      </motion.div>

      {/* Search & Export */}
      <motion.div className="flex justify-between mb-6" variants={fadeIn}>
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md p-3 rounded-lg bg-gray-800/70 text-white border border-gray-600 focus:ring-2 focus:ring-cyan-500"
        />
        <button onClick={exportCSV} className="ml-4 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg flex items-center gap-2">
          <ArrowDownTrayIcon className="h-5 w-5" /> Export CSV
        </button>
      </motion.div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Token Transfers */}
        <motion.div className="bg-gray-800/40 backdrop-blur-xl p-6 rounded-2xl border border-cyan-500/30" variants={fadeIn}>
          <h2 className="text-2xl font-bold text-cyan-300 mb-4">Token Transfers</h2>
          <div className="overflow-auto max-h-96">
            <table className="w-full text-white">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="p-3 text-left">Hash</th>
                  <th className="p-3 text-left">From</th>
                  <th className="p-3 text-left">To</th>
                  <th className="p-3 text-left">Token</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents
                  .filter((e): e is Transaction => 'hash' in e)
                  .map((tx) => (
                    <tr key={tx.hash} className="border-t border-gray-800 hover:bg-gray-700/30">
                      <td className="p-3 font-mono text-sm flex items-center gap-2">
                        {tx.hash.slice(0, 10)}...
                        <button onClick={() => copyToClipboard(tx.hash)}><ClipboardIcon className="h-4 w-4 text-cyan-400" /></button>
                      </td>
                      <td className="p-3 font-mono text-sm">{tx.from.slice(0, 10)}...</td>
                      <td className="p-3 font-mono text-sm">{tx.to.slice(0, 10)}...</td>
                      <td className="p-3">{tx.tokenSymbol}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Wallet Activity */}
        <motion.div className="bg-gray-800/40 backdrop-blur-xl p-6 rounded-2xl border border-purple-500/30" variants={fadeIn}>
          <h2 className="text-2xl font-bold text-purple-300 mb-4">Wallet Activity</h2>
          <div className="overflow-auto max-h-96">
            <table className="w-full text-white">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="p-3 text-left">Address</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Token</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents
                  .filter((e): e is WalletActivity => 'type' in e)
                  .map((activity) => (
                    <tr key={activity.address + activity.timestamp} className="border-t border-gray-800 hover:bg-gray-700/30">
                      <td className="p-3 font-mono text-sm flex items-center gap-2">
                        {activity.address.slice(0, 10)}...
                        <button onClick={() => copyToClipboard(activity.address)}><ClipboardIcon className="h-4 w-4 text-purple-400" /></button>
                      </td>
                      <td className="p-3">{activity.type}</td>
                      <td className="p-3">{activity.amount}</td>
                      <td className="p-3">{activity.tokenSymbol}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DeveloperDashboard;