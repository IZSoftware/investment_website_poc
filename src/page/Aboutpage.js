import { useState } from "react";
import { aboutPage, getOrbitAssets, getAssetBreakdown } from "../data/data";

// Data from unified source 
const ASSETS    = getOrbitAssets();
const TOTAL_AUM = aboutPage.totalAUM;

//Orbit constants (visual tuning only, not content) 
const MAIN_R   = 320;
const SUB_R    = 110;
const SUB_SIZE = 75;

// Orbit Component
function AssetOrbit() {
  const [active, setActive] = useState(null);
  const activeAsset = active ? ASSETS.find(a => a.id === active) : null;

  const SIZE_BASE       = 110;
  const SIZE_MULTIPLIER = 5.8;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <style>{`
        @keyframes assetOrbit {
          from { transform: rotate(0deg)   translateY(-${MAIN_R}px) rotate(0deg);   }
          to   { transform: rotate(360deg) translateY(-${MAIN_R}px) rotate(-360deg); }
        }
        @keyframes subOrbit {
          from { transform: rotate(0deg)   translateY(-${SUB_R}px) rotate(0deg);   }
          to   { transform: rotate(360deg) translateY(-${SUB_R}px) rotate(-360deg); }
        }
        .scene {
          position: relative;
          width:  ${(MAIN_R + 240/2 + SUB_R + SUB_SIZE/2 + 40) * 2}px;
          height: ${(MAIN_R + 240/2 + SUB_R + SUB_SIZE/2 + 40) * 2}px;
          max-width: 100%; aspect-ratio: 1;
        }
        .asset-wrap {
          position: absolute; top: 50%; left: 50%;
          animation: assetOrbit 36s linear infinite;
          animation-delay: var(--d); z-index: 5;
        }
        .asset-bubble {
          border-radius: 50%; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          border: 2.5px solid #fff;
          box-shadow: 0 4px 20px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.1);
          cursor: pointer; transition: box-shadow 0.2s, transform 0.2s;
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
          border: 2px solid rgba(255,255,255,0.9);
          box-shadow: 0 2px 10px rgba(0,0,0,0.18);
        }
        .asset-pct { font-size: 22px; font-weight: 600; color: #fff; line-height: 1; }
        .asset-lbl { font-size: 9px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: rgba(255,255,255,0.85); text-align: center; line-height: 1.3; white-space: pre-line; margin-top: 4px; }
        .sub-lbl   { font-size: 8px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; color: rgba(255,255,255,0.92); text-align: center; line-height: 1.3; white-space: pre-line; }
        .sub-val   { font-size: 7px; color: rgba(255,255,255,0.65); margin-top: 2px; }
        .ring      { position: absolute; border-radius: 50%; pointer-events: none; top: 50%; left: 50%; }
        .sub-ring  { position: absolute; border-radius: 50%; pointer-events: none; top: 50%; left: 50%;
                     width: ${SUB_R*2}px; height: ${SUB_R*2}px;
                     margin-left: -${SUB_R}px; margin-top: -${SUB_R}px;
                     border: 1px dashed rgba(255,255,255,0.25); }
      `}</style>

      <div className="scene">
        {/* Orbit track rings */}
        <div className="ring" style={{ width: MAIN_R*2, height: MAIN_R*2, marginLeft: -MAIN_R, marginTop: -MAIN_R, border: "1px dashed rgba(196,160,120,0.28)" }} />
        <div className="ring" style={{ width: (MAIN_R+36)*2, height: (MAIN_R+36)*2, marginLeft: -(MAIN_R+36), marginTop: -(MAIN_R+36), border: "0.5px dotted rgba(196,160,120,0.1)" }} />

        {/* Asset nodes */}
        {ASSETS.map((asset, i) => {
          const pctNum     = parseInt(asset.pct, 10);
          const bubbleSize = SIZE_BASE + (pctNum - 10) * SIZE_MULTIPLIER;
          const half       = bubbleSize / 2;
          const assetDelay = `-${((i / ASSETS.length) * 36).toFixed(2)}s`;
          return (
            <div
              key={asset.id}
              className="asset-wrap"
              style={{ "--d": assetDelay, width: `${bubbleSize}px`, height: `${bubbleSize}px`, marginTop: `-${half}px`, marginLeft: `-${half}px` }}
            >
              {asset.subs.length > 0 && <div className="sub-ring" />}

              {/* Sub-entity satellites */}
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

              {/* Parent asset bubble */}
              <div
                className="asset-bubble"
                style={{ background: asset.color, width: `${bubbleSize}px`, height: `${bubbleSize}px` }}
                onMouseEnter={() => setActive(asset.id)}
                onMouseLeave={() => setActive(null)}
              >
                <span className="asset-pct">{asset.pct}</span>
                <span className="asset-lbl">{asset.label}</span>
              </div>
            </div>
          );
        })}

        {/* Core circle */}
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 160, height: 160, borderRadius: "50%",
          background: "#f8f7f5", border: "1.5px solid #e8e3dd",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          zIndex: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "#777", marginBottom: 5 }}>
            {activeAsset ? "SELECTED" : "TOTAL AUM"}
          </span>
          <span style={{ fontSize: activeAsset ? 22 : 26, fontWeight: 600, color: "#000", lineHeight: 1, transition: "font-size .2s", textAlign: "center" }}>
            {activeAsset ? activeAsset.pct : TOTAL_AUM}
          </span>
          <span style={{ fontSize: 10, color: "#777", marginTop: 5, textAlign: "center", lineHeight: 1.4 }}>
            {activeAsset ? activeAsset.value : "Dec 31, 2025"}
          </span>
          {activeAsset && (
            <span style={{ fontSize: 9, color: "#777", marginTop: 3, textAlign: "center", lineHeight: 1.3, whiteSpace: "pre-line" }}>
              {activeAsset.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function AboutPage() {
  const [expanded, setExpanded] = useState(null);

  // Pull everything from the unified data file
  const { hero, stats, whoWeAre, milestones, values } = aboutPage;

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#f8f8f8", minHeight: "100vh", color: "#000000" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
        .pg  { display:grid; width:100%; grid-template-columns:repeat(12,1fr); max-width:1920px; margin:0 auto; }
        .col { grid-column:1/-1; padding:0 24px; }
        @media(min-width:640px)  { .col { padding:0 28px; } }
        @media(min-width:1024px) { .col { grid-column:2/12; padding:0 36px; } }
        .sec { padding:80px 0; border-bottom:1px solid #e0e0e0; }
        .sec:last-child { border-bottom:none; }
        .eyebrow { font-size:11px; font-weight:600; letter-spacing:.13em; text-transform:uppercase; color:#555; margin-bottom:12px; }
        .heading  { font-size:clamp(28px,3.5vw,44px); font-weight:600; color:#000; line-height:1.1; }
        .two-col  { display:grid; gap:56px; }
        @media(min-width:900px) { .two-col { grid-template-columns:1fr 1fr; align-items:start; gap:72px; } }
        .stat-band { display:grid; grid-template-columns:repeat(2,1fr); }
        @media(min-width:640px) { .stat-band { grid-template-columns:repeat(4,1fr); } }
        .stat-cell { background:#fff; padding:28px 24px; border:1px solid #e0e0e0; }
        .stat-cell:first-child { border-radius:12px 0 0 12px; }
        .stat-cell:last-child  { border-radius:0 12px 12px 0; }
        .stat-val { font-size:36px; font-weight:600; color:#000; line-height:1; }
        .stat-lbl { font-size:11.5px; font-weight:600; letter-spacing:.09em; text-transform:uppercase; color:#555; margin-top:6px; }
        .orbit-flex { display:flex; flex-direction:column; align-items:center; gap:32px; }
        @media(min-width:1100px) { .orbit-flex { flex-direction:row; align-items:center; justify-content:center; gap:48px; } }
        .legend  { display:flex; flex-direction:column; gap:8px; min-width:200px; flex-shrink:0; }
        .leg-row { display:flex; align-items:center; gap:12px; padding:10px 14px; border-radius:10px; border:1.5px solid transparent; transition:all .2s; }
        .leg-row:hover { background:#f0f0f0; border-color:#d0d0d0; }
        .leg-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
        .leg-nm  { font-size:13px; font-weight:600; color:#000; }
        .leg-vl  { font-size:11.5px; color:#555; margin-top:1px; }
        .acc      { display:flex; flex-direction:column; gap:10px; }
        .acc-card { background:#fff; border-radius:12px; border:1.5px solid #e0e0e0; overflow:hidden; transition:border-color .2s,box-shadow .2s; }
        .acc-card:hover { border-color:#ccc; box-shadow:0 4px 16px rgba(0,0,0,.05); }
        .acc-hd  { display:flex; align-items:center; gap:14px; padding:18px 22px; cursor:pointer; background:transparent; border:none; width:100%; text-align:left; }
        .acc-dot { width:11px; height:11px; border-radius:50%; flex-shrink:0; }
        .acc-ttl { font-size:15px; font-weight:600; color:#000; flex:1; }
        .acc-vl  { font-size:13px; color:#555; font-weight:500; margin-right:6px; }
        .acc-bdg { font-size:10.5px; font-weight:700; padding:3px 9px; border-radius:99px; color:#fff; }
        .acc-chev { color:#555; font-size:11px; transition:transform .25s; }
        .acc-subs { padding:0 22px 18px 48px; display:flex; flex-direction:column; gap:10px; }
        .acc-sub  { display:flex; align-items:flex-start; gap:10px; font-size:13.5px; color:#333; line-height:1.5; }
        .acc-blt  { width:5px; height:5px; border-radius:50%; background:#999; flex-shrink:0; margin-top:7px; }
        .acc-sv   { font-size:12px; color:#555; font-weight:500; margin-left:auto; white-space:nowrap; }
        .tl { position:relative; padding-left:28px; }
        .tl::before { content:''; position:absolute; left:6px; top:0; bottom:0; width:1px; background:#e0e0e0; }
        .tl-it { position:relative; padding-bottom:30px; }
        .tl-it:last-child { padding-bottom:0; }
        .tl-dot { position:absolute; left:-24px; top:5px; width:13px; height:13px; border-radius:50%; background:#ccc; border:2px solid #f8f8f8; }
        .tl-yr  { font-size:11px; font-weight:700; letter-spacing:.1em; color:#555; text-transform:uppercase; margin-bottom:4px; }
        .tl-ev  { font-size:14px; color:#333; line-height:1.6; }
        .val-grid { display:grid; gap:18px; grid-template-columns:1fr 1fr; }
        @media(min-width:1024px) { .val-grid { grid-template-columns:repeat(4,1fr); } }
        .val-card { background:#fff; border-radius:14px; border:1.5px solid #e0e0e0; padding:28px 22px; }
        .val-num  { font-size:40px; font-weight:600; color:#ccc; line-height:1; margin-bottom:12px; }
        .val-lbl  { font-size:15px; font-weight:600; color:#000; margin-bottom:10px; }
        .val-body { font-size:13.5px; color:#444; line-height:1.65; }
      `}</style>

      {/* ── HERO ── */}
      <div className="relative h-[400px] overflow-hidden">
        <img
          src={hero.image}
          alt="About NF Holding s Group"
          className="absolute inset-0 object-cover w-full h-full"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2070&q=80'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
        <div className="absolute inset-0 grid w-full h-full grid-cols-12 mx-auto max-w-screen-3xl">
          <div className="hidden col-span-1 lg:block" />
          <div className="flex items-center col-span-12 lg:col-span-10">
            <div style={{ padding: "80px 0 72px", position: "relative", zIndex: 1 }}>
              <p className="eyebrow" style={{ color: "rgba(255,255,255,0.8)" }}>{hero.eyebrow}</p>
              <h1 style={{ fontSize: "clamp(42px,6vw,76px)", fontWeight: 600, color: "#fff", lineHeight: 1.05, marginBottom: 24, maxWidth: 700 }}>
                {hero.headline}
              </h1>
              <p style={{ fontSize: 17, color: "rgba(255,255,255,0.9)", lineHeight: 1.7, maxWidth: 540, marginBottom: 40 }}>
                {hero.subheadline}
              </p>
              <div style={{ width: 52, height: 3, background: "#fff", borderRadius: 99, opacity: 0.7 }} />
            </div>
          </div>
          <div className="hidden col-span-1 lg:block" />
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="pg" style={{ marginTop: "64px" }}>
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
            <h2 className="heading" style={{ marginBottom: 24 }}>More than an investment group</h2>
            <p style={{ fontSize: 16, color: "#333", lineHeight: 1.75, marginBottom: 18 }}>{whoWeAre.para1}</p>
            <p style={{ fontSize: 16, color: "#333", lineHeight: 1.75 }}>{whoWeAre.para2}</p>
          </div>
          <div>
            <p className="eyebrow" style={{ marginBottom: 20 }}>Our Journey</p>
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
        <div style={{ marginBottom: 44 }}>
          <p className="eyebrow">Portfolio Structure</p>
          <h2 className="heading">Asset Allocation</h2>
          <p style={{ fontSize: 14.5, color: "#555", marginTop: 10, lineHeight: 1.6 }}>
            As at December 31, 2025 · Total AUM {TOTAL_AUM} · Sub-entities orbit around each parent asset
          </p>
        </div>
        <div className="orbit-flex">
          <AssetOrbit />
          <div className="legend">
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#555", marginBottom: 8 }}>Asset Classes</p>
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
      </div></div></div>

      {/* ── BREAKDOWN ── */}
      <div className="pg"><div className="col"><div className="sec">
        <div style={{ marginBottom: 40 }}>
          <p className="eyebrow">Deep Dive</p>
          <h2 className="heading">Asset Breakdown</h2>
          <p style={{ fontSize: 15, color: "#333", lineHeight: 1.7, maxWidth: 500, marginTop: 10 }}>
            Expand each asset class to explore constituent sub-entities.
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
                  {subs.length > 0 && <span className="acc-chev" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>▼</span>}
                </button>
                {isOpen && subs.length > 0 && (
                  <div className="acc-subs">
                    {subs.map((s, i) => (
                      <div key={i} className="acc-sub">
                        <div className="acc-blt" />
                        <div>
                          <div style={{ fontWeight: 600 }}>{s.name}</div>
                          <div style={{ fontSize: 12.5, color: "#555" }}>{s.desc}</div>
                        </div>
                        <span className="acc-sv">{s.value}</span>
                      </div>
                    ))}
                  </div>
                )}
                {isOpen && subs.length === 0 && (
                  <div style={{ padding: "0 22px 18px 48px", fontSize: 13.5, color: "#555", fontStyle: "italic" }}>
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
        <div style={{ marginBottom: 40 }}>
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