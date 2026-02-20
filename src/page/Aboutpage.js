import { useState } from "react";
import { aboutPage, getOrbitAssets, getAssetBreakdown } from "../data/data";

const ASSETS    = getOrbitAssets();
const TOTAL_AUM = aboutPage.totalAUM;

function AssetOrbit() {
  const [active, setActive] = useState(null);
  const activeAsset = active ? ASSETS.find(a => a.id === active) : null;

  const MAIN_R   = 220;
  const SUB_R    = 80;
  const SUB_SIZE = 54;
  const SIZE_BASE       = 88;
  const SIZE_MULTIPLIER = 4.2;

  return (
    <>
      <style>{`
        @keyframes assetOrbit {
          from { transform: rotate(0deg)   translateY(-${MAIN_R}px) rotate(0deg);   }
          to   { transform: rotate(360deg) translateY(-${MAIN_R}px) rotate(-360deg); }
        }
        @keyframes subOrbit {
          from { transform: rotate(0deg)   translateY(-${SUB_R}px) rotate(0deg);   }
          to   { transform: rotate(360deg) translateY(-${SUB_R}px) rotate(-360deg); }
        }
        .orbit-scene {
          position: relative;
          width: ${(MAIN_R + SIZE_BASE + SUB_R + SUB_SIZE + 40) * 2}px;
          height: ${(MAIN_R + SIZE_BASE + SUB_R + SUB_SIZE + 40) * 2}px;
          max-width: 100%;
          aspect-ratio: 1;
          flex-shrink: 0;
        }
        .asset-wrap {
          position: absolute; top: 50%; left: 50%;
          animation: assetOrbit 36s linear infinite;
          animation-delay: var(--d); z-index: 5;
        }
        .asset-bubble {
          border-radius: 50%; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          border: 2px solid rgba(255,255,255,0.9);
          box-shadow: 0 4px 18px rgba(0,0,0,0.18);
          cursor: pointer;
          transition: box-shadow 0.2s, transform 0.2s;
          position: absolute; top: 0; left: 0;
        }
        .asset-bubble:hover {
          box-shadow: 0 6px 28px rgba(0,0,0,0.28), 0 0 0 3px rgba(255,255,255,0.75);
          transform: scale(1.08);
        }
        .sub-wrap {
          position: absolute; top: 50%; left: 50%;
          width: ${SUB_SIZE}px; height: ${SUB_SIZE}px;
          margin-top: -${SUB_SIZE/2}px; margin-left: -${SUB_SIZE/2}px;
          animation: subOrbit 12s linear infinite;
          animation-delay: var(--d); z-index: 4;
        }
        .sub-bubble {
          width: ${SUB_SIZE}px; height: ${SUB_SIZE}px; border-radius: 50%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          border: 1.5px solid rgba(255,255,255,0.9);
          box-shadow: 0 2px 10px rgba(0,0,0,0.15);
        }
        .sub-ring {
          position: absolute; border-radius: 50%; pointer-events: none;
          top: 50%; left: 50%;
          width: ${SUB_R*2}px; height: ${SUB_R*2}px;
          margin-left: -${SUB_R}px; margin-top: -${SUB_R}px;
          border: 1px dashed rgba(255,255,255,0.2);
        }
        .ring { position: absolute; border-radius: 50%; pointer-events: none; top: 50%; left: 50%; }
        .asset-pct { font-size: 16px; font-weight: 700; color: #fff; line-height: 1; }
        .asset-lbl { font-size: 7.5px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; color: rgba(255,255,255,0.85); text-align: center; line-height: 1.3; white-space: pre-line; margin-top: 3px; }
        .sub-lbl   { font-size: 6.5px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; color: rgba(255,255,255,0.92); text-align: center; line-height: 1.3; white-space: pre-line; }
        .sub-val   { font-size: 6px; color: rgba(255,255,255,0.65); margin-top: 1px; }
        .orbit-desktop { display: none; }
        .orbit-mobile  { display: flex; flex-direction: column; gap: 10px; width: 100%; }
        @media (min-width: 700px) {
          .orbit-desktop { display: flex; flex-direction: row; align-items: center; gap: 32px; }
          .orbit-mobile  { display: none; }
        }
        .leg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; }
        @media (min-width: 700px) { .leg-grid { grid-template-columns: 1fr; min-width: 200px; max-width: 260px; } }
        .leg-row { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; border-radius: 10px; border: 1.5px solid #e8e8e8; background: #fff; transition: all .2s; }
        .leg-row:hover { background: #f5f5f5; border-color: #ccc; }
        .leg-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
        .leg-nm  { font-size: 15px; font-weight: 600; color: #000; }
        .leg-vl  { font-size: 13px; color: #666; margin-top: 3px; }
      `}</style>

      <div className="orbit-mobile">
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#666", marginBottom: 4 }}>
          Asset Classes · Total {TOTAL_AUM}
        </p>
        <div className="leg-grid">
          {ASSETS.map(a => (
            <div key={a.id} className="leg-row">
              <div className="leg-dot" style={{ background: a.color }} />
              <div>
                <div className="leg-nm">{a.label.replace("\n", " ")}</div>
                <div className="leg-vl">{a.value} · {a.pct}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="orbit-desktop">
        <div style={{ overflowX: "auto", overflowY: "hidden", maxWidth: "100%" }}>
          <div className="orbit-scene">
            <div className="ring" style={{ width: MAIN_R*2, height: MAIN_R*2, marginLeft: -MAIN_R, marginTop: -MAIN_R, border: "1px dashed rgba(196,160,120,0.3)" }} />
            <div className="ring" style={{ width: (MAIN_R+28)*2, height: (MAIN_R+28)*2, marginLeft: -(MAIN_R+28), marginTop: -(MAIN_R+28), border: "0.5px dotted rgba(196,160,120,0.1)" }} />
            {ASSETS.map((asset, i) => {
              const pctNum     = parseInt(asset.pct, 10);
              const bubbleSize = SIZE_BASE + (pctNum - 10) * SIZE_MULTIPLIER;
              const half       = bubbleSize / 2;
              const assetDelay = `-${((i / ASSETS.length) * 36).toFixed(2)}s`;
              return (
                <div key={asset.id} className="asset-wrap" style={{ "--d": assetDelay, width: `${bubbleSize}px`, height: `${bubbleSize}px`, marginTop: `-${half}px`, marginLeft: `-${half}px` }}>
                  {asset.subs.length > 0 && <div className="sub-ring" />}
                  {asset.subs.map((sub, si) => {
                    const subDelay = `-${((si / asset.subs.length) * 12).toFixed(2)}s`;
                    return (
                      <div key={si} className="sub-wrap" style={{ "--d": subDelay }}>
                        <div className="sub-bubble" style={{ background: asset.color, filter: "brightness(1.22)" }}>
                          <span className="sub-lbl">{sub.label}</span>
                          <span className="sub-val">{sub.value}</span>
                        </div>
                      </div>
                    );
                  })}
                  <div className="asset-bubble" style={{ background: asset.color, width: `${bubbleSize}px`, height: `${bubbleSize}px` }} onMouseEnter={() => setActive(asset.id)} onMouseLeave={() => setActive(null)}>
                    <span className="asset-pct">{asset.pct}</span>
                    <span className="asset-lbl">{asset.label}</span>
                  </div>
                </div>
              );
            })}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 120, height: 120, borderRadius: "50%", background: "#f8f7f5", border: "1.5px solid #e8e3dd", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "#777", marginBottom: 4 }}>{activeAsset ? "SELECTED" : "TOTAL AUM"}</span>
              <span style={{ fontSize: activeAsset ? 16 : 20, fontWeight: 700, color: "#000", lineHeight: 1, transition: "font-size .2s", textAlign: "center" }}>{activeAsset ? activeAsset.pct : TOTAL_AUM}</span>
              <span style={{ fontSize: 9, color: "#777", marginTop: 4, textAlign: "center", lineHeight: 1.4 }}>{activeAsset ? activeAsset.value : "Dec 31, 2025"}</span>
            </div>
          </div>
        </div>
        <div className="leg-grid" style={{ marginTop: 0 }}>
          {ASSETS.map(a => (
            <div key={a.id} className="leg-row">
              <div className="leg-dot" style={{ background: a.color }} />
              <div>
                <div className="leg-nm">{a.label.replace("\n", " ")}</div>
                <div className="leg-vl">{a.value} · {a.pct}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function AboutPage() {
  const [expanded, setExpanded] = useState(null);
  const { hero, stats, whoWeAre, milestones, values } = aboutPage;

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#f8f8f8", minHeight: "100vh", color: "#000" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .pg  { display: grid; width: 100%; grid-template-columns: repeat(12,1fr); max-width: 1920px; margin: 0 auto; }
        .col { grid-column: 1/-1; padding: 0 16px; }
        @media (min-width: 640px)  { .col { padding: 0 24px; } }
        @media (min-width: 1024px) { .col { grid-column: 2/12; padding: 0 32px; } }
        .sec { padding: 48px 0; border-bottom: 1px solid #e0e0e0; }
        .sec:last-child { border-bottom: none; }
        @media (min-width: 768px) { .sec { padding: 72px 0; } }
        @media (min-width: 1024px) { .sec { padding: 88px 0; } }
        .eyebrow { font-size: 10.5px; font-weight: 600; letter-spacing: .13em; text-transform: uppercase; color: #555; margin-bottom: 10px; }
        .heading  { font-size: clamp(22px, 4vw, 42px); font-weight: 600; color: #000; line-height: 1.1; }
        .stat-band { display: grid; grid-template-columns: 1fr 1fr; border-radius: 12px; overflow: hidden; border: 1px solid #e0e0e0; }
        @media (min-width: 640px) { .stat-band { grid-template-columns: repeat(4, 1fr); } }
        .stat-cell { background: #fff; padding: 20px 16px; border-right: 1px solid #e0e0e0; border-bottom: 1px solid #e0e0e0; }
        .stat-cell:last-child { border-right: none; }
        @media (min-width: 640px) { .stat-cell { padding: 26px 22px; border-bottom: none; } .stat-cell:nth-child(2) { border-right: 1px solid #e0e0e0; } }
        .stat-val { font-size: clamp(24px, 3.5vw, 36px); font-weight: 700; color: #000; line-height: 1; }
        .stat-lbl { font-size: 10.5px; font-weight: 600; letter-spacing: .09em; text-transform: uppercase; color: #666; margin-top: 5px; }
        .two-col  { display: flex; flex-direction: column; gap: 40px; }
        @media (min-width: 900px) { .two-col { flex-direction: row; align-items: flex-start; gap: 64px; } }
        .two-col > * { flex: 1; }
        .orbit-section { display: flex; flex-direction: column; align-items: center; gap: 28px; }
        @media (min-width: 700px) { .orbit-section { flex-direction: row; align-items: center; justify-content: center; gap: 40px; } }
        .acc      { display: flex; flex-direction: column; gap: 8px; }
        .acc-card { background: #fff; border-radius: 10px; border: 1.5px solid #e0e0e0; overflow: hidden; transition: border-color .2s, box-shadow .2s; }
        .acc-card:hover { border-color: #ccc; box-shadow: 0 3px 14px rgba(0,0,0,.05); }
        .acc-hd  { display: flex; align-items: center; gap: 10px; padding: 14px 16px; cursor: pointer; background: transparent; border: none; width: 100%; text-align: left; flex-wrap: nowrap; }
        @media (min-width: 480px) { .acc-hd { padding: 16px 20px; gap: 12px; } }
        .acc-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .acc-ttl { font-size: clamp(12px, 2vw, 15px); font-weight: 600; color: #000; flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .acc-vl  { font-size: clamp(11px, 1.5vw, 13px); color: #555; font-weight: 500; white-space: nowrap; }
        .acc-bdg { font-size: 9.5px; font-weight: 700; padding: 3px 8px; border-radius: 99px; color: #fff; flex-shrink: 0; }
        .acc-chev { color: #555; font-size: 10px; transition: transform .25s; flex-shrink: 0; }
        .acc-subs { padding: 0 16px 14px 36px; display: flex; flex-direction: column; gap: 10px; }
        @media (min-width: 480px) { .acc-subs { padding: 0 20px 16px 44px; } }
        .acc-sub  { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: #333; line-height: 1.5; }
        .acc-blt  { width: 5px; height: 5px; border-radius: 50%; background: #bbb; flex-shrink: 0; margin-top: 6px; }
        .acc-sv   { font-size: 11.5px; color: #555; font-weight: 500; margin-left: auto; white-space: nowrap; padding-left: 8px; }
        .tl { position: relative; padding-left: 24px; }
        .tl::before { content: ''; position: absolute; left: 5px; top: 0; bottom: 0; width: 1px; background: #e0e0e0; }
        .tl-it { position: relative; padding-bottom: 24px; }
        .tl-it:last-child { padding-bottom: 0; }
        .tl-dot { position: absolute; left: -20px; top: 4px; width: 11px; height: 11px; border-radius: 50%; background: #ccc; border: 2px solid #f8f8f8; }
        .tl-yr  { font-size: 10.5px; font-weight: 700; letter-spacing: .1em; color: #666; text-transform: uppercase; margin-bottom: 3px; }
        .tl-ev  { font-size: 13.5px; color: #333; line-height: 1.6; text-align: justify; }
        .val-grid { display: grid; gap: 14px; grid-template-columns: 1fr 1fr; }
        @media (min-width: 640px)  { .val-grid { gap: 16px; } }
        @media (min-width: 1024px) { .val-grid { grid-template-columns: repeat(4, 1fr); } }
        .val-card { background: #fff; border-radius: 12px; border: 1.5px solid #e0e0e0; padding: 20px 16px; }
        @media (min-width: 640px)  { .val-card { padding: 26px 20px; } }
        .val-num  { font-size: clamp(28px, 4vw, 40px); font-weight: 700; color: #e0e0e0; line-height: 1; margin-bottom: 10px; }
        .val-lbl  { font-size: clamp(13px, 1.5vw, 15px); font-weight: 600; color: #000; margin-bottom: 8px; }
        .val-body { font-size: clamp(12px, 1.3vw, 13.5px); color: #555; line-height: 1.65; text-align: justify; }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ position: "relative", height: "clamp(280px, 45vw, 420px)", overflow: "hidden" }}>
        <img src={hero.image} alt="About NF Holdings Group" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2070&q=80'; }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.38) 60%, rgba(0,0,0,0.55) 100%)" }} />
        <div className="pg" style={{ position: "relative", zIndex: 1, height: "100%" }}>
          <div className="col" style={{ display: "flex", alignItems: "center", height: "100%" }}>
            <div style={{ padding: "0", maxWidth: 640 }}>
              <p className="eyebrow" style={{ color: "rgba(255,255,255,0.75)" }}>{hero.eyebrow}</p>
              <h1 style={{ fontSize: "clamp(26px, 5.5vw, 72px)", fontWeight: 700, color: "#fff", lineHeight: 1.05, marginBottom: 14, marginTop: 8 }}>{hero.headline}</h1>
              <p style={{ fontSize: "clamp(13px, 1.6vw, 17px)", color: "rgba(255,255,255,0.88)", lineHeight: 1.7, maxWidth: 500, textAlign: "justify" }}>{hero.subheadline}</p>
              <div style={{ width: 44, height: 3, background: "#fff", borderRadius: 99, opacity: 0.65, marginTop: 20 }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="pg" style={{ marginTop: "clamp(24px, 4vw, 56px)" }}>
        <div className="col">
          <div className="stat-band">
            {stats.map((s, i) => (
              <div key={i} className="stat-cell">
                <div className="stat-val">{s.value}</div>
                <div className="stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── WHO WE ARE ── */}
      <div className="pg"><div className="col"><div className="sec">
        <div className="two-col">
          <div>
            <p className="eyebrow">Who We Are</p>
            <h2 className="heading" style={{ marginBottom: 20 }}>More than an investment group</h2>
            <p style={{ fontSize: "clamp(13px, 1.5vw, 16px)", color: "#333", lineHeight: 1.75, marginBottom: 16, textAlign: "justify" }}>{whoWeAre.para1}</p>
            <p style={{ fontSize: "clamp(13px, 1.5vw, 16px)", color: "#333", lineHeight: 1.75, textAlign: "justify" }}>{whoWeAre.para2}</p>
          </div>
          <div>
            <p className="eyebrow" style={{ marginBottom: 18 }}>Our Journey</p>
            <div className="tl">
              {milestones.map((m, i) => (
                <div key={i} className="tl-it">
                  <div className="tl-dot" />
                  <div className="tl-yr">{m.year}</div>
                  <div className="tl-ev">{m.event}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div></div></div>

      {/* ── ASSET ALLOCATION ── */}
      <div className="pg"><div className="col"><div className="sec">
        <div style={{ marginBottom: "clamp(24px, 4vw, 44px)" }}>
          <p className="eyebrow">Portfolio Structure</p>
          <h2 className="heading">Asset Allocation</h2>
          <p style={{ fontSize: "clamp(12px, 1.4vw, 14.5px)", color: "#666", marginTop: 8, lineHeight: 1.6 }}>
            As at December 31, 2025 · Total AUM {TOTAL_AUM} · Sub-entities orbit around each parent asset
          </p>
        </div>
        <div className="orbit-section"><AssetOrbit /></div>
      </div></div></div>

      {/* ── BREAKDOWN ── */}
      <div className="pg"><div className="col"><div className="sec">
        <div style={{ marginBottom: "clamp(20px, 3.5vw, 40px)" }}>
          <p className="eyebrow">Deep Dive</p>
          <h2 className="heading">Asset Breakdown</h2>
          <p style={{ fontSize: "clamp(12px, 1.5vw, 15px)", color: "#333", lineHeight: 1.7, maxWidth: 500, marginTop: 8, textAlign: "justify" }}>
            Tap each asset class to explore constituent sub-entities.
          </p>
        </div>
        <div className="acc">
          {ASSETS.map(asset => {
            const subs   = getAssetBreakdown(asset.id);
            const isOpen = expanded === asset.id;
            return (
              <div key={asset.id} className="acc-card">
                <button className="acc-hd" onClick={() => setExpanded(isOpen ? null : asset.id)}>
                  <div className="acc-dot" style={{ background: asset.color }} />
                  <span className="acc-ttl">{asset.label.replace("\n", " ")}</span>
                  <span className="acc-vl">{asset.value}</span>
                  <span className="acc-bdg" style={{ background: asset.color }}>{asset.pct}</span>
                  {subs.length > 0 && <span className="acc-chev" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>}
                </button>
                {isOpen && subs.length > 0 && (
                  <div className="acc-subs">
                    {subs.map((s, i) => (
                      <div key={i} className="acc-sub">
                        <div className="acc-blt" />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "clamp(12px, 1.4vw, 13.5px)" }}>{s.name}</div>
                          <div style={{ fontSize: "clamp(11px, 1.2vw, 12.5px)", color: "#666", textAlign: "justify" }}>{s.desc}</div>
                        </div>
                        <span className="acc-sv">{s.value}</span>
                      </div>
                    ))}
                  </div>
                )}
                {isOpen && subs.length === 0 && (
                  <div style={{ padding: "0 16px 14px 36px", fontSize: 13, color: "#666", fontStyle: "italic" }}>
                    Direct allocation — no sub-entities.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div></div></div>

      {/* ── CORE VALUES ── */}
      <div className="pg"><div className="col"><div className="sec" style={{ borderBottom: "none" }}>
        <div style={{ marginBottom: "clamp(20px, 3.5vw, 40px)" }}>
          <p className="eyebrow">What Drives Us</p>
          <h2 className="heading">Our Core Values</h2>
        </div>
        <div className="val-grid">
          {values.map((v, i) => (
            <div key={i} className="val-card">
              <div className="val-num">0{i + 1}</div>
              <div className="val-lbl">{v.label}</div>
              <div className="val-body">{v.body}</div>
            </div>
          ))}
        </div>
      </div></div></div>
    </div>
  );
}