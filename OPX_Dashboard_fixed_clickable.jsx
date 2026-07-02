import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Papa from "papaparse";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  bg0: "#0A0D14", bg1: "#0F1322", bg2: "#141829", bg3: "#1A2035",
  glass: "rgba(255,255,255,0.04)", glassBorder: "rgba(255,255,255,0.08)",
  blue: "#3B82F6", blueD: "#1D4ED8", blueL: "#93C5FD",
  purple: "#8B5CF6", purpleL: "#C4B5FD",
  green: "#10B981", greenL: "#6EE7B7",
  red: "#EF4444", redL: "#FCA5A5",
  amber: "#F59E0B", amberL: "#FCD34D",
  cyan: "#06B6D4", cyanL: "#67E8F9",
  pink: "#EC4899",
  text: "#F1F5F9", textSub: "#94A3B8", textMuted: "#64748B",
  border: "rgba(255,255,255,0.06)",
};

// ─── GLOBAL STYLES ─────────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',sans-serif;background:${T.bg0};color:${T.text};min-height:100vh;overflow-x:hidden}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
    .mono{font-family:'JetBrains Mono',monospace}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    @keyframes countUp{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}
    .fade-in{animation:fadeIn 0.4s ease forwards}
    .pulse{animation:pulse 2s infinite}
    .spin{animation:spin 1s linear infinite}
    .count-up{animation:countUp 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards}
    .card{
      background:${T.glass};
      border:1px solid ${T.glassBorder};
      border-radius:16px;
      backdrop-filter:blur(12px);
      transition:all 0.2s ease;
    }
    .card:hover{border-color:rgba(255,255,255,0.14);transform:translateY(-1px)}
    .btn{
      padding:8px 18px;border-radius:10px;border:none;cursor:pointer;
      font-family:'Inter',sans-serif;font-size:13px;font-weight:500;
      transition:all 0.2s ease;display:inline-flex;align-items:center;gap:6px;
    }
    .btn-primary{background:linear-gradient(135deg,${T.blue},${T.purple});color:white}
    .btn-primary:hover{opacity:0.9;transform:translateY(-1px)}
    .btn-ghost{background:${T.glass};border:1px solid ${T.glassBorder};color:${T.textSub}}
    .btn-ghost:hover{background:rgba(255,255,255,0.08);color:${T.text}}
    .badge{
      display:inline-flex;align-items:center;gap:4px;
      padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;
    }
    .badge-red{background:rgba(239,68,68,0.15);color:${T.redL};border:1px solid rgba(239,68,68,0.2)}
    .badge-amber{background:rgba(245,158,11,0.15);color:${T.amberL};border:1px solid rgba(245,158,11,0.2)}
    .badge-green{background:rgba(16,185,129,0.15);color:${T.greenL};border:1px solid rgba(16,185,129,0.2)}
    .badge-blue{background:rgba(59,130,246,0.15);color:${T.blueL};border:1px solid rgba(59,130,246,0.2)}
    .badge-purple{background:rgba(139,92,246,0.15);color:${T.purpleL};border:1px solid rgba(139,92,246,0.2)}
    .table-wrap{overflow-x:auto;border-radius:12px;border:1px solid ${T.border}}
    table{width:100%;border-collapse:collapse;font-size:13px}
    thead th{
      padding:10px 14px;text-align:left;font-size:11px;font-weight:600;
      color:${T.textMuted};text-transform:uppercase;letter-spacing:0.06em;
      background:rgba(255,255,255,0.03);border-bottom:1px solid ${T.border};
      white-space:nowrap;
    }
    tbody tr{border-bottom:1px solid ${T.border};transition:background 0.15s}
    tbody tr:hover{background:rgba(255,255,255,0.03)}
    tbody td{padding:10px 14px;color:${T.textSub};vertical-align:middle}
    tbody td:first-child{color:${T.text};font-weight:500}
    .input{
      background:rgba(255,255,255,0.05);border:1px solid ${T.glassBorder};
      border-radius:10px;padding:8px 14px;color:${T.text};font-size:13px;
      font-family:'Inter',sans-serif;outline:none;transition:border-color 0.2s;width:100%;
    }
    .input:focus{border-color:${T.blue}}
    .nav-item{
      display:flex;align-items:center;gap:10px;padding:9px 14px;border-radius:10px;
      cursor:pointer;font-size:13px;font-weight:500;color:${T.textSub};
      transition:all 0.15s;white-space:nowrap;
    }
    .nav-item:hover{background:rgba(255,255,255,0.05);color:${T.text}}
    .nav-item.active{background:linear-gradient(135deg,rgba(59,130,246,0.2),rgba(139,92,246,0.2));color:${T.text};border:1px solid rgba(59,130,246,0.2)}
    .nav-section{font-size:10px;font-weight:700;color:${T.textMuted};text-transform:uppercase;letter-spacing:0.1em;padding:14px 14px 6px}
    .kpi-card{
      background:${T.glass};border:1px solid ${T.glassBorder};border-radius:16px;
      padding:18px 20px;transition:all 0.2s;cursor:default;position:relative;overflow:hidden;
    }
    .kpi-card::before{
      content:'';position:absolute;top:0;left:0;right:0;height:2px;
      background:var(--accent);opacity:0.6;
    }
    .alert-item{
      display:flex;align-items:flex-start;gap:12px;padding:14px 16px;
      border-radius:12px;border:1px solid var(--alert-border);
      background:var(--alert-bg);margin-bottom:8px;cursor:pointer;transition:all 0.2s;
    }
    .alert-item:hover{transform:translateX(3px);border-color:var(--alert-hover)}
    .progress-bar{height:4px;border-radius:2px;background:rgba(255,255,255,0.08);overflow:hidden;margin-top:8px}
    .progress-fill{height:100%;border-radius:2px;transition:width 0.8s ease;background:var(--fill)}
    .skeleton{
      background:linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 75%);
      background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px;
    }
    .tag{padding:2px 8px;border-radius:6px;font-size:10px;font-weight:600;background:rgba(255,255,255,0.06);color:${T.textSub}}
  `}</style>
);

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ n, s = 16, c }) => {
  const icons = {
    dashboard: "M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z",
    tickets: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    agents: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm8 0a4 4 0 100-8 4 4 0 000 8",
    alert: "M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
    check: "M20 6L9 17l-5-5",
    close: "M18 6L6 18M6 6l12 12",
    upload: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
    clock: "M12 2a10 10 0 100 20A10 10 0 0012 2zm0 5v5l4 2",
    trend: "M22 12h-4l-3 9L9 3l-3 9H2",
    robot: "M12 2a2 2 0 012 2v1a7 7 0 010 14v1a2 2 0 01-4 0v-1a7 7 0 010-14V4a2 2 0 012-2zM9 10h.01M15 10h.01M9 14s1 1 3 1 3-1 3-1",
    sla: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    reopen: "M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15",
    duplicate: "M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2M15 2H9a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1V3a1 1 0 00-1-1z",
    settings: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
    fire: "M12 2c0 0-8 6-8 12a8 8 0 0016 0c0-6-8-12-8-12zm0 0c0 0 4 4 4 8a4 4 0 01-8 0c0-4 4-8 4-8z",
    refund: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    customer: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8",
    order: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0",
    report: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
    download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
    ai: "M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18",
    ops: "M12 20V10M18 20V4M6 20v-4",
    search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0",
    filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
    eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
    chevron: "M9 18l6-6-6-6",
    info: "M12 2a10 10 0 100 20A10 10 0 0012 2zm0 9v5m0-9h.01",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    timeline: "M12 2v20M2 12h20",
    warn: "M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
  };
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c || "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={icons[n] || icons.dashboard} />
    </svg>
  );
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = {
  num: n => n == null ? "—" : Number(n).toLocaleString(),
  pct: (n, d = 1) => n == null ? "—" : `${Number(n).toFixed(d)}%`,
  hrs: n => n == null ? "—" : n < 1 ? `${Math.round(n * 60)}m` : `${n.toFixed(1)}h`,
  date: s => s ? new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—",
  ago: s => {
    if (!s) return "—";
    const d = (new Date() - new Date(s)) / 86400000;
    if (d < 1) return "Today";
    if (d < 2) return "Yesterday";
    return `${Math.round(d)}d ago`;
  },
};

const daysBetween = (a, b) => {
  if (!a || !b) return null;
  const diff = (new Date(b) - new Date(a)) / 86400000;
  return isNaN(diff) ? null : Math.abs(diff);
};

const STATUS_COLORS = {
  CLOSED: T.green, RESOLVED: T.blue, OPEN: T.amber,
  PENDING: T.purple, "RE-OPENED": T.red, NEW: T.cyan,
  ACR: T.orange, ASR: T.pink, BOT: T.textSub,
};

const safeFileName = name => String(name || "export").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "export";

const normalizeExportRow = row => {
  if (!row || typeof row !== "object") return { value: row };
  const out = {};
  Object.entries(row).forEach(([key, value]) => {
    if (key.startsWith("_") && !["_status", "_daysSinceCreated", "_daysSinceResolved", "_resolutionHrs", "_frtHrs"].includes(key)) return;
    if (value instanceof Date) out[key] = value.toISOString();
    else if (value == null) out[key] = "";
    else if (typeof value !== "object") out[key] = value;
  });
  if (row._violation) {
    out.violationExpected = row._violation.expected || "";
    out.violationReason = row._violation.reason || "";
    out.violationDays = row._violation.days || "";
    out.violationPriority = row._violation.priority || "";
  }
  return out;
};

const downloadCsv = (rows, name) => {
  const data = Array.isArray(rows) ? rows : [];
  const csv = Papa.unparse(data.map(normalizeExportRow));
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = safeFileName(name) + ".csv";
  link.click();
  URL.revokeObjectURL(link.href);
};

const ExportButton = ({ rows, name, label = "Export" }) => (
  <button className="btn btn-ghost" onClick={e => { e.stopPropagation(); downloadCsv(rows, name); }} disabled={!rows?.length} title={"Download " + (name || "export") + " CSV"}>
    <Icon n="download" s={14} /> {label}
  </button>
);

// ─── DATA ENGINE ──────────────────────────────────────────────────────────────
function processData(rawData, rules) {
  const df = rawData.filter(r => r.ticketId);
  const now = new Date();

  // Parse dates
  df.forEach(r => {
    r._created = r.createdAtDate ? new Date(r.createdAtDate) : null;
    r._resolved = r.resolvedAtDate ? new Date(r.resolvedAtDate) : null;
    r._closed = r.closedAtDate ? new Date(r.closedAtDate) : null;
    r._reopened = r["Reopened Date"] ? new Date(r["Reopened Date"]) : null;
    r._lastResp = (r.lastResponseAtDate || r["Last Response Date"]) ? new Date(r.lastResponseAtDate || r["Last Response Date"]) : null;
    r._firstAssigned = r["First Assignment Date"] ? new Date(r["First Assignment Date"]) : null;
    r._frtDate = r["Agents' First Response Date"] ? new Date(r["Agents' First Response Date"]) : null;
    r._daysSinceCreated = r._created ? daysBetween(r._created, now) : null;
    r._daysSinceResolved = r._resolved ? daysBetween(r._resolved, now) : null;
    r._resolutionHrs = (r._created && r._resolved) ? (r._resolved - r._created) / 3600000 : null;
    r._frtStart = r._firstAssigned || r._created;
    r._frtHrs = (r._frtStart && r._frtDate) ? (r._frtDate - r._frtStart) / 3600000 : null;
    r._status = (r.ticketStatus || "").toUpperCase().trim();
  });

  // Auto closure violations
  const acrViolations = df.filter(r => {
    if (r._status === "CLOSED") return false;
    const days = r._daysSinceResolved || r._daysSinceCreated;
    const acrDays = r._lastResp ? (now - r._lastResp) / 86400000 : null;
    if (r._status === "ACR") return acrDays != null && acrDays > rules.acrAutoClose;
    if (!days) return false;
    if (r._status === "RESOLVED" && days > rules.resolvedAutoClose) return true;
    if (r._status === "PENDING" && days > rules.pendingCustomerInactivity) return true;
    if (r._status === "OPEN" && days > rules.openAgentInactivity) return true;
    if (r._status === "NEW" && days > rules.newTicketSLA) return true;
    if (r._status === "ASR" && days > rules.asrAutoClose) return true;
    return false;
  }).map(r => {
    let expected = "CLOSED", reason = "", days = 0;
    if (r._status === "RESOLVED") { reason = `Resolved ${r._daysSinceResolved?.toFixed(1)}d ago — should auto-close after ${rules.resolvedAutoClose}d`; days = r._daysSinceResolved; }
    else if (r._status === "PENDING") { reason = `Pending ${r._daysSinceCreated?.toFixed(1)}d — no customer reply`; days = r._daysSinceCreated; expected = "CLOSED (Customer Inactive)"; }
    else if (r._status === "OPEN") { reason = `Open ${r._daysSinceCreated?.toFixed(1)}d — no agent action`; days = r._daysSinceCreated; expected = "ESCALATED"; }
    else if (r._status === "ACR") { days = r._lastResp ? (now - r._lastResp) / 86400000 : 0; reason = `ACR last response ${days?.toFixed(1)}d ago - should auto-close after ${rules.acrAutoClose}d`; }
    else if (r._status === "ASR") { reason = `ASR for ${r._daysSinceCreated?.toFixed(1)}d — should auto-close`; days = r._daysSinceCreated; }
    else if (r._status === "NEW") { reason = `NEW for ${r._daysSinceCreated?.toFixed(1)}d — no assignment`; days = r._daysSinceCreated; }
    const priority = days > 10 ? "CRITICAL" : days > 5 ? "HIGH" : "MEDIUM";
    return { ...r, _violation: { expected, reason, days: days?.toFixed(1), priority } };
  });

  // Re-opened analytics
  const reopened = df.filter(r => r._reopened || r._status === "RE-OPENED");
  const reopenedWithin24h = reopened.filter(r => {
    if (!r._resolved || !r._reopened) return false;
    return daysBetween(r._resolved, r._reopened) <= 1;
  });
  const reopenedWithin7d = reopened.filter(r => {
    if (!r._resolved || !r._reopened) return false;
    return daysBetween(r._resolved, r._reopened) <= 7;
  });

  // Duplicates (same customerId + same order)
  const orderGroups = {};
  const customerGroups = {};
  df.forEach(r => {
    if (r.OrderID && r.OrderID !== "-") {
      if (!orderGroups[r.OrderID]) orderGroups[r.OrderID] = [];
      orderGroups[r.OrderID].push(r);
    }
    if (r.customerId) {
      if (!customerGroups[r.customerId]) customerGroups[r.customerId] = [];
      customerGroups[r.customerId].push(r);
    }
  });
  const duplicateOrders = Object.entries(orderGroups)
    .filter(([, v]) => v.length > 1 && v.some(t => !["CLOSED","RESOLVED"].includes(t._status)))
    .map(([orderId, tickets]) => ({ orderId, count: tickets.length, tickets }));

  // Status breakdown
  const statusCounts = {};
  df.forEach(r => { statusCounts[r._status] = (statusCounts[r._status] || 0) + 1; });

  // Agent performance
  const agentMap = {};
  df.forEach(r => {
    if (!r._firstAssigned) return;
    const ag = r.firstRespondingAgent || r.assignedAgent;
    if (!ag || ag === "-") return;
    if (!agentMap[ag]) agentMap[ag] = { name: ag.split("@")[0], tickets: [], resolved: 0, reopened: 0 };
    agentMap[ag].tickets.push(r);
    if (r._status === "RESOLVED" || r._status === "CLOSED") agentMap[ag].resolved++;
    if (r._reopened) agentMap[ag].reopened++;
  });
  const agents = Object.values(agentMap).map(a => ({
    ...a,
    total: a.tickets.length,
    resRate: a.tickets.length ? (a.resolved / a.tickets.length * 100) : 0,
    avgResHrs: a.tickets.filter(t => t._resolutionHrs).reduce((s, t) => s + t._resolutionHrs, 0) / (a.tickets.filter(t => t._resolutionHrs).length || 1),
    avgFrtHrs: a.tickets.filter(t => t._frtHrs).reduce((s, t) => s + t._frtHrs, 0) / (a.tickets.filter(t => t._frtHrs).length || 1),
  })).sort((a, b) => b.total - a.total);

  // KPIs
  const total = df.length;
  const closed = statusCounts["CLOSED"] || 0;
  const resolved = statusCounts["RESOLVED"] || 0;
  const open = statusCounts["OPEN"] || 0;
  const pending = statusCounts["PENDING"] || 0;
  const newT = statusCounts["NEW"] || 0;
  const reOpened = reopened.length;
  const acr = statusCounts["ACR"] || 0;
  const asr = statusCounts["ASR"] || 0;

  const resHrs = df.filter(r => r._resolutionHrs > 0 && r._resolutionHrs < 720);
  const avgResHrs = resHrs.length ? resHrs.reduce((s, r) => s + r._resolutionHrs, 0) / resHrs.length : 0;
  const frtTickets = df.filter(r => r._frtHrs > 0 && r._frtHrs < 720);
  const avgFrtHrs = frtTickets.length ? frtTickets.reduce((s, r) => s + r._frtHrs, 0) / frtTickets.length : 0;

  // Category & channel
  const categories = {};
  const channels = {};
  const subCats = {};
  const brands = {};
  df.forEach(r => {
    const cat = r["Ticket Category"] || "-";
    categories[cat] = (categories[cat] || 0) + 1;
    const ch = r.channel || "-";
    channels[ch] = (channels[ch] || 0) + 1;
    const sub = r["Ticket Category_Ticket Sub-Category"] || "-";
    if (sub !== "-") subCats[sub] = (subCats[sub] || 0) + 1;
    const br = r["Brand Name"] || "-";
    if (br !== "-") brands[br] = (brands[br] || 0) + 1;
  });

  // KPI drill-down datasets
  const pendingTickets = df.filter(r => r._status === "PENDING");
  const acrTickets = df.filter(r => r._status === "ACR");
  const asrTickets = df.filter(r => r._status === "ASR");
  const open7Days = df.filter(r => !["CLOSED","RESOLVED"].includes(r._status) && r._daysSinceCreated >= 7);
  const autoClosed = df.filter(r => r._status === "CLOSED" && r._closed);
  const autoCloseDue = acrViolations.filter(r => r._status === "ACR");
  const closedTickets = df.filter(r => r._status === "CLOSED");
  const resolvedTickets = df.filter(r => r._status === "RESOLVED");
  const openTickets = df.filter(r => r._status === "OPEN");
  const resolutionRateTickets = df.filter(r => ["CLOSED","RESOLVED"].includes(r._status));
  const duplicateTickets = duplicateOrders.flatMap(o => o.tickets);

  // SLA at risk (open/pending > 3 days)
  const slaRisk = df.filter(r => !["CLOSED","RESOLVED"].includes(r._status) && r._daysSinceCreated > 3);

  // Status mismatch — resolved but resolve date > X days ago and still not closed
  const statusMismatch = df.filter(r =>
    r._status === "RESOLVED" && r._daysSinceResolved > rules.resolvedAutoClose
  );

  return {
    df, total, closed, resolved, open, pending, newT, reOpened, acr, asr,
    pendingTickets, acrTickets, asrTickets, open7Days, autoClosed, autoCloseDue,
    closedTickets, resolvedTickets, openTickets, resolutionRateTickets, duplicateTickets,
    statusCounts, acrViolations, reopened, reopenedWithin24h, reopenedWithin7d,
    duplicateOrders, agents, avgResHrs, avgFrtHrs, resHrs, frtTickets,
    categories, channels, subCats, brands, slaRisk, statusMismatch,
    resolutionRate: total ? ((closed + resolved) / total * 100) : 0,
    agentMap, orderGroups, customerGroups,
  };
}

// ─── MINI BAR ─────────────────────────────────────────────────────────────────
const MiniBar = ({ data, colorFn }) => {
  const max = Math.max(...data.map(d => d.v));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 120, fontSize: 11, color: T.textSub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.k}</div>
          <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${(d.v / max) * 100}%`, height: "100%", borderRadius: 3, background: colorFn ? colorFn(i) : T.blue, transition: "width 0.8s ease" }} />
          </div>
          <div style={{ width: 40, fontSize: 11, color: T.text, textAlign: "right" }}>{fmt.num(d.v)}</div>
        </div>
      ))}
    </div>
  );
};

// ─── KPI CARD ─────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, accent, icon, badge, onClick, onDoubleClick, exportRows }) => (
  <div role={onClick || onDoubleClick ? "button" : undefined} tabIndex={onClick || onDoubleClick ? 0 : undefined} className="kpi-card fade-in" style={{ "--accent": accent || T.blue, cursor: (onClick || onDoubleClick) ? "pointer" : "default", textAlign: "left", width: "100%", color: "inherit", font: "inherit" }} onClick={onClick} onDoubleClick={onDoubleClick} onKeyDown={e => { if ((e.key === "Enter" || e.key === " ") && onClick) onClick(e); }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {exportRows && <ExportButton rows={exportRows} name={label} label="CSV" />}
        {icon && <div style={{ color: accent || T.blue, opacity: 0.7 }}><Icon n={icon} s={16} /></div>}
      </div>
    </div>
    <div className="count-up" style={{ fontSize: 28, fontWeight: 700, color: T.text, lineHeight: 1, marginBottom: 6 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: T.textSub }}>{sub}</div>}
    {badge && <span className={`badge badge-${badge.type}`} style={{ marginTop: 8 }}>{badge.label}</span>}
  </div>
);

const KpiDrilldown = ({ title, tickets, onClose }) => {
  const [selected, setSelected] = useState(null);
  const rows = tickets || [];

  return (
    <div className="card fade-in" style={{ padding: 20, marginBottom: 20, borderColor: "rgba(59,130,246,0.3)" }}>
      <SectionHeader title={title} sub={`${fmt.num(rows.length)} matching tickets`} action={<div style={{ display: "flex", gap: 8 }}><ExportButton rows={rows} name={title} /><button className="btn btn-ghost" onClick={onClose}><Icon n="close" s={14} /> Close</button></div>} />

      {selected && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8, padding: 12, marginBottom: 12, background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
          {[
            ["Ticket ID", selected.ticketId], ["Order ID", selected.OrderID], ["Customer", selected.customerName],
            ["Company", selected["Brand Name"] || selected.companyName], ["Current Status", selected._status],
            ["Assigned Agent", selected.assignedAgent], ["First Assignment", fmt.date(selected["First Assignment Date"])],
            ["Last Response", fmt.date(selected.lastResponseAtDate || selected["Last Response Date"])],
            ["Created", fmt.date(selected.createdAtDate)], ["Resolved", fmt.date(selected.resolvedAtDate)],
            ["Closed", fmt.date(selected.closedAtDate)], ["Reopened", fmt.date(selected["Reopened Date"])]
          ].map(([l, v]) => (
            <div key={l} style={{ fontSize: 11 }}>
              <span style={{ color: T.textMuted }}>{l}: </span>
              <span style={{ color: T.text }}>{v || "-"}</span>
            </div>
          ))}
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead><tr>
            {["Ticket ID","Order ID","Customer","Company","Current Status","Assigned Agent","Created","First Assignment","Last Response","Reopened"].map(h => <th key={h}>{h}</th>)}
          </tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ cursor: "pointer" }} onClick={() => setSelected(r)}>
                <td><span className="mono" style={{ color: T.blue }}>#{r.ticketId}</span></td>
                <td><span className="mono" style={{ fontSize: 11 }}>{r.OrderID && r.OrderID !== "-" ? r.OrderID : "-"}</span></td>
                <td>{r.customerName || "-"}</td>
                <td>{r["Brand Name"] || r.companyName || "-"}</td>
                <td><span className="badge" style={{ background: `${STATUS_COLORS[r._status] || T.textMuted}22`, color: STATUS_COLORS[r._status] || T.textMuted, border: `1px solid ${STATUS_COLORS[r._status] || T.textMuted}44` }}>{r._status}</span></td>
                <td style={{ fontSize: 11 }}>{r.assignedAgent ? r.assignedAgent.split("@")[0] : "-"}</td>
                <td style={{ fontSize: 11 }}>{fmt.date(r.createdAtDate)}</td>
                <td style={{ fontSize: 11 }}>{fmt.date(r["First Assignment Date"])}</td>
                <td style={{ fontSize: 11 }}>{fmt.date(r.lastResponseAtDate || r["Last Response Date"])}</td>
                <td style={{ fontSize: 11 }}>{fmt.date(r["Reopened Date"])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
const SectionHeader = ({ title, sub, action }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{sub}</div>}
    </div>
    {action}
  </div>
);

// ─── UPLOAD SCREEN ────────────────────────────────────────────────────────────
const UploadScreen = ({ onData }) => {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const parseFile = file => {
    setLoading(true); setError("");
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: res => { setLoading(false); if (res.data.length) onData(res.data); else setError("No data found in file."); },
      error: e => { setLoading(false); setError(e.message); },
    });
  };

  const onDrop = e => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) parseFile(f);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, background: `radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.08) 0%, transparent 60%), ${T.bg0}` }}>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.2em", color: T.blue, textTransform: "uppercase", marginBottom: 8 }}>WOW CS</div>
        <div style={{ fontSize: 40, fontWeight: 800, background: `linear-gradient(135deg, ${T.text}, ${T.blueL})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8 }}>OPX Intelligence</div>
        <div style={{ fontSize: 15, color: T.textSub }}>Operations Control Tower · Upload your daily ticket dump to begin</div>
      </div>

      <div
        className="card"
        onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        style={{ width: "100%", maxWidth: 520, padding: 48, textAlign: "center", border: `2px dashed ${dragging ? T.blue : T.glassBorder}`, transition: "all 0.2s", cursor: "pointer", background: dragging ? "rgba(59,130,246,0.06)" : T.glass }}
        onClick={() => fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: "none" }} onChange={e => e.target.files[0] && parseFile(e.target.files[0])} />
        {loading
          ? <><div className="spin" style={{ width: 40, height: 40, border: `3px solid ${T.glassBorder}`, borderTopColor: T.blue, borderRadius: "50%", margin: "0 auto 16px" }} /><div style={{ color: T.textSub }}>Parsing data...</div></>
          : <><div style={{ color: T.blue, marginBottom: 16 }}><Icon n="upload" s={40} /></div>
            <div style={{ fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 6 }}>Drop your CSV file here</div>
            <div style={{ fontSize: 13, color: T.textMuted }}>or click to browse · CSV format</div></>
        }
      </div>
      {error && <div style={{ marginTop: 16, color: T.red, fontSize: 13 }}>{error}</div>}

      <div style={{ display: "flex", gap: 24, marginTop: 40, color: T.textMuted, fontSize: 12 }}>
        {["Auto-detects column schema", "Rule-based violation engine", "AI-powered insights"].map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Icon n="check" s={12} c={T.green} /> {f}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── ACTION CENTER ────────────────────────────────────────────────────────────
const ActionCenter = ({ stats, onTicketClick }) => {
  const alerts = [
    { type: "critical", icon: "🔥", label: "Auto Closure Failures", count: stats.acrViolations.length, desc: `${stats.acrViolations.length} tickets stuck — should have been auto-closed`, items: stats.acrViolations },
    { type: "high", icon: "⏱️", label: "SLA At Risk", count: stats.slaRisk.length, desc: `${stats.slaRisk.length} tickets pending > 3 days without resolution`, items: stats.slaRisk },
    { type: "high", icon: "🔄", label: "Reopened Tickets", count: stats.reopened.length, desc: `${stats.reopened.length} reopens · ${stats.reopenedWithin24h.length} within 24h of closing`, items: stats.reopened },
    { type: "medium", icon: "⚠️", label: "Status Mismatch", count: stats.statusMismatch.length, desc: `${stats.statusMismatch.length} tickets show Resolved but should have auto-closed`, items: stats.statusMismatch },
    { type: "medium", icon: "📋", label: "Duplicate Orders", count: stats.duplicateOrders.length, desc: `${stats.duplicateOrders.length} orders with multiple open tickets`, items: stats.duplicateTickets },
  ];

  const colorMap = { critical: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", hover: "rgba(239,68,68,0.35)", dot: T.red }, high: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", hover: "rgba(245,158,11,0.35)", dot: T.amber }, medium: { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)", hover: "rgba(59,130,246,0.35)", dot: T.blue } };

  return (
    <div className="fade-in">
      <SectionHeader title="Action Center" sub="What to do today — prioritised by severity" action={<ExportButton rows={[...stats.acrViolations, ...stats.slaRisk, ...stats.statusMismatch]} name="flagged-action-center-tickets" />} />
      <div style={{ display: "grid", gap: 8 }}>
        {alerts.map((a, i) => {
          const cm = colorMap[a.type];
          return (
            <div key={i} className="alert-item" style={{ "--alert-bg": cm.bg, "--alert-border": cm.border, "--alert-hover": cm.hover }} onClick={() => a.items?.[0] && onTicketClick && onTicketClick(a.items[0])}>
              <div style={{ fontSize: 22, lineHeight: 1, paddingTop: 2 }}>{a.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{a.label}</span>
                  <span className={`badge badge-${a.type === "critical" ? "red" : a.type === "high" ? "amber" : "blue"}`}>{fmt.num(a.count)}</span>
                </div>
                <div style={{ fontSize: 12, color: T.textSub }}>{a.desc}</div>
              </div>
              <div style={{ color: T.textMuted }}><Icon n="chevron" s={16} /></div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 24 }}>
        <SectionHeader title="Top Violations (Auto-Closure Audit)" sub="Tickets that should have been auto-closed" action={<ExportButton rows={stats.acrViolations} name="auto-closure-violations" />} />
        {stats.acrViolations.length === 0
          ? <div style={{ padding: "32px 0", textAlign: "center", color: T.textMuted }}>✅ No auto-closure violations found</div>
          : <div className="table-wrap">
            <table>
              <thead><tr>
                {["Ticket ID","Status","Expected","Days Overdue","Reason","Priority"].map(h => <th key={h}>{h}</th>)}
              </tr></thead>
              <tbody>
                {stats.acrViolations.slice(0, 50).map((r, i) => (
                  <tr key={i} style={{ cursor: "pointer" }} onClick={() => onTicketClick && onTicketClick(r)}>
                    <td><span className="mono" style={{ color: T.blue }}>#{r.ticketId}</span></td>
                    <td><span className="badge" style={{ background: `${STATUS_COLORS[r._status] || T.textMuted}22`, color: STATUS_COLORS[r._status] || T.textMuted, border: `1px solid ${STATUS_COLORS[r._status] || T.textMuted}44` }}>{r._status}</span></td>
                    <td style={{ color: T.amber }}>{r._violation.expected}</td>
                    <td style={{ color: r._violation.days > 10 ? T.red : T.amber }}>{r._violation.days}d</td>
                    <td style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r._violation.reason}</td>
                    <td><span className={`badge badge-${r._violation.priority === "CRITICAL" ? "red" : r._violation.priority === "HIGH" ? "amber" : "blue"}`}>{r._violation.priority}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  );
};

// ─── DASHBOARD HOME ───────────────────────────────────────────────────────────
const DashboardHome = ({ stats, onNav }) => {
  const [drilldown, setDrilldown] = useState(null);
  const openDrilldown = (title, tickets) => setDrilldown({ title, tickets });

  const kpis = [
    { label: "Total Tickets", value: fmt.num(stats.total), sub: "All statuses", accent: T.blue, icon: "tickets", onClick: () => openDrilldown("Total Tickets", stats.df), exportRows: stats.df },
    { label: "Closed", value: fmt.num(stats.closed), sub: `${fmt.pct(stats.closed / stats.total * 100)} of total`, accent: T.green, icon: "check", onClick: () => openDrilldown("Closed Tickets", stats.closedTickets), exportRows: stats.closedTickets },
    { label: "Resolved", value: fmt.num(stats.resolved), sub: "Awaiting auto-close", accent: T.cyan, icon: "star", onClick: () => openDrilldown("Resolved Tickets", stats.resolvedTickets), exportRows: stats.resolvedTickets },
    { label: "Open", value: fmt.num(stats.open), sub: "Needs agent action", accent: T.amber, icon: "clock", onClick: () => openDrilldown("Open Tickets", stats.openTickets), exportRows: stats.openTickets },
    { label: "Pending Tickets", value: fmt.num(stats.pending), sub: "Waiting on customer", accent: T.purple, icon: "customer", onClick: () => openDrilldown("Pending Tickets", stats.pendingTickets), exportRows: stats.pendingTickets },
    { label: "Reopened Tickets", value: fmt.num(stats.reOpened), sub: `${fmt.pct(stats.reopenedWithin24h.length / (stats.reOpened || 1) * 100)} within 24h`, accent: T.red, icon: "reopen", badge: stats.reOpened > 10 ? { type: "red", label: "Needs attention" } : null, onClick: () => openDrilldown("Reopened Tickets", stats.reopened), exportRows: stats.reopened },
    { label: "ACR Tickets", value: fmt.num(stats.acr), sub: "Awaiting auto-close", accent: T.red, icon: "alert", onClick: () => openDrilldown("ACR Tickets", stats.acrTickets), exportRows: stats.acrTickets },
    { label: "ASR Tickets", value: fmt.num(stats.asr), sub: "Awaiting auto-close", accent: T.pink, icon: "alert", onClick: () => openDrilldown("ASR Tickets", stats.asrTickets), exportRows: stats.asrTickets },
    { label: "Open for 7+ Days", value: fmt.num(stats.open7Days.length), sub: "Open age threshold", accent: T.amber, icon: "clock", onClick: () => openDrilldown("Open for 7+ Days", stats.open7Days), exportRows: stats.open7Days },
    { label: "Auto-Close Errors", value: fmt.num(stats.acrViolations.length), sub: "Should have been closed", accent: T.red, icon: "alert", onClick: () => openDrilldown("Should Auto Close", stats.acrViolations), onDoubleClick: () => onNav("action"), exportRows: stats.acrViolations },
    { label: "Auto Close Due", value: fmt.num(stats.autoCloseDue.length), sub: "ACR past 48h", accent: T.red, icon: "alert", onClick: () => openDrilldown("Auto Close Due", stats.autoCloseDue), exportRows: stats.autoCloseDue },
    { label: "Auto Closed", value: fmt.num(stats.autoClosed.length), sub: "Closed with date", accent: T.green, icon: "check", onClick: () => openDrilldown("Auto Closed", stats.autoClosed), exportRows: stats.autoClosed },
    { label: "SLA At Risk", value: fmt.num(stats.slaRisk.length), sub: "Pending > 3 days", accent: T.amber, icon: "warn", onClick: () => openDrilldown("SLA At Risk", stats.slaRisk), exportRows: stats.slaRisk },
    { label: "Resolution Rate", value: fmt.pct(stats.resolutionRate), sub: "Closed + Resolved", accent: T.green, icon: "trend", onClick: () => openDrilldown("Closed + Resolved Tickets", stats.resolutionRateTickets), exportRows: stats.resolutionRateTickets },
    { label: "Avg Resolution", value: fmt.hrs(stats.avgResHrs), sub: "From created to resolved", accent: T.cyan, icon: "clock", onClick: () => openDrilldown("Tickets Used for Avg Resolution", stats.resHrs), exportRows: stats.resHrs },
    { label: "Avg First Response", value: fmt.hrs(stats.avgFrtHrs), sub: "From first assignment to first agent reply", accent: T.blue, icon: "agents", onClick: () => openDrilldown("Tickets Used for Avg First Response", stats.frtTickets), exportRows: stats.frtTickets },
    { label: "Duplicate Orders", value: fmt.num(stats.duplicateOrders.length), sub: "Multiple tickets per order", accent: T.pink, icon: "duplicate", onClick: () => openDrilldown("Duplicate Order Tickets", stats.duplicateTickets), exportRows: stats.duplicateTickets },
  ];

  const topSubcats = Object.entries(stats.subCats).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => ({ k, v }));
  const topBrands = Object.entries(stats.brands).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => ({ k, v }));
  const channelData = Object.entries(stats.channels).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ k, v }));
  const statusData = Object.entries(stats.statusCounts).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ k, v }));

  const ACCENT_PALETTE = [T.blue, T.purple, T.green, T.cyan, T.amber, T.red, T.pink, T.blueL];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 4 }}>Operations Dashboard</div>
        <div style={{ fontSize: 13, color: T.textMuted }}>Real-time analysis from uploaded dump · {fmt.num(stats.total)} tickets loaded</div>
      </div>

      {stats.acrViolations.length > 0 && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => onNav("action")}>
          <span style={{ fontSize: 18 }}>🔥</span>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 600, color: T.red }}>Critical: </span>
            <span style={{ color: T.textSub, fontSize: 13 }}>{stats.acrViolations.length} auto-closure failures detected · {stats.statusMismatch.length} status mismatches · {stats.slaRisk.length} SLA risks</span>
          </div>
          <span style={{ color: T.red, fontSize: 12, fontWeight: 600 }}>VIEW ACTION CENTER →</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 28 }}>
        {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
      </div>

      {drilldown && <KpiDrilldown title={drilldown.title} tickets={drilldown.tickets} onClose={() => setDrilldown(null)} />}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <SectionHeader title="Top Issues" sub="By ticket count" action={<ExportButton rows={topSubcats} name="top-issues" />} />
          <MiniBar data={topSubcats} colorFn={i => ACCENT_PALETTE[i % ACCENT_PALETTE.length]} />
        </div>
        <div className="card" style={{ padding: 20 }}>
          <SectionHeader title="Status Breakdown" sub="Current distribution" action={<ExportButton rows={statusData} name="status-breakdown" />} />
          <MiniBar data={statusData} colorFn={i => STATUS_COLORS[statusData[i]?.k] || T.textSub} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <SectionHeader title="Channel Distribution" sub="By volume" action={<ExportButton rows={channelData} name="channel-distribution" />} />
          <MiniBar data={channelData} colorFn={i => [T.green, T.blue, T.pink, T.amber][i] || T.textSub} />
        </div>
        <div className="card" style={{ padding: 20 }}>
          <SectionHeader title="Top Brands" sub="By ticket count" action={<ExportButton rows={topBrands} name="top-brands" />} />
          <MiniBar data={topBrands} colorFn={i => ACCENT_PALETTE[i % ACCENT_PALETTE.length]} />
        </div>
      </div>
    </div>
  );
};

// ─── TICKETS VIEW ─────────────────────────────────────────────────────────────
const TicketsView = ({ stats }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    return stats.df.filter(r => {
      const matchStatus = statusFilter === "ALL" || r._status === statusFilter;
      const matchSearch = !search || String(r.ticketId).includes(search) || (r.customerName || "").toLowerCase().includes(search.toLowerCase()) || (r.OrderID || "").toLowerCase().includes(search.toLowerCase()) || (r.assignedAgent || "").toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    }).slice(0, 200);
  }, [stats.df, search, statusFilter]);

  const statuses = ["ALL", ...Object.keys(stats.statusCounts)];

  return (
    <div className="fade-in">
      <SectionHeader title="All Tickets" sub={`${fmt.num(filtered.length)} of ${fmt.num(stats.total)} shown`} action={<ExportButton rows={filtered} name="filtered-tickets" />} />
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input className="input" placeholder="Search ticket ID, customer, order..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 320 }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {statuses.map(s => (
            <button key={s} className="btn btn-ghost" style={{ fontSize: 11, padding: "5px 12px", background: statusFilter === s ? "rgba(59,130,246,0.15)" : undefined, borderColor: statusFilter === s ? T.blue : undefined, color: statusFilter === s ? T.blueL : undefined }} onClick={() => setStatusFilter(s)}>
              {s} {s !== "ALL" && <span style={{ color: T.textMuted }}>({stats.statusCounts[s] || 0})</span>}
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="card fade-in" style={{ padding: 20, marginBottom: 16, borderColor: "rgba(59,130,246,0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <span className="mono" style={{ color: T.blue, fontSize: 16, fontWeight: 700 }}>#{selected.ticketId}</span>
              <span className="badge" style={{ marginLeft: 10, background: `${STATUS_COLORS[selected._status] || T.textMuted}22`, color: STATUS_COLORS[selected._status] || T.textMuted, border: `1px solid ${STATUS_COLORS[selected._status] || T.textMuted}44` }}>{selected._status}</span>
            </div>
            <button className="btn btn-ghost" onClick={() => setSelected(null)}><Icon n="close" s={14} /> Close</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {[
              ["Customer", selected.customerName], ["Order ID", selected.OrderID], ["Channel", selected.channel],
              ["Category", selected["Ticket Category"]], ["Sub-Category", selected["Ticket Category_Ticket Sub-Category"]],
              ["Assigned To", selected.assignedAgent], ["Created", fmt.date(selected.createdAtDate)],
              ["Resolved", fmt.date(selected.resolvedAtDate)], ["Closed", fmt.date(selected.closedAtDate)],
              ["Reopened", fmt.date(selected["Reopened Date"])], ["Resolution Time", fmt.hrs(selected._resolutionHrs)],
              ["First Response", fmt.hrs(selected._frtHrs)], ["Brand", selected["Brand Name"]], ["Type", selected.ticketType],
            ].map(([label, val]) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 12px" }}>
                <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 13, color: T.text }}>{val || "—"}</div>
              </div>
            ))}
          </div>
          {selected.tags && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 6, fontWeight: 600 }}>TAGS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {selected.tags.split(",").map((t, i) => <span key={i} className="tag">{t.trim()}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead><tr>
            {["ID","Status","Customer","Order","Category","Sub-Category","Agent","Created","Resolution","FRT","Type"].map(h => <th key={h}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i} style={{ cursor: "pointer" }} onClick={() => setSelected(r)}>
                <td><span className="mono" style={{ color: T.blue }}>#{r.ticketId}</span></td>
                <td><span className="badge" style={{ background: `${STATUS_COLORS[r._status] || T.textMuted}22`, color: STATUS_COLORS[r._status] || T.textMuted, border: `1px solid ${STATUS_COLORS[r._status] || T.textMuted}44` }}>{r._status}</span></td>
                <td>{r.customerName || "—"}</td>
                <td><span className="mono" style={{ fontSize: 11 }}>{r.OrderID !== "-" ? r.OrderID : "—"}</span></td>
                <td>{r["Ticket Category"] || "—"}</td>
                <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r["Ticket Category_Ticket Sub-Category"] !== "-" ? r["Ticket Category_Ticket Sub-Category"] : "—"}</td>
                <td style={{ fontSize: 11 }}>{r.assignedAgent ? r.assignedAgent.split("@")[0] : "—"}</td>
                <td style={{ fontSize: 11 }}>{fmt.date(r.createdAtDate)}</td>
                <td style={{ fontSize: 11, color: r._resolutionHrs > 48 ? T.amber : T.textSub }}>{fmt.hrs(r._resolutionHrs)}</td>
                <td style={{ fontSize: 11, color: r._frtHrs > 24 ? T.red : T.textSub }}>{fmt.hrs(r._frtHrs)}</td>
                <td><span className="tag">{r.ticketType}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── AGENTS VIEW ──────────────────────────────────────────────────────────────
const AgentsView = ({ stats }) => (
  <div className="fade-in">
    <SectionHeader title="Agent Performance" sub="Based on assigned / first responding agent" action={<ExportButton rows={stats.agents} name="agent-performance" />} />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14, marginBottom: 20 }}>
      {stats.agents.slice(0, 12).map((a, i) => (
        <div key={i} className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg,${T.blue},${T.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "white", flexShrink: 0 }}>{a.name[0]?.toUpperCase()}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{a.name}</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>{fmt.num(a.total)} tickets</div>
            </div>
          </div>
          {[
            ["Total", fmt.num(a.total), T.blue],
            ["Resolved/Closed", fmt.num(a.resolved), T.green],
            ["Reopened", fmt.num(a.reopened), T.red],
            ["Res Rate", fmt.pct(a.resRate), a.resRate > 80 ? T.green : a.resRate > 60 ? T.amber : T.red],
            ["Avg Res Time", fmt.hrs(a.avgResHrs), T.cyan],
            ["Avg FRT", fmt.hrs(a.avgFrtHrs), T.purple],
          ].map(([l, v, c]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 12, color: T.textMuted }}>{l}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: c }}>{v}</span>
            </div>
          ))}
          <div className="progress-bar" style={{ marginTop: 10 }}>
            <div className="progress-fill" style={{ "--fill": a.resRate > 80 ? T.green : a.resRate > 60 ? T.amber : T.red, width: `${Math.min(a.resRate, 100)}%` }} />
          </div>
          <div style={{ fontSize: 10, color: T.textMuted, marginTop: 4, textAlign: "right" }}>Resolution rate</div>
        </div>
      ))}
    </div>

    <div className="table-wrap">
      <table>
        <thead><tr>
          {["Agent","Total","Resolved","Reopened","Res Rate","Avg Res","Avg FRT","WOW Score"].map(h => <th key={h}>{h}</th>)}
        </tr></thead>
        <tbody>
          {stats.agents.map((a, i) => {
            const wow = Math.min(100, Math.round((a.resRate * 0.5) + ((1 - Math.min(a.reopened / a.total, 0.3) / 0.3) * 30) + (a.avgFrtHrs < 4 ? 20 : a.avgFrtHrs < 12 ? 10 : 0)));
            return (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{a.name}</td>
                <td>{fmt.num(a.total)}</td>
                <td style={{ color: T.green }}>{fmt.num(a.resolved)}</td>
                <td style={{ color: a.reopened > 5 ? T.red : T.textSub }}>{fmt.num(a.reopened)}</td>
                <td><span className={`badge badge-${a.resRate > 80 ? "green" : a.resRate > 60 ? "amber" : "red"}`}>{fmt.pct(a.resRate)}</span></td>
                <td>{fmt.hrs(a.avgResHrs)}</td>
                <td style={{ color: a.avgFrtHrs > 24 ? T.red : T.textSub }}>{fmt.hrs(a.avgFrtHrs)}</td>
                <td><span className={`badge badge-${wow >= 75 ? "green" : wow >= 50 ? "amber" : "red"}`}>{wow}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── REOPEN ANALYTICS ────────────────────────────────────────────────────────
const ReopenAnalytics = ({ stats }) => {
  const total = stats.total;
  const reOpened = stats.reopened;
  const within24h = stats.reopenedWithin24h;
  const within7d = stats.reopenedWithin7d;

  // Same customer reopened
  const custReopen = {};
  reOpened.forEach(r => { const c = r.customerId; if (c) custReopen[c] = (custReopen[c] || 0) + 1; });
  const multiCustReopen = Object.entries(custReopen).filter(([, v]) => v > 1).length;

  const orderReopen = {};
  reOpened.forEach(r => { const o = r.OrderID; if (o && o !== "-") orderReopen[o] = (orderReopen[o] || 0) + 1; });
  const multiOrderReopen = Object.entries(orderReopen).filter(([, v]) => v > 1).length;

  const agentReopen = {};
  reOpened.forEach(r => { const a = r.assignedAgent; if (a && a !== "-") agentReopen[a] = (agentReopen[a] || 0) + 1; });
  const topAgentReopens = Object.entries(agentReopen).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="fade-in">
      <SectionHeader title="Reopen Analytics" sub="Tracking resolution quality and customer escalations" action={<ExportButton rows={reOpened} name="reopen-analytics" />} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Reopened", value: fmt.num(reOpened.length), accent: T.red, exportRows: reOpened },
          { label: "Reopen Rate", value: fmt.pct(reOpened.length / total * 100), accent: T.red, exportRows: reOpened },
          { label: "Within 24h", value: fmt.num(within24h.length), accent: T.amber, exportRows: within24h },
          { label: "Within 7 Days", value: fmt.num(within7d.length), accent: T.amber, exportRows: within7d },
          { label: "Same Customer", value: fmt.num(multiCustReopen), accent: T.purple, exportRows: reOpened.filter(r => r.customerId && custReopen[r.customerId] > 1) },
          { label: "Same Order", value: fmt.num(multiOrderReopen), accent: T.purple, exportRows: reOpened.filter(r => r.OrderID && r.OrderID !== "-" && orderReopen[r.OrderID] > 1) },
        ].map((k, i) => <KpiCard key={i} {...k} sub="" icon="reopen" />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <SectionHeader title="Agents with Most Reopens" action={<ExportButton rows={topAgentReopens.map(([agent, count]) => ({ agent, count }))} name="agents-with-most-reopens" />} />
          <MiniBar data={topAgentReopens.map(([k, v]) => ({ k: k.split("@")[0], v }))} colorFn={() => T.red} />
        </div>
        <div className="card" style={{ padding: 20 }}>
          <SectionHeader title="Reopen by Category" action={<ExportButton rows={Object.entries(reOpened.reduce((acc, r) => { const c = r["Ticket Category"] || "-"; acc[c] = (acc[c] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([category, count]) => ({ category, count }))} name="reopen-by-category" />} />
          <MiniBar data={
            Object.entries(
              reOpened.reduce((acc, r) => { const c = r["Ticket Category"] || "-"; acc[c] = (acc[c] || 0) + 1; return acc; }, {})
            ).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => ({ k, v }))
          } colorFn={() => T.amber} />
        </div>
      </div>

      <SectionHeader title="Reopened Ticket List" action={<ExportButton rows={reOpened} name="reopened-ticket-list" />} />
      <div className="table-wrap">
        <table>
          <thead><tr>
            {["Ticket ID","Customer","Order","Category","Resolved On","Reopened On","Days Gap","Agent"].map(h => <th key={h}>{h}</th>)}
          </tr></thead>
          <tbody>
            {reOpened.slice(0, 100).map((r, i) => {
              const gap = (r._resolved && r._reopened) ? daysBetween(r._resolved, r._reopened) : null;
              return (
                <tr key={i}>
                  <td><span className="mono" style={{ color: T.red }}>#{r.ticketId}</span></td>
                  <td>{r.customerName || "—"}</td>
                  <td><span className="mono" style={{ fontSize: 11 }}>{r.OrderID !== "-" ? r.OrderID : "—"}</span></td>
                  <td style={{ fontSize: 11 }}>{r["Ticket Category_Ticket Sub-Category"] !== "-" ? r["Ticket Category_Ticket Sub-Category"] : r["Ticket Category"] || "—"}</td>
                  <td style={{ fontSize: 11 }}>{fmt.date(r.resolvedAtDate)}</td>
                  <td style={{ fontSize: 11 }}>{fmt.date(r["Reopened Date"])}</td>
                  <td><span className={`badge badge-${!gap ? "blue" : gap <= 1 ? "red" : gap <= 7 ? "amber" : "green"}`}>{gap != null ? `${gap.toFixed(1)}d` : "—"}</span></td>
                  <td style={{ fontSize: 11 }}>{r.assignedAgent ? r.assignedAgent.split("@")[0] : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── DUPLICATE DETECTION ─────────────────────────────────────────────────────
const DuplicateDetection = ({ stats }) => (
  <div className="fade-in">
    <SectionHeader title="Duplicate Detection" sub={`${stats.duplicateOrders.length} orders with multiple tickets found`} action={<ExportButton rows={stats.duplicateTickets} name="duplicate-ticket-list" />} />
    {stats.duplicateOrders.length === 0
      ? <div style={{ padding: "40px 0", textAlign: "center", color: T.textMuted }}>✅ No duplicate orders detected</div>
      : stats.duplicateOrders.map((dup, i) => (
        <div key={i} className="card" style={{ padding: 16, marginBottom: 12, borderColor: "rgba(236,72,153,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ color: T.pink }}><Icon n="duplicate" s={16} /></span>
            <span style={{ fontWeight: 600, color: T.text }}>Order: </span>
            <span className="mono" style={{ color: T.pink }}>{dup.orderId}</span>
            <span className={`badge badge-${dup.count > 3 ? "red" : "amber"}`}>{dup.count} tickets</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {dup.tickets.map((t, j) => (
              <div key={j} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "6px 12px", fontSize: 12 }}>
                <span className="mono" style={{ color: T.blue }}>#{t.ticketId}</span>
                <span className={`badge`} style={{ marginLeft: 6, background: `${STATUS_COLORS[t._status] || T.textMuted}22`, color: STATUS_COLORS[t._status] || T.textMuted, border: `1px solid ${STATUS_COLORS[t._status] || T.textMuted}44` }}>{t._status}</span>
                <span style={{ color: T.textMuted, marginLeft: 6 }}>{t["Ticket Category_Ticket Sub-Category"] !== "-" ? t["Ticket Category_Ticket Sub-Category"] : t["Ticket Category"] || ""}</span>
              </div>
            ))}
          </div>
        </div>
      ))
    }
  </div>
);

// ─── SLA MONITOR ─────────────────────────────────────────────────────────────
const SlaMonitor = ({ stats, rules }) => {
  const slaData = [
    { label: "Pending > Customer SLA", count: stats.df.filter(r => r._status === "PENDING" && r._daysSinceCreated > rules.pendingCustomerInactivity).length, color: T.red, icon: "🔴" },
    { label: "Resolved > Auto-close SLA", count: stats.df.filter(r => r._status === "RESOLVED" && r._daysSinceResolved > rules.resolvedAutoClose).length, color: T.amber, icon: "🟡" },
    { label: "Open > Agent SLA", count: stats.df.filter(r => r._status === "OPEN" && r._daysSinceCreated > rules.openAgentInactivity).length, color: T.amber, icon: "🟡" },
    { label: "New > Assignment SLA", count: stats.df.filter(r => r._status === "NEW" && r._daysSinceCreated > rules.newTicketSLA).length, color: T.purple, icon: "🟣" },
    { label: "ACR > Auto-close SLA", count: stats.df.filter(r => r._status === "ACR" && r._daysSinceCreated > rules.acrAutoClose).length, color: T.red, icon: "🔴" },
  ];

  return (
    <div className="fade-in">
      <SectionHeader title="SLA Monitor" sub="Tickets breaching configured time rules" action={<ExportButton rows={stats.slaRisk} name="sla-monitor-flagged-tickets" />} />
      <div style={{ display: "grid", gap: 10, marginBottom: 24 }}>
        {slaData.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12, background: T.glass, border: `1px solid ${T.glassBorder}` }}>
            <span style={{ fontSize: 18 }}>{s.icon}</span>
            <div style={{ flex: 1, fontSize: 14, color: T.text }}>{s.label}</div>
            <span className={`badge badge-${s.count > 10 ? "red" : s.count > 3 ? "amber" : "green"}`}>{fmt.num(s.count)} tickets</span>
            <div style={{ width: 120, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${Math.min((s.count / stats.total) * 1000, 100)}%`, height: "100%", background: s.color, borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>
      <SectionHeader title="SLA At Risk Tickets" sub="Open/Pending tickets older than 3 days" action={<ExportButton rows={stats.slaRisk} name="sla-at-risk-tickets" />} />
      <div className="table-wrap">
        <table>
          <thead><tr>
            {["Ticket ID","Status","Customer","Category","Days Old","Agent","Channel"].map(h => <th key={h}>{h}</th>)}
          </tr></thead>
          <tbody>
            {stats.slaRisk.slice(0, 100).map((r, i) => (
              <tr key={i}>
                <td><span className="mono" style={{ color: T.amber }}>#{r.ticketId}</span></td>
                <td><span className="badge" style={{ background: `${STATUS_COLORS[r._status] || T.textMuted}22`, color: STATUS_COLORS[r._status] || T.textMuted, border: `1px solid ${STATUS_COLORS[r._status] || T.textMuted}44` }}>{r._status}</span></td>
                <td>{r.customerName || "—"}</td>
                <td style={{ fontSize: 11 }}>{r["Ticket Category"] || "—"}</td>
                <td style={{ color: r._daysSinceCreated > 7 ? T.red : T.amber, fontWeight: 600 }}>{r._daysSinceCreated?.toFixed(1)}d</td>
                <td style={{ fontSize: 11 }}>{r.assignedAgent ? r.assignedAgent.split("@")[0] : "—"}</td>
                <td><span className="tag">{r.channel || "—"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── SETTINGS / RULE ENGINE ───────────────────────────────────────────────────
const SettingsView = ({ rules, setRules }) => {
  const ruleConfig = [
    { key: "pendingCustomerInactivity", label: "Pending — Customer Inactivity", desc: "Auto-close if no customer reply after X days", unit: "days" },
    { key: "pendingAgentInactivity", label: "Pending — Agent Inactivity", desc: "Flag if no agent action after X days", unit: "days" },
    { key: "resolvedAutoClose", label: "Resolved — Auto-close after", desc: "Move Resolved → Closed after X days", unit: "days" },
    { key: "openAgentInactivity", label: "Open — Agent Inactivity SLA", desc: "Escalate if no agent reply after X days", unit: "days" },
    { key: "newTicketSLA", label: "New — Assignment SLA", desc: "Flag if unassigned after X days", unit: "days" },
    { key: "acrAutoClose", label: "ACR — Auto-close after", desc: "ACR tickets close after X days of inactivity", unit: "days" },
    { key: "asrAutoClose", label: "ASR — Auto-close after", desc: "ASR tickets close after X days of inactivity", unit: "days" },
    { key: "botAutoClose", label: "Bot — Auto-close after", desc: "Bot-only tickets close after X days", unit: "days" },
    { key: "slaRiskThreshold", label: "SLA Risk Threshold", desc: "Flag tickets older than X days as SLA risk", unit: "days" },
  ];

  return (
    <div className="fade-in">
      <SectionHeader title="Rule Engine Settings" sub="Configure all SLA and auto-closure rules — changes apply immediately" />
      <div style={{ maxWidth: 640 }}>
        {ruleConfig.map(rc => (
          <div key={rc.key} className="card" style={{ padding: 18, marginBottom: 10, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 2 }}>{rc.label}</div>
              <div style={{ fontSize: 12, color: T.textMuted }}>{rc.desc}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 16 }} onClick={() => setRules(r => ({ ...r, [rc.key]: Math.max(1, (r[rc.key] || 1) - 1) }))}>−</button>
              <div style={{ minWidth: 50, textAlign: "center", background: "rgba(59,130,246,0.1)", borderRadius: 8, padding: "6px 12px", fontWeight: 700, color: T.blueL, fontSize: 16 }}>{rules[rc.key]}</div>
              <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 16 }} onClick={() => setRules(r => ({ ...r, [rc.key]: (r[rc.key] || 1) + 1 }))}>+</button>
              <span style={{ fontSize: 12, color: T.textMuted }}>{rc.unit}</span>
            </div>
          </div>
        ))}
        <div className="card" style={{ padding: 16, marginTop: 16, borderColor: "rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.05)" }}>
          <div style={{ fontSize: 13, color: T.greenL }}>✅ Rules are applied live — all violation counts update instantly when you change a value.</div>
        </div>
      </div>
    </div>
  );
};

// ─── AI INSIGHTS ──────────────────────────────────────────────────────────────
const AIInsights = ({ stats, rules }) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState("");

  const generateInsights = async () => {
    setLoading(true); setError(""); setInsights(null);
    const summary = {
      total: stats.total, closed: stats.closed, resolved: stats.resolved,
      open: stats.open, pending: stats.pending, reOpened: stats.reOpened,
      resolutionRate: stats.resolutionRate.toFixed(1),
      avgResHrs: stats.avgResHrs.toFixed(1), avgFrtHrs: stats.avgFrtHrs.toFixed(1),
      acrViolations: stats.acrViolations.length, slaRisk: stats.slaRisk.length,
      duplicates: stats.duplicateOrders.length,
      topIssues: Object.entries(stats.subCats).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>`${k}:${v}`).join(", "),
      topBrands: Object.entries(stats.brands).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>`${k}:${v}`).join(", "),
      channels: Object.entries(stats.channels).map(([k,v])=>`${k}:${v}`).join(", "),
      agents: stats.agents.slice(0,5).map(a=>`${a.name}(${a.total}tkts,${a.resRate.toFixed(0)}%res)`).join(", "),
      statusMismatch: stats.statusMismatch.length,
      reopenedWithin24h: stats.reopenedWithin24h.length,
    };
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 1000,
          messages: [{ role: "user", content: `You are a Customer Support Operations AI Analyst for WOW CS. Analyze this ticket data and provide EXACTLY 8 actionable insights in JSON format.\n\nData: ${JSON.stringify(summary)}\nRules: Resolved auto-close after ${rules.resolvedAutoClose} days, Pending customer inactivity ${rules.pendingCustomerInactivity} days.\n\nRespond ONLY with a JSON array of 8 objects, each with: {\"priority\":\"CRITICAL|HIGH|MEDIUM\",\"icon\":\"emoji\",\"title\":\"short title\",\"insight\":\"one sentence finding\",\"action\":\"one sentence recommendation\"}\n\nNo markdown, no explanation, just the JSON array.` }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      const cleaned = text.replace(/```json|```/g,"").trim();
      setInsights(JSON.parse(cleaned));
    } catch(e) { setError("Could not generate insights. Check API connection."); }
    setLoading(false);
  };

  const colorMap = { CRITICAL: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", badge: "red" }, HIGH: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", badge: "amber" }, MEDIUM: { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)", badge: "blue" } };

  return (
    <div className="fade-in">
      <SectionHeader title="AI Insights" sub="Powered by Claude AI — auto-analysis of your ticket dump"
        action={<div style={{ display: "flex", gap: 8 }}>{insights && <ExportButton rows={insights} name="ai-insights" />}<button className="btn btn-primary" onClick={generateInsights} disabled={loading}>{loading ? <><span className="spin" style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block" }} /> Analyzing...</> : <><Icon n="ai" s={14} /> Generate Insights</>}</button></div>} />

      {error && <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.1)", color: T.red, marginBottom: 16 }}>{error}</div>}

      {!insights && !loading && (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ color: T.textMuted, marginBottom: 16 }}><Icon n="ai" s={40} /></div>
          <div style={{ fontSize: 16, color: T.textSub, marginBottom: 8 }}>Click "Generate Insights" to run AI analysis</div>
          <div style={{ fontSize: 13, color: T.textMuted }}>Claude AI will analyse your {fmt.num(stats.total)} tickets and generate actionable recommendations</div>
        </div>
      )}

      {insights && (
        <div style={{ display: "grid", gap: 10 }}>
          {insights.map((ins, i) => {
            const cm = colorMap[ins.priority] || colorMap.MEDIUM;
            return (
              <div key={i} style={{ padding: "16px 18px", borderRadius: 12, background: cm.bg, border: `1px solid ${cm.border}` }} className="fade-in">
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ fontSize: 22, lineHeight: 1 }}>{ins.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{ins.title}</span>
                      <span className={`badge badge-${cm.badge}`}>{ins.priority}</span>
                    </div>
                    <div style={{ fontSize: 13, color: T.textSub, marginBottom: 6, lineHeight: 1.5 }}>{ins.insight}</div>
                    <div style={{ fontSize: 12, color: T.blueL, background: "rgba(59,130,246,0.08)", borderRadius: 6, padding: "5px 10px", display: "inline-block" }}>💡 {ins.action}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── CUSTOMER HEALTH ──────────────────────────────────────────────────────────
const CustomerHealth = ({ stats }) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const topCustomers = useMemo(() => {
    const cmap = {};
    stats.df.forEach(r => {
      const id = r.customerId; if (!id) return;
      if (!cmap[id]) cmap[id] = { id, name: r.customerName || id, tickets: [], reopens: 0 };
      cmap[id].tickets.push(r);
      if (r._reopened) cmap[id].reopens++;
    });
    return Object.values(cmap).sort((a, b) => b.tickets.length - a.tickets.length).slice(0, 100);
  }, [stats.df]);

  const filtered = topCustomers.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.id.includes(search));

  const getCustomerDetails = c => {
    const tickets = c.tickets;
    const resolved = tickets.filter(t => ["RESOLVED","CLOSED"].includes(t._status)).length;
    const refunds = tickets.filter(t => ["Refund Cancellation","RTO Refund","Refund Post Delivery"].includes(t["Ticket Category_Ticket Sub-Category"])).length;
    const score = Math.max(0, 100 - (c.reopens * 15) - (tickets.length > 5 ? 20 : 0) - ((tickets.length - resolved) / tickets.length * 20));
    return { resolved, refunds, riskScore: Math.round(score) };
  };

  const customerExport = filtered.map(c => {
    const det = getCustomerDetails(c);
    return { customerId: c.id, customerName: c.name, totalTickets: c.tickets.length, resolved: det.resolved, reopens: c.reopens, refundTickets: det.refunds, riskScore: det.riskScore, lastTicket: c.tickets[0]?.createdAtDate || "" };
  });

  return (
    <div className="fade-in">
      <SectionHeader title="Customer Health" sub="Per-customer ticket patterns and risk assessment" action={<ExportButton rows={customerExport} name="customer-health" />} />
      <input className="input" placeholder="Search customer name or ID..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 360, marginBottom: 16 }} />
      <div className="table-wrap">
        <table>
          <thead><tr>
            {["Customer","Total Tickets","Resolved","Reopens","Refund Tickets","Risk Score","Last Ticket"].map(h => <th key={h}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((c, i) => {
              const det = getCustomerDetails(c);
              return (
                <tr key={i} style={{ cursor: "pointer" }} onClick={() => setSelected(c)}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>{c.tickets.length}</td>
                  <td style={{ color: T.green }}>{det.resolved}</td>
                  <td style={{ color: c.reopens > 0 ? T.red : T.textSub }}>{c.reopens}</td>
                  <td style={{ color: det.refunds > 0 ? T.amber : T.textSub }}>{det.refunds}</td>
                  <td><span className={`badge badge-${det.riskScore >= 75 ? "green" : det.riskScore >= 50 ? "amber" : "red"}`}>{det.riskScore}</span></td>
                  <td style={{ fontSize: 11 }}>{fmt.date(c.tickets[0]?.createdAtDate)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── ORDER HEALTH ─────────────────────────────────────────────────────────────
const OrderHealth = ({ stats }) => {
  const [search, setSearch] = useState("");
  const [result, setResult] = useState(null);

  const searchOrder = () => {
    const tickets = stats.df.filter(r => (r.OrderID || "").toLowerCase().includes(search.toLowerCase()) || (r.Order || "").toLowerCase().includes(search.toLowerCase()));
    setResult(tickets.length ? tickets : []);
  };

  return (
    <div className="fade-in">
      <SectionHeader title="Order Health" sub="Full ticket timeline per order" />
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input className="input" placeholder="Enter Order ID (e.g. ZOP#123456)..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 360 }} onKeyDown={e => e.key === "Enter" && searchOrder()} />
        <button className="btn btn-primary" onClick={searchOrder}><Icon n="search" s={14} /> Search</button>
      </div>
      {result !== null && (
        result.length === 0
          ? <div style={{ padding: "40px 0", textAlign: "center", color: T.textMuted }}>No tickets found for this order ID</div>
          : <div>
            <div style={{ marginBottom: 12 }}>
              <span className="badge badge-blue">{result.length} tickets</span>
              <span style={{ marginLeft: 8 }}><ExportButton rows={result} name={`order-${search || "tickets"}`} /></span>
              {result.length > 1 && <span className="badge badge-amber" style={{ marginLeft: 8 }}>⚠️ Multiple tickets — possible duplicate</span>}
            </div>
            {result.map((r, i) => (
              <div key={i} className="card" style={{ padding: 18, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="mono" style={{ color: T.blue, fontSize: 15, fontWeight: 700 }}>#{r.ticketId}</span>
                    <span className="badge" style={{ background: `${STATUS_COLORS[r._status] || T.textMuted}22`, color: STATUS_COLORS[r._status] || T.textMuted, border: `1px solid ${STATUS_COLORS[r._status] || T.textMuted}44` }}>{r._status}</span>
                  </div>
                  <span style={{ fontSize: 12, color: T.textMuted }}>{r.channel} · {r.ticketType}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
                  {[["Customer", r.customerName], ["Category", r["Ticket Category"]], ["Sub-Category", r["Ticket Category_Ticket Sub-Category"]], ["Agent", r.assignedAgent?.split("@")[0]], ["Created", fmt.date(r.createdAtDate)], ["Resolved", fmt.date(r.resolvedAtDate)], ["Closed", fmt.date(r.closedAtDate)], ["Brand", r["Brand Name"]]].map(([l, v]) => (
                    <div key={l} style={{ fontSize: 11 }}>
                      <span style={{ color: T.textMuted }}>{l}: </span>
                      <span style={{ color: T.text }}>{v || "—"}</span>
                    </div>
                  ))}
                </div>
                {r.tags && <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 4 }}>{r.tags.split(",").slice(0, 8).map((t, j) => <span key={j} className="tag">{t.trim()}</span>)}</div>}
              </div>
            ))}
          </div>
      )}
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function OPX() {
  const [rawData, setRawData] = useState(null);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [rules, setRules] = useState({
    pendingCustomerInactivity: 10,
    pendingAgentInactivity: 4,
    resolvedAutoClose: 2,
    openAgentInactivity: 5,
    newTicketSLA: 5,
    acrAutoClose: 2,
    asrAutoClose: 2,
    botAutoClose: 1,
    slaRiskThreshold: 3,
  });

  const stats = useMemo(() => rawData ? processData(rawData, rules) : null, [rawData, rules]);

  const NAV = [
    { section: "MAIN" },
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "action", label: "Action Center", icon: "fire", badge: stats?.acrViolations?.length },
    { section: "OPERATIONS" },
    { id: "tickets", label: "Tickets", icon: "tickets" },
    { id: "agents", label: "Agents", icon: "agents" },
    { id: "customers", label: "Customers", icon: "customer" },
    { id: "orders", label: "Order Health", icon: "order" },
    { section: "INTELLIGENCE" },
    { id: "sla", label: "SLA Monitor", icon: "sla" },
    { id: "reopen", label: "Reopen Analytics", icon: "reopen" },
    { id: "autoclosure", label: "Auto Closure Audit", icon: "alert" },
    { id: "duplicates", label: "Duplicate Detection", icon: "duplicate" },
    { section: "TOOLS" },
    { id: "ai", label: "AI Insights", icon: "ai" },
    { id: "settings", label: "Settings / Rules", icon: "settings" },
  ];

  const renderContent = () => {
    if (!stats) return null;
    switch (activeNav) {
      case "dashboard": return <DashboardHome stats={stats} onNav={setActiveNav} />;
      case "action": return <ActionCenter stats={stats} />;
      case "tickets": return <TicketsView stats={stats} />;
      case "agents": return <AgentsView stats={stats} />;
      case "customers": return <CustomerHealth stats={stats} />;
      case "orders": return <OrderHealth stats={stats} />;
      case "sla": return <SlaMonitor stats={stats} rules={rules} />;
      case "reopen": return <ReopenAnalytics stats={stats} />;
      case "autoclosure": return <ActionCenter stats={stats} />;
      case "duplicates": return <DuplicateDetection stats={stats} />;
      case "ai": return <AIInsights stats={stats} rules={rules} />;
      case "settings": return <SettingsView rules={rules} setRules={setRules} />;
      default: return <DashboardHome stats={stats} onNav={setActiveNav} />;
    }
  };

  if (!rawData) return <><GlobalStyle /><UploadScreen onData={setRawData} /></>;

  return (
    <>
      <GlobalStyle />
      <div style={{ display: "flex", minHeight: "100vh", background: T.bg0 }}>

        {/* SIDEBAR */}
        <div style={{ width: sidebarOpen ? 220 : 60, flexShrink: 0, background: T.bg1, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", transition: "width 0.3s ease", overflow: "hidden" }}>
          <div style={{ padding: "18px 14px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${T.blue},${T.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "white", flexShrink: 0 }}>O</div>
            {sidebarOpen && <div><div style={{ fontSize: 15, fontWeight: 800, color: T.text, letterSpacing: "-0.02em" }}>OPX</div><div style={{ fontSize: 10, color: T.textMuted, fontWeight: 500 }}>OPERATIONS HQ</div></div>}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
            {NAV.map((item, i) => {
              if (item.section) return sidebarOpen ? <div key={i} className="nav-section">{item.section}</div> : <div key={i} style={{ height: 10 }} />;
              return (
                <div key={i} className={`nav-item ${activeNav === item.id ? "active" : ""}`} onClick={() => setActiveNav(item.id)}>
                  <Icon n={item.icon} s={16} />
                  {sidebarOpen && <><span style={{ flex: 1 }}>{item.label}</span>{item.badge > 0 && <span style={{ background: T.red, color: "white", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{item.badge > 99 ? "99+" : item.badge}</span>}</>}
                </div>
              );
            })}
          </div>

          <div style={{ padding: "12px 8px", borderTop: `1px solid ${T.border}` }}>
            <div className="nav-item" onClick={() => { setRawData(null); setActiveNav("dashboard"); }}>
              <Icon n="upload" s={16} />
              {sidebarOpen && <span>Upload New Dump</span>}
            </div>
            <div className="nav-item" onClick={() => setSidebarOpen(o => !o)}>
              <Icon n="chevron" s={16} c={sidebarOpen ? T.textMuted : T.textSub} />
              {sidebarOpen && <span>Collapse</span>}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, overflow: "auto", background: `radial-gradient(ellipse at 20% 0%, rgba(59,130,246,0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(139,92,246,0.04) 0%, transparent 50%), ${T.bg0}` }}>
          {/* TOPBAR */}
          <div style={{ padding: "14px 28px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: T.bg1, position: "sticky", top: 0, zIndex: 10 }}>
            <div style={{ fontSize: 13, color: T.textMuted }}>
              <span style={{ color: T.text, fontWeight: 600 }}>{NAV.find(n => n.id === activeNav)?.label || "Dashboard"}</span>
              <span style={{ margin: "0 6px" }}>·</span>
              <span>{fmt.num(stats.total)} tickets loaded</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {stats.acrViolations.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer", fontSize: 12 }} onClick={() => setActiveNav("action")}>
                  <span className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: T.red, display: "inline-block" }} />
                  <span style={{ color: T.red, fontWeight: 600 }}>{stats.acrViolations.length} violations</span>
                </div>
              )}
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${T.blue},${T.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white", cursor: "default" }}>M</div>
            </div>
          </div>

          <div style={{ padding: "24px 28px" }}>
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
}
