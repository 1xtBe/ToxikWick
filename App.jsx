import React from 'react';
import ReactDOM from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { TrendingUp, Plus } from 'lucide-react';

// Hardcoded for testing - Replace with your actual keys if they are different
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ borderBottom: '1px solid #333', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#fbbf24', margin: 0 }}>TOXIKWICK JOURNAL</h1>
        <TrendingUp size={24} color="#fbbf24" />
      </header>
      
      <main style={{ marginTop: '40px', textAlign: 'center' }}>
        <p>Your trading journal is online.</p>
        <button style={{ backgroundColor: '#fbbf24', border: 'none', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
          <Plus size={16} style={{ marginRight: '5px' }} /> Log New Trade
        </button>
      </main>
    </div>
  );
}

// THIS PART IS CRITICAL: It connects the React code to the <div id="root"> in your HTML
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

export default App;
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
