import { useState, useEffect } from 'react';
import { get } from '../lib/api';
import { supabase } from '../lib/supabase';

const PROVIDER_COLORS = {
  AWS: 'bg-orange-500',
  'Google Cloud': 'bg-blue-500',
  Microsoft: 'bg-green-500',
  Cisco: 'bg-red-500',
  Fortinet: 'bg-yellow-500',
  Oracle: 'bg-red-600',
};

function Countdown({ until }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = new Date(until).getTime() - now;
  if (diff <= 0) return <span className="text-red-500 text-xs">Expired</span>;

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);

  return <span className="text-xs font-mono">{d}d {h}h {m}m</span>;
}

export default function DealBanner() {
  const [deals, setDeals] = useState([]);
  const [current, setCurrent] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    get('/api/deals').then(data => {
      if (data?.data) setDeals(data.data);
    }).catch(() => {});

    if (supabase) {
      const channel = supabase.channel('deals').on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'deals' },
        () => {
          get('/api/deals').then(data => {
            if (data?.data) setDeals(data.data);
          }).catch(() => {});
        }
      ).subscribe();
      return () => supabase.removeChannel(channel);
    }
  }, []);

  useEffect(() => {
    if (deals.length < 2) return;
    const id = setInterval(() => setCurrent(c => (c + 1) % deals.length), 8000);
    return () => clearInterval(id);
  }, [deals.length]);

  if (dismissed || deals.length === 0) return null;

  const deal = deals[current];
  const color = PROVIDER_COLORS[deal.provider] || 'bg-gray-500';

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className={`${color} text-white px-2 py-0.5 rounded text-xs font-bold shrink-0`}>
            {deal.provider}
          </span>
          <span className="truncate font-medium">{deal.title}</span>
          {deal.discount_percent && (
            <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold shrink-0">
              {deal.discount_percent}% OFF
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {deal.valid_until && <Countdown until={deal.valid_until} />}
          <a
            href={deal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-blue-700 px-3 py-1 rounded text-xs font-semibold hover:bg-blue-50"
          >
            Claim
          </a>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/70 hover:text-white text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}