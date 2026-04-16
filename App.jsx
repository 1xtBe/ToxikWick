import { useState, useEffect } from "react";

const SESSIONS = ["NY", "Asia"];
const DIRECTIONS = ["BUY", "SELL"];
const OUTCOMES = ["WIN", "LOSS", "BREAKEVEN"];
const CONFLUENCES = ["Liquidity Zone", "RN Confluence", "Rejection Candle", "H1 Bias Aligned", "No News Event"];

const initialForm = {
  date: new Date().toISOString().split("T")[0],
  session: "NY",
  direction: "BUY",
  entry: "",
  sl: "",
  tp1: "",
  tp2: "",
  outcome: "WIN",
  pnl: "",
  confluences: [],
  liquidityZone: "",
  rnLevel: "",
  notes: "",
  mistake: "",
};

export default function TradingJournal() {
  const [trades, setTrades] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [view, setView] = useState("journal"); // journal | add | stats
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    try {
      const result = await window.storage.get("isaiah-trades");
      if (result) setTrades(JSON.parse(result.value));
    } catch (e) {
      setTrades([]);
    }
    setLoading(false);
  };

  const saveTrades = async (updated) => {
    try {
      await window.storage.set("isaiah-trades", JSON.stringify(updated));
    } catch (e) {}
  };

  const handleSubmit = async () => {
    if (!form.entry || !form.sl || !form.pnl) return;
    const newTrade = { ...form, id: Date.now() };
    const updated = [newTrade, ...trades];
    setTrades(updated);
    await saveTrades(updated);
    setForm(initialForm);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setView("journal");
  };

  const deleteTrade = async (id) => {
    const updated = trades.filter((t) => t.id !== id);
    setTrades(updated);
    await saveTrades(updated);
  };

  const toggleConfluence = (c) => {
    setForm((f) => ({
      ...f,
      confluences: f.confluences.includes(c)
        ? f.confluences.filter((x) => x !== c)
        : [...f.confluences, c],
    }));
  };

  const stats = {
    total: trades.length,
    wins: trades.filter((t) => t.outcome === "WIN").length,
    losses: trades.filter((t) => t.outcome === "LOSS").length,
    be: trades.filter((t) => t.outcome === "BREAKEVEN").length,
    winRate: trades.length ? Math.round((trades.filter((t) => t.outcome === "WIN").length / trades.length) * 100) : 0,
    totalPnl: trades.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0).toFixed(2),
    nyWins: trades.filter((t) => t.session === "NY" && t.outcome === "WIN").length,
    nyTotal: trades.filter((t) => t.session === "NY").length,
    asiaWins: trades.filter((t) => t.session === "Asia" && t.outcome === "WIN").length,
    asiaTotal: trades.filter((t) => t.session === "Asia").length,
  };

  const winRateColor = stats.winRate >= 70 ? "#00ff87" : stats.winRate >= 50 ? "#ffd700" : "#ff4757";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a0f 0%, #0d1117 50%, #0a0f1a 100%)",
      fontFamily: "'Courier New', monospace",
      color: "#e0e0e0",
      padding: "0",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(90deg, #0d1117, #1a1f2e, #0d1117)",
        borderBottom: "1px solid #ffd700",
        padding: "16px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div>
          <div style={{ color: "#ffd700", fontSize: "10px", letterSpacing: "4px", marginBottom: "2px" }}>XAUUSD</div>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#fff", letterSpacing: "2px" }}>TRADE JOURNAL</div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {["journal", "add", "stats"].map((v) => (
            <button key={v} onClick={() => setView(v)} style={{
              background: view === v ? "#ffd700" : "transparent",
              color: view === v ? "#000" : "#ffd700",
              border: "1px solid #ffd700",
              padding: "6px 12px",
              fontSize: "10px",
              letterSpacing: "1px",
              cursor: "pointer",
              textTransform: "uppercase",
              fontFamily: "'Courier New', monospace",
            }}>
              {v === "journal" ? "LOG" : v === "add" ? "+ ADD" : "STATS"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>

        {/* STATS VIEW */}
        {view === "stats" && (
          <div>
            <div style={{ color: "#ffd700", fontSize: "10px", letterSpacing: "3px", marginBottom: "20px" }}>PERFORMANCE OVERVIEW</div>

            {/* Win Rate Circle */}
            <div style={{
              background: "#0d1117",
              border: `2px solid ${winRateColor}`,
              borderRadius: "50%",
              width: "140px",
              height: "140px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: `0 0 30px ${winRateColor}30`,
            }}>
              <div style={{ fontSize: "36px", fontWeight: "bold", color: winRateColor }}>{stats.winRate}%</div>
              <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#888" }}>WIN RATE</div>
              <div style={{ fontSize: "9px", color: "#888" }}>TARGET: 70%</div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              {[
                { label: "TOTAL TRADES", value: stats.total, color: "#fff" },
                { label: "TOTAL P&L", value: `$${stats.totalPnl}`, color: parseFloat(stats.totalPnl) >= 0 ? "#00ff87" : "#ff4757" },
                { label: "WINS", value: stats.wins, color: "#00ff87" },
                { label: "LOSSES", value: stats.losses, color: "#ff4757" },
                { label: "NY WIN RATE", value: stats.nyTotal ? `${Math.round((stats.nyWins / stats.nyTotal) * 100)}%` : "N/A", color: "#ffd700" },
                { label: "ASIA WIN RATE", value: stats.asiaTotal ? `${Math.round((stats.asiaWins / stats.asiaTotal) * 100)}%` : "N/A", color: "#ffd700" },
              ].map((s) => (
                <div key={s.label} style={{
                  background: "#0d1117",
                  border: "1px solid #1e2a3a",
                  padding: "14px",
                  borderRadius: "4px",
                }}>
                  <div style={{ fontSize: "9px", color: "#555", letterSpacing: "2px", marginBottom: "6px" }}>{s.label}</div>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Confluence Analysis */}
            {trades.length > 0 && (
              <div style={{ background: "#0d1117", border: "1px solid #1e2a3a", padding: "16px", borderRadius: "4px" }}>
                <div style={{ fontSize: "9px", color: "#ffd700", letterSpacing: "2px", marginBottom: "12px" }}>CONFLUENCE WIN RATES</div>
                {CONFLUENCES.map((c) => {
                  const withC = trades.filter((t) => t.confluences.includes(c));
                  const winsWithC = withC.filter((t) => t.outcome === "WIN").length;
                  const rate = withC.length ? Math.round((winsWithC / withC.length) * 100) : 0;
                  return (
                    <div key={c} style={{ marginBottom: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "10px", color: "#aaa" }}>{c}</span>
                        <span style={{ fontSize: "10px", color: rate >= 70 ? "#00ff87" : "#ffd700" }}>{withC.length ? `${rate}% (${withC.length})` : "No data"}</span>
                      </div>
                      <div style={{ height: "3px", background: "#1e2a3a", borderRadius: "2px" }}>
                        <div style={{ height: "100%", width: `${rate}%`, background: rate >= 70 ? "#00ff87" : "#ffd700", borderRadius: "2px", transition: "width 0.5s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ADD TRADE VIEW */}
        {view === "add" && (
          <div>
            <div style={{ color: "#ffd700", fontSize: "10px", letterSpacing: "3px", marginBottom: "20px" }}>LOG NEW TRADE</div>

            {/* Date & Session */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <div style={{ fontSize: "9px", color: "#555", letterSpacing: "2px", marginBottom: "6px" }}>DATE</div>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  style={{ width: "100%", background: "#0d1117", border: "1px solid #1e2a3a", color: "#fff", padding: "10px", fontSize: "12px", fontFamily: "'Courier New', monospace", boxSizing: "border-box" }} />
              </div>
              <div>
                <div style={{ fontSize: "9px", color: "#555", letterSpacing: "2px", marginBottom: "6px" }}>SESSION</div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {SESSIONS.map((s) => (
                    <button key={s} onClick={() => setForm({ ...form, session: s })} style={{
                      flex: 1, background: form.session === s ? "#ffd700" : "#0d1117",
                      color: form.session === s ? "#000" : "#ffd700",
                      border: "1px solid #ffd700", padding: "10px 0", fontSize: "11px",
                      cursor: "pointer", fontFamily: "'Courier New', monospace",
                    }}>{s}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Direction */}
            <div style={{ marginBottom: "12px" }}>
              <div style={{ fontSize: "9px", color: "#555", letterSpacing: "2px", marginBottom: "6px" }}>DIRECTION</div>
              <div style={{ display: "flex", gap: "8px" }}>
                {DIRECTIONS.map((d) => (
                  <button key={d} onClick={() => setForm({ ...form, direction: d })} style={{
                    flex: 1, background: form.direction === d ? (d === "BUY" ? "#00ff87" : "#ff4757") : "#0d1117",
                    color: form.direction === d ? "#000" : d === "BUY" ? "#00ff87" : "#ff4757",
                    border: `1px solid ${d === "BUY" ? "#00ff87" : "#ff4757"}`,
                    padding: "12px 0", fontSize: "13px", fontWeight: "bold",
                    cursor: "pointer", fontFamily: "'Courier New', monospace", letterSpacing: "2px",
                  }}>{d}</button>
                ))}
              </div>
            </div>

            {/* Price Levels */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              {[
                { key: "entry", label: "ENTRY PRICE" },
                { key: "sl", label: "STOP LOSS" },
                { key: "tp1", label: "TP1" },
                { key: "tp2", label: "TP2" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <div style={{ fontSize: "9px", color: "#555", letterSpacing: "2px", marginBottom: "6px" }}>{label}</div>
                  <input type="number" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder="0.000"
                    style={{ width: "100%", background: "#0d1117", border: "1px solid #1e2a3a", color: "#fff", padding: "10px", fontSize: "12px", fontFamily: "'Courier New', monospace", boxSizing: "border-box" }} />
                </div>
              ))}
            </div>

            {/* Outcome & PnL */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              <div>
                <div style={{ fontSize: "9px", color: "#555", letterSpacing: "2px", marginBottom: "6px" }}>OUTCOME</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {OUTCOMES.map((o) => (
                    <button key={o} onClick={() => setForm({ ...form, outcome: o })} style={{
                      background: form.outcome === o ? (o === "WIN" ? "#00ff87" : o === "LOSS" ? "#ff4757" : "#ffd700") : "#0d1117",
                      color: form.outcome === o ? "#000" : (o === "WIN" ? "#00ff87" : o === "LOSS" ? "#ff4757" : "#ffd700"),
                      border: `1px solid ${o === "WIN" ? "#00ff87" : o === "LOSS" ? "#ff4757" : "#ffd700"}`,
                      padding: "8px", fontSize: "10px", cursor: "pointer",
                      fontFamily: "'Courier New', monospace", letterSpacing: "1px",
                    }}>{o}</button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "9px", color: "#555", letterSpacing: "2px", marginBottom: "6px" }}>P&L (USD)</div>
                <input type="number" value={form.pnl} onChange={(e) => setForm({ ...form, pnl: e.target.value })}
                  placeholder="+0.00"
                  style={{ width: "100%", background: "#0d1117", border: "1px solid #1e2a3a", color: parseFloat(form.pnl) >= 0 ? "#00ff87" : "#ff4757", padding: "10px", fontSize: "14px", fontFamily: "'Courier New', monospace", boxSizing: "border-box" }} />
                <div style={{ fontSize: "9px", color: "#555", marginTop: "6px" }}>Use - for losses</div>
              </div>
            </div>

            {/* Confluences */}
            <div style={{ marginBottom: "12px" }}>
              <div style={{ fontSize: "9px", color: "#555", letterSpacing: "2px", marginBottom: "8px" }}>CONFLUENCES PRESENT</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {CONFLUENCES.map((c) => (
                  <button key={c} onClick={() => toggleConfluence(c)} style={{
                    background: form.confluences.includes(c) ? "#1a2a1a" : "#0d1117",
                    color: form.confluences.includes(c) ? "#00ff87" : "#555",
                    border: `1px solid ${form.confluences.includes(c) ? "#00ff87" : "#1e2a3a"}`,
                    padding: "10px 14px", fontSize: "10px", cursor: "pointer",
                    textAlign: "left", fontFamily: "'Courier New', monospace",
                    display: "flex", alignItems: "center", gap: "10px",
                  }}>
                    <span style={{ fontSize: "14px" }}>{form.confluences.includes(c) ? "✓" : "○"}</span>
                    {c}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: "6px", fontSize: "10px", color: form.confluences.length >= 4 ? "#00ff87" : "#ffd700" }}>
                {form.confluences.length}/5 confluences — {form.confluences.length >= 4 ? "HIGH PROBABILITY" : form.confluences.length >= 3 ? "MODERATE" : "LOW PROBABILITY"}
              </div>
            </div>

            {/* Notes & Mistake */}
            <div style={{ marginBottom: "12px" }}>
              <div style={{ fontSize: "9px", color: "#555", letterSpacing: "2px", marginBottom: "6px" }}>TRADE NOTES</div>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="What did you see? What was the setup?"
                rows={3}
                style={{ width: "100%", background: "#0d1117", border: "1px solid #1e2a3a", color: "#aaa", padding: "10px", fontSize: "11px", fontFamily: "'Courier New', monospace", resize: "vertical", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "9px", color: "#555", letterSpacing: "2px", marginBottom: "6px" }}>MISTAKE / LESSON</div>
              <textarea value={form.mistake} onChange={(e) => setForm({ ...form, mistake: e.target.value })}
                placeholder="What went wrong? What did you learn?"
                rows={2}
                style={{ width: "100%", background: "#0d1117", border: "1px solid #1e2a3a", color: "#aaa", padding: "10px", fontSize: "11px", fontFamily: "'Courier New', monospace", resize: "vertical", boxSizing: "border-box" }} />
            </div>

            <button onClick={handleSubmit} style={{
              width: "100%", background: "#ffd700", color: "#000",
              border: "none", padding: "16px", fontSize: "12px",
              fontWeight: "bold", letterSpacing: "3px", cursor: "pointer",
              fontFamily: "'Courier New', monospace",
            }}>
              {saved ? "✓ LOGGED" : "LOG TRADE"}
            </button>
          </div>
        )}

        {/* JOURNAL VIEW */}
        {view === "journal" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ color: "#ffd700", fontSize: "10px", letterSpacing: "3px" }}>TRADE LOG</div>
              <div style={{ fontSize: "10px", color: "#555" }}>{trades.length} TRADES</div>
            </div>

            {loading && <div style={{ color: "#555", textAlign: "center", padding: "40px" }}>Loading...</div>}

            {!loading && trades.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#333" }}>
                <div style={{ fontSize: "40px", marginBottom: "16px" }}>📈</div>
                <div style={{ fontSize: "12px", letterSpacing: "2px", marginBottom: "8px", color: "#555" }}>NO TRADES LOGGED YET</div>
                <div style={{ fontSize: "10px", color: "#333" }}>Press + ADD to log your first trade</div>
              </div>
            )}

            {trades.map((trade) => (
              <div key={trade.id} style={{
                background: "#0d1117",
                border: `1px solid ${trade.outcome === "WIN" ? "#00ff8730" : trade.outcome === "LOSS" ? "#ff475730" : "#ffd70030"}`,
                borderLeft: `3px solid ${trade.outcome === "WIN" ? "#00ff87" : trade.outcome === "LOSS" ? "#ff4757" : "#ffd700"}`,
                marginBottom: "12px",
                padding: "14px",
                borderRadius: "0 4px 4px 0",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{
                        fontSize: "10px", fontWeight: "bold", letterSpacing: "1px",
                        color: trade.direction === "BUY" ? "#00ff87" : "#ff4757",
                      }}>{trade.direction}</span>
                      <span style={{ fontSize: "9px", color: "#555" }}>|</span>
                      <span style={{ fontSize: "9px", color: "#888", letterSpacing: "1px" }}>{trade.session} SESSION</span>
                      <span style={{ fontSize: "9px", color: "#555" }}>|</span>
                      <span style={{ fontSize: "9px", color: "#555" }}>{trade.date}</span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#aaa" }}>
                      Entry: <span style={{ color: "#fff" }}>{trade.entry}</span>
                      {" "} SL: <span style={{ color: "#ff4757" }}>{trade.sl}</span>
                      {trade.tp1 && <>{" "} TP1: <span style={{ color: "#00ff87" }}>{trade.tp1}</span></>}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{
                      fontSize: "18px", fontWeight: "bold",
                      color: parseFloat(trade.pnl) >= 0 ? "#00ff87" : "#ff4757",
                    }}>
                      {parseFloat(trade.pnl) >= 0 ? "+" : ""}{trade.pnl}
                    </div>
                    <div style={{ fontSize: "9px", color: "#555" }}>USD</div>
                  </div>
                </div>

                {trade.confluences.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
                    {trade.confluences.map((c) => (
                      <span key={c} style={{
                        fontSize: "8px", background: "#1a2a1a", color: "#00ff87",
                        padding: "2px 6px", borderRadius: "2px", letterSpacing: "1px",
                      }}>{c}</span>
                    ))}
                  </div>
                )}

                {trade.notes && (
                  <div style={{ fontSize: "10px", color: "#666", marginBottom: "4px", fontStyle: "italic" }}>
                    "{trade.notes}"
                  </div>
                )}

                {trade.mistake && (
                  <div style={{ fontSize: "10px", color: "#ff475780", marginBottom: "8px" }}>
                    ⚠ {trade.mistake}
                  </div>
                )}

                <button onClick={() => deleteTrade(trade.id)} style={{
                  background: "transparent", color: "#333", border: "none",
                  fontSize: "9px", cursor: "pointer", letterSpacing: "1px",
                  fontFamily: "'Courier New', monospace",
                }}>DELETE</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
