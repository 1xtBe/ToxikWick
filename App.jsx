import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, BookOpen } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function App() {
  const [view, setView] = useState('log');
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    fetchTrades();
  }, []);

  async function fetchTrades() {
    const { data } = await supabase.from('trades').select('*').order('created_at', { ascending: false });
    if (data) setTrades(data);
  }

  return (
    <div style={{ backgroundColor: '#111', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, color: '#f3ba2f', fontSize: '24px' }}>ToxikWick</h1>
        <div style={{ display: 'flex', gap: '20px' }}>
          <BookOpen onClick={() => setView('log')} style={{ cursor: 'pointer', color: view === 'log' ? '#f3ba2f' : '#888' }} />
          <Plus onClick={() => setView('add')} style={{ cursor: 'pointer', color: view === 'add' ? '#f3ba2f' : '#888' }} />
        </div>
      </div>

      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        {view === 'log' ? (
          <div>
            <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Trade Vault</h2>
            {trades.length === 0 ? (
              <p style={{ color: '#666' }}>No trades recorded yet, Isaiah.</p>
            ) : (
              trades.map((t) => (
                <div key={t.id} style={{ backgroundColor: '#222', padding: '15px', borderRadius: '8px', marginBottom: '10px', borderLeft: '4px solid #f3ba2f' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 'bold' }}>XAUUSD {t.direction}</span>
                    <span>{t.pnl}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: '18px' }}>Add New Wick</h2>
            <p style={{ color: '#888' }}>Database is connected. Ready to log trades.</p>
            <button onClick={() => setView('log')} style={{ padding: '10px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '5px', marginTop: '20px' }}>
              Back to Logs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
