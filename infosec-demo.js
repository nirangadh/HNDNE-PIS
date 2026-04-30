function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
import { useState, useEffect, useRef } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

var PRINCIPLES = ["CONFIDENTIALITY", "INTEGRITY", "AVAILABILITY", "AUTHENTICITY", "ACCOUNTABILITY"];
var META = {
  CONFIDENTIALITY: {
    color: "#00ff41",
    threatColor: "#ff4040",
    threatName: "EAVESDROPPER",
    normalLabel: "AES-256",
    trivia: "Part of the CIA Triad. Implemented via encryption (symmetric / asymmetric).",
    normalDesc: "Packets are encrypted end-to-end. Only the intended recipient holds the decryption key — intercepted ciphertext is useless.",
    threatDesc: "An eavesdropper has tapped the channel and is capturing every packet. Because AES-256 is in use, the ciphertext reveals nothing about the plaintext."
  },
  INTEGRITY: {
    color: "#ffcc00",
    threatColor: "#ff4040",
    threatName: "MAN-IN-MIDDLE",
    normalLabel: "SHA-OK",
    trivia: "Part of the CIA Triad. Verified via cryptographic hashes (SHA-256, HMAC) or digital signatures.",
    normalDesc: "Each packet carries a cryptographic hash of its payload. The receiver recomputes and compares — any modification in transit is detected immediately.",
    threatDesc: "A man-in-the-middle has altered the payload. The receiver recomputes the hash and finds a mismatch — the packet is rejected with a tamper alert."
  },
  AVAILABILITY: {
    color: "#00ccff",
    threatColor: "#ff4040",
    threatName: "DDoS FLOOD",
    normalLabel: "REQ-OK",
    trivia: "Part of the CIA Triad. Threatened by DoS/DDoS, ransomware, and infrastructure failure.",
    normalDesc: "The channel is clear. Legitimate requests from the sender reach the receiver promptly and without interference.",
    threatDesc: "Flood traffic is saturating the channel. Legitimate packets are queued, dropped, and never reach the receiver — service is effectively denied."
  },
  AUTHENTICITY: {
    color: "#cc44ff",
    threatColor: "#ff4040",
    threatName: "IMPERSONATOR",
    normalLabel: "SIG-VALID",
    trivia: "Extends the CIA Triad. Verified via digital signatures (RSA, ECDSA) and certificates (PKI).",
    normalDesc: "Each packet is signed with the sender's private key. The receiver verifies the signature against the sender's public key — identity is confirmed.",
    threatDesc: "An attacker is forging packets and claiming to be the legitimate sender. Signature verification fails — the receiver rejects the spoofed packet."
  },
  ACCOUNTABILITY: {
    color: "#ff8800",
    threatColor: "#888888",
    threatName: "REPUDIATION",
    normalLabel: "LOGGED",
    trivia: "Enables non-repudiation. Every signed, timestamped action is irrefutably traceable to its originator.",
    normalDesc: "Every transmission is cryptographically signed and appended to an immutable audit log. The sender cannot later deny having sent any message.",
    threatDesc: "Packets are being sent without signatures. Without signed records, the sender can plausibly deny any transmission — non-repudiation is broken."
  }
};
var MESSAGES = ["HELLO", "AUTH", "DATA", "PING", "FILE", "SYNC", "KEY", "ACK", "REQ", "CERT"];
var _pid = 0;
var nextPid = function nextPid() {
  return ++_pid;
};

// ─── CSS Injection ─────────────────────────────────────────────────────────────

var CSS = "\n  @import url('https://fonts.googleapis.com/css2?family=VT323&family=Share+Tech+Mono&display=swap');\n\n  @keyframes pkt-travel {\n    0%   { left:0%;    opacity:0; transform:translateY(-50%) scale(0.6); }\n    5%   { opacity:1;  transform:translateY(-50%) scale(1); }\n    95%  { opacity:1; }\n    100% { left:100%; opacity:0; transform:translateY(-50%) scale(0.6); }\n  }\n  @keyframes pkt-blocked {\n    0%   { left:0%;   opacity:0; transform:translateY(-50%) scale(0.6); }\n    5%   { opacity:1; transform:translateY(-50%) scale(1); }\n    55%  { left:80%;  opacity:1; transform:translateY(-50%) scale(1); }\n    72%  { left:80%;  opacity:1; transform:translateY(-50%) scale(1.2); }\n    88%  { left:80%;  opacity:0; }\n    100% { left:80%;  opacity:0; }\n  }\n  @keyframes crt-scanline {\n    0%   { top:-4px; opacity:0.7; }\n    100% { top:101%; opacity:0; }\n  }\n  @keyframes threat-glow {\n    0%,100% { box-shadow:0 0 6px #ff4040, 0 0 14px #ff4040; }\n    50%     { box-shadow:0 0 14px #ff4040, 0 0 28px #ff4040, 0 0 48px #ff404055; }\n  }\n  @keyframes attacker-enter {\n    from { opacity:0; transform:translate(-50%,-200%); }\n    to   { opacity:1; transform:translate(-50%,-50%); }\n  }\n  @keyframes rx-ok {\n    0%  { box-shadow:0 0 30px #00ff41, 0 0 60px #00ff41; }\n    100%{ box-shadow:0 0 10px currentColor; }\n  }\n  @keyframes rx-warn {\n    0%  { box-shadow:0 0 30px #ffcc00, 0 0 60px #ffcc00; }\n    100%{ box-shadow:0 0 10px currentColor; }\n  }\n  @keyframes rx-block {\n    0%  { box-shadow:0 0 30px #ff4040, 0 0 60px #ff4040; }\n    100%{ box-shadow:0 0 10px currentColor; }\n  }\n  @keyframes blink {\n    0%,100%{ opacity:1; } 50%{ opacity:0; }\n  }\n  @keyframes audit-enter {\n    from{ opacity:0; transform:translateY(-5px); }\n    to  { opacity:1; transform:translateY(0); }\n  }\n  @keyframes flicker {\n    0%,96%,100%{ opacity:1; } 97%{ opacity:0.88; } 98%{ opacity:1; } 99%{ opacity:0.92; }\n  }\n  @keyframes node-idle {\n    0%,100%{ box-shadow:0 0 8px currentColor, 0 0 16px currentColor; }\n    50%    { box-shadow:0 0 12px currentColor, 0 0 24px currentColor; }\n  }\n";

// ─── Component ────────────────────────────────────────────────────────────────

export default function InfoSecDemo() {
  var _useState = useState("ALICE"),
    _useState2 = _slicedToArray(_useState, 2),
    senderName = _useState2[0],
    setSenderName = _useState2[1];
  var _useState3 = useState("BOB"),
    _useState4 = _slicedToArray(_useState3, 2),
    receiverName = _useState4[0],
    setReceiverName = _useState4[1];
  var _useState5 = useState("CONFIDENTIALITY"),
    _useState6 = _slicedToArray(_useState5, 2),
    principle = _useState6[0],
    setPrinciple = _useState6[1];
  var _useState7 = useState(false),
    _useState8 = _slicedToArray(_useState7, 2),
    threat = _useState8[0],
    setThreat = _useState8[1];
  var _useState9 = useState([]),
    _useState0 = _slicedToArray(_useState9, 2),
    packets = _useState0[0],
    setPackets = _useState0[1];
  var _useState1 = useState("idle"),
    _useState10 = _slicedToArray(_useState1, 2),
    rxStatus = _useState10[0],
    setRxStatus = _useState10[1]; // idle | ok | warn | block
  var _useState11 = useState([]),
    _useState12 = _slicedToArray(_useState11, 2),
    auditLog = _useState12[0],
    setAuditLog = _useState12[1];
  var msgIdxRef = useRef(0);
  var senderRef = useRef(senderName);
  var receiverRef = useRef(receiverName);
  useEffect(function () {
    senderRef.current = senderName;
  }, [senderName]);
  useEffect(function () {
    receiverRef.current = receiverName;
  }, [receiverName]);
  var meta = META[principle];

  // Inject CSS once
  useEffect(function () {
    var el = document.createElement("style");
    el.id = "isec-css";
    el.textContent = CSS;
    document.head.appendChild(el);
    return function () {
      var _document$getElementB;
      return (_document$getElementB = document.getElementById("isec-css")) === null || _document$getElementB === void 0 ? void 0 : _document$getElementB.remove();
    };
  }, []);

  // Reset on principle change
  useEffect(function () {
    setPackets([]);
    setThreat(false);
    setRxStatus("idle");
    setAuditLog([]);
    msgIdxRef.current = 0;
  }, [principle]);

  // Packet spawner
  useEffect(function () {
    var TRAVEL = 2200;
    var isDoS = principle === "AVAILABILITY" && threat;
    var spawnNormal = function spawnNormal() {
      var id = nextPid();
      var msg = MESSAGES[msgIdxRef.current++ % MESSAGES.length];
      var label = meta.normalLabel,
        color = meta.color,
        blocked = false;
      if (threat) {
        switch (principle) {
          case "CONFIDENTIALITY":
            label = "AES-256";
            color = meta.color;
            break;
          case "INTEGRITY":
            label = "HASH-FAIL";
            color = "#ff4040";
            break;
          case "AVAILABILITY":
            label = "BLOCKED";
            color = "#ff4040";
            blocked = true;
            break;
          case "AUTHENTICITY":
            label = "SIG-FAIL";
            color = "#ff4040";
            break;
          case "ACCOUNTABILITY":
            label = "UNSIGNED";
            color = "#888888";
            break;
        }
      }
      var duration = TRAVEL + Math.random() * 200 - 100;
      setPackets(function (p) {
        return [].concat(_toConsumableArray(p.slice(-15)), [{
          id: id,
          msg: msg,
          label: label,
          color: color,
          blocked: blocked,
          duration: duration,
          yOff: 0,
          flood: false
        }]);
      });
      setTimeout(function () {
        setPackets(function (p) {
          return p.filter(function (x) {
            return x.id !== id;
          });
        });
        if (!blocked) {
          var status = "ok";
          if (threat && ["INTEGRITY", "AUTHENTICITY", "ACCOUNTABILITY"].includes(principle)) status = "warn";
          setRxStatus(status);
          setTimeout(function () {
            return setRxStatus("idle");
          }, 900);
          if (principle === "ACCOUNTABILITY") {
            var now = new Date();
            var t = [now.getHours(), now.getMinutes(), now.getSeconds()].map(function (n) {
              return String(n).padStart(2, "0");
            }).join(":");
            var hash = Math.random().toString(16).slice(2, 10).toUpperCase();
            setAuditLog(function (prev) {
              return [{
                id: nextPid(),
                time: t,
                from: senderRef.current,
                to: receiverRef.current,
                msg: msg,
                signed: !threat,
                hash: hash
              }].concat(_toConsumableArray(prev)).slice(0, 8);
            });
          }
        } else {
          setRxStatus("block");
          setTimeout(function () {
            return setRxStatus("idle");
          }, 900);
        }
      }, duration);
    };
    var spawnFlood = function spawnFlood() {
      var id = nextPid();
      var dur = 1100 + Math.random() * 600;
      var yOff = (Math.random() - 0.5) * 24;
      setPackets(function (p) {
        return [].concat(_toConsumableArray(p.slice(-20)), [{
          id: id,
          msg: "X",
          label: "FLOOD",
          color: "#ff4040",
          blocked: true,
          duration: dur,
          yOff: yOff,
          flood: true
        }]);
      });
      setTimeout(function () {
        return setPackets(function (p) {
          return p.filter(function (x) {
            return x.id !== id;
          });
        });
      }, dur);
    };
    var normalTimer = setInterval(spawnNormal, isDoS ? 2600 : 1900);
    var floodTimer = isDoS ? setInterval(spawnFlood, 320) : null;
    spawnNormal();
    return function () {
      clearInterval(normalTimer);
      if (floodTimer) clearInterval(floodTimer);
    };
  }, [threat, principle, meta]);

  // Derived colours for receiver node
  var rxColor = {
    idle: meta.color,
    ok: "#00ff41",
    warn: "#ffcc00",
    block: "#ff4040"
  }[rxStatus];
  var rxLabel = {
    idle: "● ONLINE",
    ok: "▶ RECV OK",
    warn: "⚠ REJECTED",
    block: "✗ BLOCKED"
  }[rxStatus];
  var rxAnim = {
    idle: "none",
    ok: "rx-ok 0.6s ease-out",
    warn: "rx-warn 0.6s ease-out",
    block: "rx-block 0.6s ease-out"
  }[rxStatus];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#050a05",
      minHeight: "100vh",
      fontFamily: "'Share Tech Mono', 'Courier New', monospace",
      color: "#00ff41",
      padding: "20px 24px",
      position: "relative",
      overflow: "hidden",
      animation: "flicker 14s infinite"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      left: 0,
      right: 0,
      height: 3,
      background: "linear-gradient(transparent, rgba(0,255,65,0.14), transparent)",
      pointerEvents: "none",
      animation: "crt-scanline 6s linear infinite",
      zIndex: 9999
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      backgroundImage: "\n          linear-gradient(rgba(0,255,65,0.028) 1px, transparent 1px),\n          linear-gradient(90deg, rgba(0,255,65,0.028) 1px, transparent 1px)\n        ",
      backgroundSize: "48px 48px",
      pointerEvents: "none",
      zIndex: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 1,
      maxWidth: 860,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: "#005f11",
      letterSpacing: "6px",
      marginBottom: 2
    }
  }, "\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "'VT323', monospace",
      fontSize: 42,
      letterSpacing: "8px",
      margin: 0,
      textShadow: "0 0 8px #00ff41, 0 0 20px #00ff41, 0 0 40px #00ff4166",
      color: "#00ff41",
      lineHeight: 1.1
    }
  }, "SECURE CHANNEL SIMULATOR"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#008f11",
      marginTop: 4,
      letterSpacing: "4px"
    }
  }, "CIA TRIAD \xB7 AUTHENTICITY \xB7 ACCOUNTABILITY"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: "#005f11",
      letterSpacing: "6px",
      marginTop: 2
    }
  }, "\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 5,
      marginBottom: 22,
      flexWrap: "wrap",
      justifyContent: "center"
    }
  }, PRINCIPLES.map(function (p) {
    var m = META[p];
    var active = p === principle;
    var shortLabel = {
      CONFIDENTIALITY: "CONFID.",
      INTEGRITY: "INTEGR.",
      AVAILABILITY: "AVAIL.",
      AUTHENTICITY: "AUTHEN.",
      ACCOUNTABILITY: "ACCTBL."
    }[p];
    return /*#__PURE__*/React.createElement("button", {
      key: p,
      onClick: function onClick() {
        return setPrinciple(p);
      },
      style: {
        background: active ? m.color : "transparent",
        color: active ? "#050a05" : m.color,
        border: "1px solid ".concat(m.color),
        padding: "7px 16px",
        fontFamily: "inherit",
        fontSize: 10,
        letterSpacing: "2px",
        cursor: "pointer",
        transition: "all 0.15s",
        boxShadow: active ? "0 0 16px ".concat(m.color, ", 0 0 30px ").concat(m.color, "44") : "none",
        textShadow: active ? "none" : "0 0 5px ".concat(m.color, "88"),
        fontWeight: active ? "bold" : "normal"
      }
    }, shortLabel);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(NameInput, {
    value: senderName,
    onChange: setSenderName,
    label: "SENDER NODE",
    color: meta.color
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: "#005f11",
      letterSpacing: "3px",
      paddingBottom: 8
    }
  }, "\u2500\u2500\u2500\u2500\u2500\u2500\u2500 CHANNEL \u2500\u2500\u2500\u2500\u2500\u2500\u2500"), /*#__PURE__*/React.createElement(NameInput, {
    value: receiverName,
    onChange: setReceiverName,
    label: "RECEIVER NODE",
    color: rxColor,
    align: "right"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid ".concat(meta.color, "33"),
      background: "#070d07",
      padding: "20px 16px",
      marginBottom: 14,
      borderRadius: 2,
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 0
    }
  }, /*#__PURE__*/React.createElement(NodeBox, {
    name: senderName,
    label: "TX",
    color: meta.color,
    statusText: "\u25CF TX ONLINE",
    anim: "node-idle 3s ease-in-out infinite"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      position: "relative",
      height: 80,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: "50%",
      left: 0,
      right: 0,
      height: 2,
      background: "linear-gradient(90deg, ".concat(meta.color, "99 0%, ").concat(meta.color, "44 50%, ").concat(meta.color, "99 100%)"),
      transform: "translateY(-50%)"
    }
  }), threat && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "50%",
      top: "50%",
      animation: "attacker-enter 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
      zIndex: 8,
      pointerEvents: "none"
    }
  }, /*#__PURE__*/React.createElement(AttackerNode, {
    label: meta.threatName
  })), packets.map(function (p) {
    return /*#__PURE__*/React.createElement("div", {
      key: p.id,
      style: {
        position: "absolute",
        top: "calc(50% + ".concat(p.yOff, "px)"),
        left: 0,
        transform: "translateY(-50%)",
        animation: "".concat(p.blocked ? "pkt-blocked" : "pkt-travel", " ").concat(p.duration, "ms linear forwards"),
        background: "#050a05",
        border: "1px solid ".concat(p.color),
        color: p.color,
        fontSize: p.flood ? 8 : 9,
        padding: p.flood ? "1px 5px" : "3px 8px",
        letterSpacing: "1px",
        whiteSpace: "nowrap",
        boxShadow: "0 0 ".concat(p.flood ? 3 : 7, "px ").concat(p.color),
        textShadow: "0 0 4px ".concat(p.color),
        zIndex: p.flood ? 3 : 6,
        lineHeight: 1.2
      }
    }, p.flood ? "FLOOD" : "".concat(p.msg, ":").concat(p.label));
  })), /*#__PURE__*/React.createElement(NodeBox, {
    name: receiverName,
    label: "RX",
    color: rxColor,
    statusText: rxLabel,
    anim: rxAnim
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid ".concat(meta.color, "2a"),
      background: "#070d07",
      padding: "14px 16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: "#008f11",
      letterSpacing: "4px",
      marginBottom: 8
    }
  }, "\u25B8 ", principle), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: threat ? "#ff9090" : meta.color,
      lineHeight: 1.75,
      transition: "color 0.3s"
    }
  }, threat ? meta.threatDesc : meta.normalDesc), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: "#005f11",
      marginTop: 10,
      borderTop: "1px solid ".concat(meta.color, "1a"),
      paddingTop: 8,
      lineHeight: 1.6
    }
  }, "\u2139 ", meta.trivia)), /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid ".concat(threat ? "#ff404044" : "#008f1122"),
      background: "#070d07",
      padding: "14px 16px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      transition: "border-color 0.3s"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: "#008f11",
      letterSpacing: "4px",
      marginBottom: 8
    }
  }, "\u25B8 THREAT SIMULATION"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: threat ? "#ff6060" : "#4a8f4a",
      lineHeight: 1.7,
      minHeight: 44
    }
  }, threat ? "ACTIVE THREAT: ".concat(meta.threatName) : "Channel secure. Activate a threat to observe the security failure mode for this principle."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setThreat(function (v) {
        return !v;
      });
    },
    style: _defineProperty({
      background: threat ? "#ff4040" : "transparent",
      color: threat ? "#050a05" : "#ff4040",
      border: "1px solid #ff4040",
      padding: "9px 20px",
      fontFamily: "inherit",
      fontSize: 11,
      letterSpacing: "2px",
      cursor: "pointer",
      boxShadow: threat ? "0 0 20px #ff4040, 0 0 40px #ff404055" : "none",
      transition: "all 0.2s"
    }, "letterSpacing", "3px")
  }, threat ? "■ NEUTRALISE" : "▶ ACTIVATE"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: threat ? "#ff4040" : "#00cc33",
      animation: threat ? "blink 1s infinite" : "none",
      textShadow: threat ? "0 0 8px #ff4040" : "0 0 6px #00cc33",
      letterSpacing: "2px"
    }
  }, threat ? "⚠ THREAT" : "● SECURE")))), principle === "ACCOUNTABILITY" && /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid ".concat(meta.color, "2a"),
      background: "#070d07",
      padding: "14px 16px",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: "#008f11",
      letterSpacing: "4px",
      marginBottom: 10,
      display: "flex",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u25B8 AUDIT LOG"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: threat ? "#ff4040" : "#00ff41"
    }
  }, threat ? "⚠ NON-REPUDIATION DEGRADED — SIGNATURES ABSENT" : "✓ NON-REPUDIATION ACTIVE")), auditLog.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#004a00",
      fontStyle: "normal",
      letterSpacing: "2px"
    }
  }, "Awaiting transmissions\u2026") : /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Share Tech Mono', monospace"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: "#008f11",
      display: "flex",
      gap: 12,
      paddingBottom: 4,
      borderBottom: "1px solid ".concat(meta.color, "22"),
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 72
    }
  }, "TIMESTAMP"), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 80
    }
  }, "FROM\u2192TO"), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 50
    }
  }, "MSG"), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 90
    }
  }, "HASH"), /*#__PURE__*/React.createElement("span", null, "SIGNATURE")), auditLog.map(function (e, i) {
    return /*#__PURE__*/React.createElement("div", {
      key: e.id,
      style: {
        fontSize: 10,
        color: e.signed ? meta.color : "#666",
        borderBottom: "1px solid ".concat(meta.color, "14"),
        padding: "4px 0",
        display: "flex",
        gap: 12,
        flexWrap: "nowrap",
        animation: i === 0 ? "audit-enter 0.35s ease-out" : "none",
        letterSpacing: "0.5px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "#008f11",
        minWidth: 72
      }
    }, "[", e.time, "]"), /*#__PURE__*/React.createElement("span", {
      style: {
        minWidth: 80
      }
    }, e.from, "\u2192", e.to), /*#__PURE__*/React.createElement("span", {
      style: {
        minWidth: 50
      }
    }, "MSG:", e.msg), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "#008f11",
        minWidth: 90,
        fontFamily: "monospace"
      }
    }, "0x", e.hash), /*#__PURE__*/React.createElement("span", {
      style: {
        color: e.signed ? "#00ff41" : "#ff4040",
        textShadow: e.signed ? "0 0 6px #00ff41" : "0 0 6px #ff4040"
      }
    }, e.signed ? "✓ SIG:PRESENT" : "✗ SIG:ABSENT"));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      fontSize: 9,
      color: "#003a00",
      letterSpacing: "4px",
      marginTop: 8
    }
  }, "INFOSEC TERMINAL v1.0 \xB7 SIMULATED ENVIRONMENT \xB7 FOR EDUCATIONAL USE ONLY")));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NameInput(_ref2) {
  var value = _ref2.value,
    _onChange = _ref2.onChange,
    label = _ref2.label,
    color = _ref2.color,
    _ref2$align = _ref2.align,
    align = _ref2$align === void 0 ? "left" : _ref2$align;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4,
      alignItems: align === "right" ? "flex-end" : "flex-start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: "#008f11",
      letterSpacing: "3px"
    }
  }, label), /*#__PURE__*/React.createElement("input", {
    value: value,
    maxLength: 10,
    onChange: function onChange(e) {
      return _onChange(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""));
    },
    style: {
      background: "transparent",
      border: "1px solid ".concat(color),
      color: color,
      fontFamily: "'VT323', 'Courier New', monospace",
      fontSize: 22,
      padding: "4px 10px",
      letterSpacing: "4px",
      width: 130,
      outline: "none",
      textShadow: "0 0 8px ".concat(color),
      boxShadow: "0 0 6px ".concat(color, "22"),
      textAlign: align,
      transition: "border-color 0.3s, box-shadow 0.3s, color 0.3s"
    }
  }));
}
function NodeBox(_ref3) {
  var name = _ref3.name,
    label = _ref3.label,
    color = _ref3.color,
    statusText = _ref3.statusText,
    anim = _ref3.anim;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      border: "2px solid ".concat(color),
      background: "#050a05",
      padding: "10px 16px",
      textAlign: "center",
      minWidth: 110,
      flexShrink: 0,
      position: "relative",
      animation: anim,
      transition: "border-color 0.3s",
      color: color
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 8,
      color: "#008f11",
      letterSpacing: "3px",
      marginBottom: 4
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'VT323', monospace",
      fontSize: 26,
      letterSpacing: "3px",
      color: color,
      textShadow: "0 0 10px ".concat(color),
      transition: "color 0.3s, text-shadow 0.3s",
      lineHeight: 1
    }
  }, name || "???"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 8,
      color: color,
      marginTop: 5,
      letterSpacing: "1px",
      textShadow: "0 0 6px ".concat(color),
      transition: "color 0.3s"
    }
  }, statusText));
}
function AttackerNode(_ref4) {
  var label = _ref4.label;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      border: "2px solid #ff4040",
      background: "#100505",
      padding: "4px 10px",
      textAlign: "center",
      animation: "threat-glow 1.1s ease-in-out infinite",
      minWidth: 88,
      transform: "translate(-50%, -50%)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 8,
      color: "#ff4040",
      letterSpacing: "2px",
      marginBottom: 2
    }
  }, "\u26A0 THREAT"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'VT323', monospace",
      fontSize: 14,
      color: "#ff4040",
      letterSpacing: "1px",
      whiteSpace: "nowrap",
      textShadow: "0 0 8px #ff4040"
    }
  }, label));
}
