import { useState, useEffect } from 'react';
import type { MouseEvent } from 'react';
import { Activity, Bell, Check, CheckCircle2, ChevronDown, Globe, X } from 'lucide-react';
import logoImage from './assets/server-logo.png?url';
type ServiceStatus = {
  id: 'minecraft' | 'queue' | 'main-server' | 'website' | 'shop';
};

type LiveStatus = {
  checkedAt: string;
  hasHistory: boolean;
  services: Record<string, { configured: boolean; up: boolean | null; uptime: number | null; latencyMs?: number | null; source?: string | null; players?: number | null; derived?: boolean; history: { ts: string; up: boolean | null }[] }>;
  metrics: { ts: string; players: number }[];
};

const statusServices: ServiceStatus[] = [
  { id: 'minecraft' },
  { id: 'queue' },
  { id: 'main-server' },
  { id: 'website' },
  { id: 'shop' },
];
const displayedServiceIds = new Set<ServiceStatus['id']>(statusServices.map((service) => service.id));
const statusGroups = [
  { id: 'minecraft', title: 'Minecraft', services: [{ id: 'main-server' }, { id: 'queue' }] },
  { id: 'website', title: 'Website', services: [{ id: 'website' }, { id: 'shop' }] },
] as const;

function UptimeBars({ history, isThai }: { history: { ts: string; up: boolean | null }[]; isThai: boolean }) {
  const historyAvailable = history.some((item) => item.up !== null);
  const bars = history.length ? history.slice(-7) : Array.from({ length: 7 }, () => ({ ts: '', up: null }));
  return <div className="status-bars-wrap">
    <div className="status-bars" role="img" aria-label={historyAvailable ? (isThai ? 'ประวัติ uptime 7 วัน' : '7 day uptime history') : (isThai ? 'ยังไม่มีประวัติ uptime' : 'No uptime history configured')}>
      {bars.map((item, index) => {
        const state = !historyAvailable || item.up === null ? 'unknown' : item.up ? 'up' : 'down';
        const date = item.ts && Number.isFinite(Date.parse(item.ts))
          ? new Date(item.ts).toLocaleString(isThai ? 'th-TH' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
          : '';
        const label = state === 'up' ? (isThai ? 'ออนไลน์' : 'Operational') : state === 'down' ? (isThai ? 'ออฟไลน์' : 'Outage') : (isThai ? 'ไม่มีข้อมูล' : 'No data');
        return <span key={index} className={`status-bar ${state}`} data-tooltip={date ? `${date}: ${label}` : label} aria-label={date ? `${date}: ${label}` : label} />;
      })}
    </div>
    <div className="status-bars-labels"><span>{isThai ? '7 วันที่แล้ว' : '7 days ago'}</span><span>{isThai ? 'วันนี้' : 'Today'}</span></div>
  </div>;
}

type PlayerMetric = { ts: string; players: number };
const metricRangeMs = { day: 24 * 60 * 60 * 1000, week: 7 * 24 * 60 * 60 * 1000, month: 30 * 24 * 60 * 60 * 1000 };

function MetricsChart({ values, range, isThai }: { values: PlayerMetric[]; range: 'month' | 'week' | 'day'; isThai: boolean }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const now = Date.now();
  const rangeMs = metricRangeMs[range];
  const cutoff = now - rangeMs;
  const visibleValues = values
    .filter((point) => Number.isFinite(Date.parse(point.ts)) && Date.parse(point.ts) >= cutoff && Date.parse(point.ts) <= now)
    .sort((a, b) => Date.parse(a.ts) - Date.parse(b.ts));
  const chartValues = visibleValues.length > 240
    ? Array.from({ length: 240 }, (_, index) => visibleValues[Math.round(index * (visibleValues.length - 1) / 239)])
    : visibleValues;
  const minValue = chartValues.length ? Math.min(...chartValues.map((point) => point.players)) : 0;
  const maxValue = Math.max(1, ...chartValues.map((point) => point.players));
  const valueSpan = Math.max(50, maxValue - minValue);
  const firstMetricTime = chartValues.length ? Date.parse(chartValues[0].ts) : cutoff;
  const lastMetricTime = chartValues.length ? Date.parse(chartValues[chartValues.length - 1].ts) : now;
  const metricTimeSpan = Math.max(1, lastMetricTime - firstMetricTime);
  const pointCoords = chartValues.map((point) => ({
    x: 12 + ((Date.parse(point.ts) - firstMetricTime) / metricTimeSpan) * 876,
    y: 92 - ((point.players - (minValue + maxValue) / 2) / valueSpan) * 54,
  }));
  const linePath = pointCoords.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = pointCoords[index - 1];
    const beforePrevious = pointCoords[Math.max(0, index - 2)];
    const next = pointCoords[Math.min(pointCoords.length - 1, index + 1)];
    const control1X = previous.x + (point.x - beforePrevious.x) / 6;
    const control1Y = previous.y + (point.y - beforePrevious.y) / 6;
    const control2X = point.x - (next.x - previous.x) / 6;
    const control2Y = point.y - (next.y - previous.y) / 6;
    return `${path} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${point.x} ${point.y}`;
  }, '');
  const areaPath = pointCoords.length ? `${linePath} L ${pointCoords[pointCoords.length - 1].x} 166 L ${pointCoords[0].x} 166 Z` : '';
  const hovered = hoveredIndex == null ? null : chartValues[hoveredIndex];
  const hoverPoint = hoveredIndex == null ? null : pointCoords[hoveredIndex];
  const timeLabel = hovered ? new Date(hovered.ts).toLocaleString(isThai ? 'th-TH' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '';

  const updateHover = (event: MouseEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width || !visibleValues.length) return;
    const x = ((event.clientX - bounds.left) / bounds.width) * 900;
    let nearest = 0;
    for (let index = 1; index < pointCoords.length; index += 1) {
      if (Math.abs(pointCoords[index].x - x) < Math.abs(pointCoords[nearest].x - x)) nearest = index;
    }
    setHoveredIndex(nearest);
  };

  return <div className="metrics-chart" aria-label={isThai ? 'กราฟจำนวนผู้เล่นออนไลน์' : 'Online player metrics chart'}>
    {visibleValues.length > 1 ? <div className="chart-plot-wrap">
      <svg className="chart-plot" viewBox="0 0 900 180" preserveAspectRatio="none" role="img" aria-label={isThai ? 'กราฟแสดงจำนวนผู้เล่นตามเวลา' : 'Player count over time'} onMouseMove={updateHover} onMouseLeave={() => setHoveredIndex(null)}>
        <defs><linearGradient id="player-area-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#aeb5bf" stopOpacity=".2" /><stop offset="100%" stopColor="#aeb5bf" stopOpacity="0" /></linearGradient></defs>
        <line x1="12" y1="166" x2="888" y2="166" className="chart-baseline" />
        <path d={areaPath} className="chart-area" />
        <path d={linePath} className="chart-line chart-line-muted" />
        {hoverPoint && <><line x1={hoverPoint.x} y1="10" x2={hoverPoint.x} y2="166" className="chart-crosshair" /><circle cx={hoverPoint.x} cy={hoverPoint.y} r="4.5" className="chart-hover-point" /></>}
      </svg>
      {hovered && hoverPoint && <div className="chart-tooltip" style={{ left: `${Math.min(78, Math.max(5, hoverPoint.x / 9))}%`, top: `${Math.min(78, Math.max(12, hoverPoint.y / 1.8))}%` }}><time>{range === 'day' ? new Date(hovered.ts).toLocaleTimeString(isThai ? 'th-TH' : 'en-US', { hour: 'numeric', minute: '2-digit' }) : new Date(hovered.ts).toLocaleDateString(isThai ? 'th-TH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time><strong><i />{hovered.players.toLocaleString()} {isThai ? 'ผู้เล่น' : 'players'}</strong></div>}
    </div> : <div className="chart-no-data">{isThai ? 'กำลังสะสมข้อมูลจริง…' : 'Collecting live data…'}</div>}
  </div>;
}

async function fetchPublicMinecraftStatus() {
  const queueCount = (data: any) => {
    for (const player of data.players?.list || []) {
      const name = typeof player === 'string' ? player : player.name_clean || player.name_raw || player.name || '';
      const match = name.replace(/§[0-9a-fk-or]/gi, '').match(/^Queue:\s*(\d+)$/i);
      if (match) return Number(match[1]);
    }
    return null;
  };
  const inGameCount = (data: any) => {
    for (const player of data.players?.list || []) {
      const name = typeof player === 'string' ? player : player.name_clean || player.name_raw || player.name || '';
      const match = name.replace(/§[0-9a-fk-or]/gi, '').match(/^In-game:\s*(\d+)$/i);
      if (match) return Number(match[1]);
    }
    return null;
  };
  const providers = await Promise.allSettled([
    (async () => {
      const response = await fetch('https://api.mcstatus.io/v2/status/java/2b2t-th.org', {
        cache: 'no-store',
        signal: AbortSignal.timeout(6000),
      });
      if (!response.ok) throw new Error('mcstatus.io unavailable');
      const data = await response.json();
      if (typeof data.online !== 'boolean') throw new Error('mcstatus.io returned no status');
      return { up: data.online, players: data.online ? (inGameCount(data) ?? Number(data.players?.online || 0)) : 0, queuePlayers: data.online ? queueCount(data) : null };
    })(),
    (async () => {
      const response = await fetch('https://api.mcsrvstat.us/3/2b2t-th.org', {
        cache: 'no-store',
        signal: AbortSignal.timeout(6000),
      });
      if (!response.ok) throw new Error('mcsrvstat.us unavailable');
      const data = await response.json();
      if (typeof data.online !== 'boolean') throw new Error('mcsrvstat.us returned no status');
      return { up: data.online, players: data.online ? (inGameCount(data) ?? Number(data.players?.online || 0)) : 0, queuePlayers: data.online ? queueCount(data) : null };
    })(),
  ]);
  const checks = providers
    .filter((result): result is PromiseFulfilledResult<{ up: boolean; players: number; queuePlayers: number | null }> => result.status === 'fulfilled')
    .map((result) => result.value);
  const result = checks.find((check) => check.up) || checks[0];
  return result || { up: null, players: null, queuePlayers: null };
}

export default function StatusPage({ lang, onToggleLanguage }: { lang: 'en' | 'th'; onToggleLanguage: () => void }) {
  const [range, setRange] = useState<'month' | 'week' | 'day'>('month');
  const [liveStatus, setLiveStatus] = useState<LiveStatus | null>(null);
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);
  const [minecraftFallback, setMinecraftFallback] = useState<{ up: boolean | null; players: number | null; queuePlayers: number | null } | null>(null);
  const isThai = lang === 'th';
  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const response = await fetch('https://status.2b2t-th.org/api/status?format=legacy', { cache: 'no-store' });
        if (!response.ok) throw new Error('Status API unavailable');
        if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('Status API returned non-JSON data');
        const data: LiveStatus = await response.json();
        if (!mounted) return;
        setLiveStatus(data);
        setLastCheckedAt(new Date());
        if (typeof data.services?.minecraft?.latencyMs !== 'number' && data.services?.minecraft?.source !== 'velocity') {
          setMinecraftFallback(await fetchPublicMinecraftStatus());
        } else {
          setMinecraftFallback(null);
        }
      } catch {
        if (mounted) {
          setLiveStatus(null);
          setMinecraftFallback(await fetchPublicMinecraftStatus());
        }
      }
    };
    check();
    const timer = window.setInterval(check, 30000);
    return () => { mounted = false; window.clearInterval(timer); };
  }, []);
  const minecraftMonitorFailed = Boolean(liveStatus && typeof liveStatus.services.minecraft?.latencyMs !== 'number' && liveStatus.services.minecraft?.source !== 'velocity');
  const serviceStatus = (id: ServiceStatus['id']) => {
    const statusId = id === 'main-server' ? 'minecraft' : id;
    const service = liveStatus?.services[statusId];
    if (service?.configured === false) return null;
    if (minecraftMonitorFailed && (id === 'minecraft' || id === 'main-server')) return minecraftFallback?.up ?? null;
    if (minecraftMonitorFailed && id === 'main-server') return minecraftFallback?.up ?? null;
    if (minecraftMonitorFailed && id === 'queue' && service?.derived) return minecraftFallback?.up ?? null;
    return service?.up ?? null;
  };
  const serverOnline = serviceStatus('minecraft');
  const services = Object.entries(liveStatus?.services || {}) as [string, LiveStatus['services'][string]][];
  const configuredServices = services.filter(([id, service]) => displayedServiceIds.has(id as ServiceStatus['id']) && service.configured);
  const hasOfflineService = configuredServices.some(([id, service]) => {
    const effectiveStatus = id === 'minecraft' || (id === 'queue' && service.derived) ? serverOnline : service.up;
    return effectiveStatus === false;
  });
  const hasUnknownService = configuredServices.some(([id, service]) => {
    const effectiveStatus = id === 'minecraft' || (id === 'queue' && service.derived) ? serverOnline : service.up;
    return effectiveStatus === null;
  });
  const statusText = !liveStatus
    ? minecraftFallback?.up === true
      ? (isThai ? 'Minecraft ทำงานปกติ แต่ตรวจสอบบริการอื่นไม่ได้' : 'Minecraft is online; other services could not be checked')
      : (isThai ? 'กำลังตรวจสอบสถานะระบบ…' : 'Checking system status…')
    : hasOfflineService
      ? (isThai ? 'พบปัญหาบางบริการ' : 'Some systems are experiencing issues')
      : hasUnknownService
        ? (isThai ? 'กำลังตรวจสอบสถานะบางบริการ…' : 'Checking some services…')
        : (isThai ? 'ระบบทั้งหมดทำงานปกติ' : 'All systems operational');
  const serviceLabel = (id: ServiceStatus['id']) => {
    if (liveStatus?.services[id]?.configured === false) return isThai ? 'ยังไม่ได้ตั้งค่า' : 'Not configured';
    const up = serviceStatus(id);
    if (up === null) return isThai ? 'กำลังตรวจสอบ' : 'Checking';
    if (id === 'queue') return up ? (isThai ? 'ออนไลน์' : 'Online') : (isThai ? 'ออฟไลน์' : 'Offline');
    return up ? (isThai ? 'ปกติ' : 'Operational') : (isThai ? 'ออฟไลน์' : 'Offline');
  };
  const serviceName = (id: ServiceStatus['id']) => id === 'minecraft'
    ? 'Minecraft'
    : id === 'queue' ? 'Queue'
      : id === 'main-server' ? 'Main server'
        : id === 'shop' ? (isThai ? '\u0e23\u0e49\u0e32\u0e19\u0e04\u0e49\u0e32' : 'Shop')
        : isThai ? 'เว็บไซต์' : 'Website';
  const serviceUptime = (id: ServiceStatus['id']) => {
    const statusId = id === 'main-server' ? 'minecraft' : id;
    const uptime = liveStatus?.services[statusId]?.uptime;
    return uptime == null ? '—' : `${uptime.toFixed(1)}% uptime`;
  };
  const groupUptime = (id: 'minecraft' | 'website') => {
    if (id === 'minecraft') return serviceUptime('minecraft');
    return serviceUptime('website');
  };
  const overallIcon = hasOfflineService ? <Activity size={22} /> : <CheckCircle2 size={22} />;
  const formattedCheckedAt = lastCheckedAt?.toLocaleTimeString(isThai ? 'th-TH' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return <div className="status-page">
    <header className="status-header"><div className="status-container status-header-inner"><div className="status-brand"><img src={logoImage} alt="2b2t-th" /></div><button type="button" className="status-language-toggle" onClick={onToggleLanguage} aria-label={isThai ? 'Switch language to English' : 'เปลี่ยนภาษาเป็นภาษาไทย'}><Globe size={16} />{isThai ? 'EN' : 'TH'}</button></div></header>
    <main className="status-container status-main">
      <div className="status-title-row"><h1>{isThai ? 'สถานะระบบ' : 'System status'}</h1><div className="status-last-checked"><span className="status-live-dot" /><span>{lastCheckedAt ? `${isThai ? 'ตรวจล่าสุด' : 'Last checked'} ${formattedCheckedAt}` : (isThai ? 'กำลังตรวจสอบ…' : 'Checking…')}</span></div></div>
      <div className={`status-overall ${serverOnline === false ? 'status-overall-down' : ''}`} aria-live="polite">{overallIcon}<span>{statusText}</span></div>
      <section className="status-groups" aria-label={isThai ? 'สถานะบริการ' : 'Service status'}>
        {statusGroups.map((group) => <div className="status-group" key={group.id}>
          <div className="status-group-heading"><span className="status-group-chevron"><ChevronDown size={14} /></span><strong>{group.title}</strong><span>{groupUptime(group.id)}</span></div>
          <div className="status-group-services">{group.services.map(({ id }) => {
            const live = serviceStatus(id);
            const statusId = id === 'main-server' ? 'minecraft' : id;
            const item = liveStatus?.services[statusId];
            const monitorUnavailable = minecraftMonitorFailed && (id === 'main-server' || (id === 'queue' && item?.derived));
            const history = monitorUnavailable ? [] : item?.history || [];
            const stateClass = live === null ? 'is-unknown' : live ? 'is-up' : 'is-down';
            return <article className="status-service" key={id}>
              <div className="status-service-heading"><strong><span className={`status-service-icon ${stateClass}`}>{live === true ? <Check size={11} /> : live === false ? <X size={11} /> : null}</span>{serviceName(id)}</strong><span>{monitorUnavailable ? '—' : serviceUptime(id)}</span></div>
              <UptimeBars history={history} isThai={isThai} />
            </article>;
          })}</div>
        </div>)}
      </section>
      <section className="status-panel metrics-panel"><div className="metrics-heading"><h2>{isThai ? 'ข้อมูลระบบ' : 'SYSTEM METRICS'}</h2><div className="range-tabs" role="tablist" aria-label={isThai ? 'ช่วงเวลาของกราฟ' : 'Chart time range'}>{(['month', 'week', 'day'] as const).map((item) => <button type="button" role="tab" aria-selected={range === item} key={item} className={range === item ? 'selected' : ''} onClick={() => setRange(item)}>{item === 'month' ? (isThai ? 'เดือน' : 'month') : item === 'week' ? (isThai ? 'สัปดาห์' : 'week') : (isThai ? 'วัน' : 'day')}</button>)}</div></div><div className="metrics-summary"><strong>2b2t-th</strong><span>{liveStatus?.services.minecraft?.players == null ? '—' : `~ ${liveStatus.services.minecraft.players.toLocaleString()} ${isThai ? 'ผู้เล่น' : 'players'}`}</span></div><MetricsChart values={liveStatus?.metrics || []} range={range} isThai={isThai} /></section>
      <section className="status-panel notices-panel"><h2>{isThai ? 'ประกาศล่าสุด' : 'Recent notices'}</h2><div className="notice-empty"><Bell size={24} /><p>{isThai ? 'ไม่มีประกาศในช่วง 7 วันที่ผ่านมา' : 'No notices reported for the past 7 days'}</p></div></section>
    </main>
    <footer className="status-container status-footer"><span>© 2026 2b2t-th</span></footer>
  </div>;
}
