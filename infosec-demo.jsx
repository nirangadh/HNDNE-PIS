import { useState, useEffect, useRef } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const PRINCIPLES = [
  "CONFIDENTIALITY",
  "INTEGRITY",
  "AVAILABILITY",
  "AUTHENTICITY",
  "ACCOUNTABILITY",
];

const META = {
  CONFIDENTIALITY: {
    color: "#00ff41",
    threatColor: "#ff4040",
    threatName: "EAVESDROPPER",
    normalLabel: "AES-256",
    trivia: "Part of the CIA Triad. Implemented via encryption (symmetric / asymmetric).",
    normalDesc:
      "Packets are encrypted end-to-end. Only the intended recipient holds the decryption key — intercepted ciphertext is useless.",
    threatDesc:
      "An eavesdropper has tapped the channel and is capturing every packet. Because AES-256 is in use, the ciphertext reveals nothing about the plaintext.",
  },
  INTEGRITY: {
    color: "#ffcc00",
    threatColor: "#ff4040",
    threatName: "MAN-IN-MIDDLE",
    normalLabel: "SHA-OK",
    trivia: "Part of the CIA Triad. Verified via cryptographic hashes (SHA-256, HMAC) or digital signatures.",
    normalDesc:
      "Each packet carries a cryptographic hash of its payload. The receiver recomputes and compares — any modification in transit is detected immediately.",
    threatDesc:
      "A man-in-the-middle has altered the payload. The receiver recomputes the hash and finds a mismatch — the packet is rejected with a tamper alert.",
  },
  AVAILABILITY: {
    color: "#00ccff",
    threatColor: "#ff4040",
    threatName: "DDoS FLOOD",
    normalLabel: "REQ-OK",
    trivia: "Part of the CIA Triad. Threatened by DoS/DDoS, ransomware, and infrastructure failure.",
    normalDesc:
      "The channel is clear. Legitimate requests from the sender reach the receiver promptly and without interference.",
    threatDesc:
      "Flood traffic is saturating the channel. Legitimate packets are queued, dropped, and never reach the receiver — service is effectively denied.",
  },
  AUTHENTICITY: {
    color: "#cc44ff",
    threatColor: "#ff4040",
    threatName: "IMPERSONATOR",
    normalLabel: "SIG-VALID",
    trivia: "Extends the CIA Triad. Verified via digital signatures (RSA, ECDSA) and certificates (PKI).",
    normalDesc:
      "Each packet is signed with the sender's private key. The receiver verifies the signature against the sender's public key — identity is confirmed.",
    threatDesc:
      "An attacker is forging packets and claiming to be the legitimate sender. Signature verification fails — the receiver rejects the spoofed packet.",
  },
  ACCOUNTABILITY: {
    color: "#ff8800",
    threatColor: "#888888",
    threatName: "REPUDIATION",
    normalLabel: "LOGGED",
    trivia: "Enables non-repudiation. Every signed, timestamped action is irrefutably traceable to its originator.",
    normalDesc:
      "Every transmission is cryptographically signed and appended to an immutable audit log. The sender cannot later deny having sent any message.",
    threatDesc:
      "Packets are being sent without signatures. Without signed records, the sender can plausibly deny any transmission — non-repudiation is broken.",
  },
};

const MESSAGES = ["HELLO", "AUTH", "DATA", "PING", "FILE", "SYNC", "KEY", "ACK", "REQ", "CERT"];

let _pid = 0;
const nextPid = () => ++_pid;

// ─── CSS Injection ─────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=VT323&family=Share+Tech+Mono&display=swap');

  @keyframes pkt-travel {
    0%   { left:0%;    opacity:0; transform:translateY(-50%) scale(0.6); }
    5%   { opacity:1;  transform:translateY(-50%) scale(1); }
    95%  { opacity:1; }
    100% { left:100%; opacity:0; transform:translateY(-50%) scale(0.6); }
  }
  @keyframes pkt-blocked {
    0%   { left:0%;   opacity:0; transform:translateY(-50%) scale(0.6); }
    5%   { opacity:1; transform:translateY(-50%) scale(1); }
    55%  { left:80%;  opacity:1; transform:translateY(-50%) scale(1); }
    72%  { left:80%;  opacity:1; transform:translateY(-50%) scale(1.2); }
    88%  { left:80%;  opacity:0; }
    100% { left:80%;  opacity:0; }
  }
  @keyframes crt-scanline {
    0%   { top:-4px; opacity:0.7; }
    100% { top:101%; opacity:0; }
  }
  @keyframes threat-glow {
    0%,100% { box-shadow:0 0 6px #ff4040, 0 0 14px #ff4040; }
    50%     { box-shadow:0 0 14px #ff4040, 0 0 28px #ff4040, 0 0 48px #ff404055; }
  }
  @keyframes attacker-enter {
    from { opacity:0; transform:translate(-50%,-200%); }
    to   { opacity:1; transform:translate(-50%,-50%); }
  }
  @keyframes rx-ok {
    0%  { box-shadow:0 0 30px #00ff41, 0 0 60px #00ff41; }
    100%{ box-shadow:0 0 10px currentColor; }
  }
  @keyframes rx-warn {
    0%  { box-shadow:0 0 30px #ffcc00, 0 0 60px #ffcc00; }
    100%{ box-shadow:0 0 10px currentColor; }
  }
  @keyframes rx-block {
    0%  { box-shadow:0 0 30px #ff4040, 0 0 60px #ff4040; }
    100%{ box-shadow:0 0 10px currentColor; }
  }
  @keyframes blink {
    0%,100%{ opacity:1; } 50%{ opacity:0; }
  }
  @keyframes audit-enter {
    from{ opacity:0; transform:translateY(-5px); }
    to  { opacity:1; transform:translateY(0); }
  }
  @keyframes flicker {
    0%,96%,100%{ opacity:1; } 97%{ opacity:0.88; } 98%{ opacity:1; } 99%{ opacity:0.92; }
  }
  @keyframes node-idle {
    0%,100%{ box-shadow:0 0 8px currentColor, 0 0 16px currentColor; }
    50%    { box-shadow:0 0 12px currentColor, 0 0 24px currentColor; }
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function InfoSecDemo() {
  const [senderName, setSenderName]     = useState("ALICE");
  const [receiverName, setReceiverName] = useState("BOB");
  const [principle, setPrinciple]       = useState("CONFIDENTIALITY");
  const [threat, setThreat]             = useState(false);
  const [packets, setPackets]           = useState([]);
  const [rxStatus, setRxStatus]         = useState("idle"); // idle | ok | warn | block
  const [auditLog, setAuditLog]         = useState([]);
  const msgIdxRef = useRef(0);
  const senderRef = useRef(senderName);
  const receiverRef = useRef(receiverName);

  useEffect(() => { senderRef.current = senderName; },  [senderName]);
  useEffect(() => { receiverRef.current = receiverName; }, [receiverName]);

  const meta = META[principle];

  // Inject CSS once
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "isec-css";
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => document.getElementById("isec-css")?.remove();
  }, []);

  // Reset on principle change
  useEffect(() => {
    setPackets([]);
    setThreat(false);
    setRxStatus("idle");
    setAuditLog([]);
    msgIdxRef.current = 0;
  }, [principle]);

  // Packet spawner
  useEffect(() => {
    const TRAVEL = 2200;
    const isDoS = principle === "AVAILABILITY" && threat;

    const spawnNormal = () => {
      const id = nextPid();
      const msg = MESSAGES[msgIdxRef.current++ % MESSAGES.length];
      let label = meta.normalLabel, color = meta.color, blocked = false;

      if (threat) {
        switch (principle) {
          case "CONFIDENTIALITY": label = "AES-256";   color = meta.color;        break;
          case "INTEGRITY":       label = "HASH-FAIL"; color = "#ff4040";          break;
          case "AVAILABILITY":    label = "BLOCKED";   color = "#ff4040"; blocked = true; break;
          case "AUTHENTICITY":    label = "SIG-FAIL";  color = "#ff4040";          break;
          case "ACCOUNTABILITY":  label = "UNSIGNED";  color = "#888888";          break;
        }
      }

      const duration = TRAVEL + Math.random() * 200 - 100;
      setPackets(p => [...p.slice(-15), { id, msg, label, color, blocked, duration, yOff: 0, flood: false }]);

      setTimeout(() => {
        setPackets(p => p.filter(x => x.id !== id));
        if (!blocked) {
          let status = "ok";
          if (threat && ["INTEGRITY", "AUTHENTICITY", "ACCOUNTABILITY"].includes(principle)) status = "warn";
          setRxStatus(status);
          setTimeout(() => setRxStatus("idle"), 900);

          if (principle === "ACCOUNTABILITY") {
            const now = new Date();
            const t = [now.getHours(), now.getMinutes(), now.getSeconds()]
              .map(n => String(n).padStart(2, "0")).join(":");
            const hash = Math.random().toString(16).slice(2, 10).toUpperCase();
            setAuditLog(prev => [
              { id: nextPid(), time: t, from: senderRef.current, to: receiverRef.current, msg, signed: !threat, hash },
              ...prev,
            ].slice(0, 8));
          }
        } else {
          setRxStatus("block");
          setTimeout(() => setRxStatus("idle"), 900);
        }
      }, duration);
    };

    const spawnFlood = () => {
      const id = nextPid();
      const dur = 1100 + Math.random() * 600;
      const yOff = (Math.random() - 0.5) * 24;
      setPackets(p => [...p.slice(-20), { id, msg: "X", label: "FLOOD", color: "#ff4040", blocked: true, duration: dur, yOff, flood: true }]);
      setTimeout(() => setPackets(p => p.filter(x => x.id !== id)), dur);
    };

    const normalTimer = setInterval(spawnNormal, isDoS ? 2600 : 1900);
    const floodTimer  = isDoS ? setInterval(spawnFlood, 320) : null;
    spawnNormal();

    return () => {
      clearInterval(normalTimer);
      if (floodTimer) clearInterval(floodTimer);
    };
  }, [threat, principle, meta]);

  // Derived colours for receiver node
  const rxColor = {
    idle: meta.color,
    ok:    "#00ff41",
    warn:  "#ffcc00",
    block: "#ff4040",
  }[rxStatus];

  const rxLabel = {
    idle:  "● ONLINE",
    ok:    "▶ RECV OK",
    warn:  "⚠ REJECTED",
    block: "✗ BLOCKED",
  }[rxStatus];

  const rxAnim = {
    idle:  "none",
    ok:    "rx-ok 0.6s ease-out",
    warn:  "rx-warn 0.6s ease-out",
    block: "rx-block 0.6s ease-out",
  }[rxStatus];

  return (
    <div style={{
      background: "#050a05",
      minHeight: "100vh",
      fontFamily: "'Share Tech Mono', 'Courier New', monospace",
      color: "#00ff41",
      padding: "20px 24px",
      position: "relative",
      overflow: "hidden",
      animation: "flicker 14s infinite",
    }}>
      {/* CRT scanline sweep */}
      <div style={{
        position: "fixed", left: 0, right: 0, height: 3,
        background: "linear-gradient(transparent, rgba(0,255,65,0.14), transparent)",
        pointerEvents: "none",
        animation: "crt-scanline 6s linear infinite",
        zIndex: 9999,
      }} />

      {/* Grid overlay */}
      <div style={{
        position: "fixed", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,255,65,0.028) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,65,0.028) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto" }}>

        {/* ── HEADER ── */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 9, color: "#005f11", letterSpacing: "6px", marginBottom: 2 }}>
            ┌──────────────────────────────────────────────────┐
          </div>
          <h1 style={{
            fontFamily: "'VT323', monospace",
            fontSize: 42, letterSpacing: "8px", margin: 0,
            textShadow: "0 0 8px #00ff41, 0 0 20px #00ff41, 0 0 40px #00ff4166",
            color: "#00ff41",
            lineHeight: 1.1,
          }}>
            SECURE CHANNEL SIMULATOR
          </h1>
          <div style={{ fontSize: 10, color: "#008f11", marginTop: 4, letterSpacing: "4px" }}>
            CIA TRIAD · AUTHENTICITY · ACCOUNTABILITY
          </div>
          <div style={{ fontSize: 9, color: "#005f11", letterSpacing: "6px", marginTop: 2 }}>
            └──────────────────────────────────────────────────┘
          </div>
        </div>

        {/* ── PRINCIPLE TABS ── */}
        <div style={{ display: "flex", gap: 5, marginBottom: 22, flexWrap: "wrap", justifyContent: "center" }}>
          {PRINCIPLES.map(p => {
            const m = META[p];
            const active = p === principle;
            const shortLabel = { CONFIDENTIALITY: "CONFID.", INTEGRITY: "INTEGR.", AVAILABILITY: "AVAIL.", AUTHENTICITY: "AUTHEN.", ACCOUNTABILITY: "ACCTBL." }[p];
            return (
              <button key={p} onClick={() => setPrinciple(p)} style={{
                background: active ? m.color : "transparent",
                color: active ? "#050a05" : m.color,
                border: `1px solid ${m.color}`,
                padding: "7px 16px",
                fontFamily: "inherit",
                fontSize: 10,
                letterSpacing: "2px",
                cursor: "pointer",
                transition: "all 0.15s",
                boxShadow: active ? `0 0 16px ${m.color}, 0 0 30px ${m.color}44` : "none",
                textShadow: active ? "none" : `0 0 5px ${m.color}88`,
                fontWeight: active ? "bold" : "normal",
              }}>
                {shortLabel}
              </button>
            );
          })}
        </div>

        {/* ── ENDPOINT NAMES ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
          <NameInput value={senderName} onChange={setSenderName} label="SENDER NODE" color={meta.color} />
          <div style={{ fontSize: 9, color: "#005f11", letterSpacing: "3px", paddingBottom: 8 }}>
            ─────── CHANNEL ───────
          </div>
          <NameInput value={receiverName} onChange={setReceiverName} label="RECEIVER NODE" color={rxColor} align="right" />
        </div>

        {/* ── CHANNEL VISUALISATION ── */}
        <div style={{
          border: `1px solid ${meta.color}33`,
          background: "#070d07",
          padding: "20px 16px",
          marginBottom: 14,
          borderRadius: 2,
          position: "relative",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>

            {/* Node A */}
            <NodeBox name={senderName} label="TX" color={meta.color} statusText="● TX ONLINE" anim="node-idle 3s ease-in-out infinite" />

            {/* Wire + packets */}
            <div style={{ flex: 1, position: "relative", height: 80, overflow: "hidden" }}>
              {/* Wire */}
              <div style={{
                position: "absolute", top: "50%", left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, ${meta.color}99 0%, ${meta.color}44 50%, ${meta.color}99 100%)`,
                transform: "translateY(-50%)",
              }} />

              {/* Attacker node */}
              {threat && (
                <div style={{
                  position: "absolute", left: "50%", top: "50%",
                  animation: "attacker-enter 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
                  zIndex: 8,
                  pointerEvents: "none",
                }}>
                  <AttackerNode label={meta.threatName} />
                </div>
              )}

              {/* Packets */}
              {packets.map(p => (
                <div key={p.id} style={{
                  position: "absolute",
                  top: `calc(50% + ${p.yOff}px)`,
                  left: 0,
                  transform: "translateY(-50%)",
                  animation: `${p.blocked ? "pkt-blocked" : "pkt-travel"} ${p.duration}ms linear forwards`,
                  background: "#050a05",
                  border: `1px solid ${p.color}`,
                  color: p.color,
                  fontSize: p.flood ? 8 : 9,
                  padding: p.flood ? "1px 5px" : "3px 8px",
                  letterSpacing: "1px",
                  whiteSpace: "nowrap",
                  boxShadow: `0 0 ${p.flood ? 3 : 7}px ${p.color}`,
                  textShadow: `0 0 4px ${p.color}`,
                  zIndex: p.flood ? 3 : 6,
                  lineHeight: 1.2,
                }}>
                  {p.flood ? "FLOOD" : `${p.msg}:${p.label}`}
                </div>
              ))}
            </div>

            {/* Node B */}
            <NodeBox name={receiverName} label="RX" color={rxColor} statusText={rxLabel} anim={rxAnim} />
          </div>
        </div>

        {/* ── INFO + CONTROLS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>

          {/* Principle description */}
          <div style={{ border: `1px solid ${meta.color}2a`, background: "#070d07", padding: "14px 16px" }}>
            <div style={{ fontSize: 9, color: "#008f11", letterSpacing: "4px", marginBottom: 8 }}>
              ▸ {principle}
            </div>
            <div style={{
              fontSize: 11,
              color: threat ? "#ff9090" : meta.color,
              lineHeight: 1.75,
              transition: "color 0.3s",
            }}>
              {threat ? meta.threatDesc : meta.normalDesc}
            </div>
            <div style={{
              fontSize: 9, color: "#005f11", marginTop: 10,
              borderTop: `1px solid ${meta.color}1a`, paddingTop: 8, lineHeight: 1.6,
            }}>
              ℹ {meta.trivia}
            </div>
          </div>

          {/* Threat control */}
          <div style={{
            border: `1px solid ${threat ? "#ff404044" : "#008f1122"}`,
            background: "#070d07",
            padding: "14px 16px",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            transition: "border-color 0.3s",
          }}>
            <div style={{ fontSize: 9, color: "#008f11", letterSpacing: "4px", marginBottom: 8 }}>
              ▸ THREAT SIMULATION
            </div>
            <div style={{ fontSize: 11, color: threat ? "#ff6060" : "#4a8f4a", lineHeight: 1.7, minHeight: 44 }}>
              {threat
                ? `ACTIVE THREAT: ${meta.threatName}`
                : "Channel secure. Activate a threat to observe the security failure mode for this principle."}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
              <button onClick={() => setThreat(v => !v)} style={{
                background: threat ? "#ff4040" : "transparent",
                color: threat ? "#050a05" : "#ff4040",
                border: "1px solid #ff4040",
                padding: "9px 20px",
                fontFamily: "inherit",
                fontSize: 11,
                letterSpacing: "2px",
                cursor: "pointer",
                boxShadow: threat ? "0 0 20px #ff4040, 0 0 40px #ff404055" : "none",
                transition: "all 0.2s",
                letterSpacing: "3px",
              }}>
                {threat ? "■ NEUTRALISE" : "▶ ACTIVATE"}
              </button>
              <span style={{
                fontSize: 11,
                color: threat ? "#ff4040" : "#00cc33",
                animation: threat ? "blink 1s infinite" : "none",
                textShadow: threat ? "0 0 8px #ff4040" : "0 0 6px #00cc33",
                letterSpacing: "2px",
              }}>
                {threat ? "⚠ THREAT" : "● SECURE"}
              </span>
            </div>
          </div>
        </div>

        {/* ── AUDIT LOG (ACCOUNTABILITY only) ── */}
        {principle === "ACCOUNTABILITY" && (
          <div style={{ border: `1px solid ${meta.color}2a`, background: "#070d07", padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: "#008f11", letterSpacing: "4px", marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
              <span>▸ AUDIT LOG</span>
              <span style={{ color: threat ? "#ff4040" : "#00ff41" }}>
                {threat ? "⚠ NON-REPUDIATION DEGRADED — SIGNATURES ABSENT" : "✓ NON-REPUDIATION ACTIVE"}
              </span>
            </div>
            {auditLog.length === 0 ? (
              <div style={{ fontSize: 10, color: "#004a00", fontStyle: "normal", letterSpacing: "2px" }}>
                Awaiting transmissions…
              </div>
            ) : (
              <div style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                {/* Header row */}
                <div style={{ fontSize: 9, color: "#008f11", display: "flex", gap: 12, paddingBottom: 4, borderBottom: `1px solid ${meta.color}22`, marginBottom: 4 }}>
                  <span style={{ minWidth: 72 }}>TIMESTAMP</span>
                  <span style={{ minWidth: 80 }}>FROM→TO</span>
                  <span style={{ minWidth: 50 }}>MSG</span>
                  <span style={{ minWidth: 90 }}>HASH</span>
                  <span>SIGNATURE</span>
                </div>
                {auditLog.map((e, i) => (
                  <div key={e.id} style={{
                    fontSize: 10,
                    color: e.signed ? meta.color : "#666",
                    borderBottom: `1px solid ${meta.color}14`,
                    padding: "4px 0",
                    display: "flex", gap: 12, flexWrap: "nowrap",
                    animation: i === 0 ? "audit-enter 0.35s ease-out" : "none",
                    letterSpacing: "0.5px",
                  }}>
                    <span style={{ color: "#008f11", minWidth: 72 }}>[{e.time}]</span>
                    <span style={{ minWidth: 80 }}>{e.from}→{e.to}</span>
                    <span style={{ minWidth: 50 }}>MSG:{e.msg}</span>
                    <span style={{ color: "#008f11", minWidth: 90, fontFamily: "monospace" }}>0x{e.hash}</span>
                    <span style={{ color: e.signed ? "#00ff41" : "#ff4040", textShadow: e.signed ? "0 0 6px #00ff41" : "0 0 6px #ff4040" }}>
                      {e.signed ? "✓ SIG:PRESENT" : "✗ SIG:ABSENT"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", fontSize: 9, color: "#003a00", letterSpacing: "4px", marginTop: 8 }}>
          INFOSEC TERMINAL v1.0 · SIMULATED ENVIRONMENT · FOR EDUCATIONAL USE ONLY
        </div>

      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NameInput({ value, onChange, label, color, align = "left" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: align === "right" ? "flex-end" : "flex-start" }}>
      <div style={{ fontSize: 9, color: "#008f11", letterSpacing: "3px" }}>{label}</div>
      <input
        value={value}
        maxLength={10}
        onChange={e => onChange(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
        style={{
          background: "transparent",
          border: `1px solid ${color}`,
          color: color,
          fontFamily: "'VT323', 'Courier New', monospace",
          fontSize: 22,
          padding: "4px 10px",
          letterSpacing: "4px",
          width: 130,
          outline: "none",
          textShadow: `0 0 8px ${color}`,
          boxShadow: `0 0 6px ${color}22`,
          textAlign: align,
          transition: "border-color 0.3s, box-shadow 0.3s, color 0.3s",
        }}
      />
    </div>
  );
}

function NodeBox({ name, label, color, statusText, anim }) {
  return (
    <div style={{
      border: `2px solid ${color}`,
      background: "#050a05",
      padding: "10px 16px",
      textAlign: "center",
      minWidth: 110,
      flexShrink: 0,
      position: "relative",
      animation: anim,
      transition: "border-color 0.3s",
      color: color,
    }}>
      <div style={{ fontSize: 8, color: "#008f11", letterSpacing: "3px", marginBottom: 4 }}>{label}</div>
      <div style={{
        fontFamily: "'VT323', monospace",
        fontSize: 26,
        letterSpacing: "3px",
        color: color,
        textShadow: `0 0 10px ${color}`,
        transition: "color 0.3s, text-shadow 0.3s",
        lineHeight: 1,
      }}>
        {name || "???"}
      </div>
      <div style={{
        fontSize: 8,
        color: color,
        marginTop: 5,
        letterSpacing: "1px",
        textShadow: `0 0 6px ${color}`,
        transition: "color 0.3s",
      }}>
        {statusText}
      </div>
    </div>
  );
}

function AttackerNode({ label }) {
  return (
    <div style={{
      border: "2px solid #ff4040",
      background: "#100505",
      padding: "4px 10px",
      textAlign: "center",
      animation: "threat-glow 1.1s ease-in-out infinite",
      minWidth: 88,
      transform: "translate(-50%, -50%)",
    }}>
      <div style={{ fontSize: 8, color: "#ff4040", letterSpacing: "2px", marginBottom: 2 }}>⚠ THREAT</div>
      <div style={{
        fontFamily: "'VT323', monospace",
        fontSize: 14,
        color: "#ff4040",
        letterSpacing: "1px",
        whiteSpace: "nowrap",
        textShadow: "0 0 8px #ff4040",
      }}>
        {label}
      </div>
    </div>
  );
}
