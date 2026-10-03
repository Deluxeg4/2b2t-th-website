import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertCircle, CheckCircle2, CircleChevronDown, RefreshCw } from 'lucide-react';
import logoImage from './assets/server-logo.png?url';

type Sample = { ts: string; up: boolean | null };
type Metric = { ts: string; players: number };
type Service = { configured: boolean; up: boolean | null; uptime: number | null; players?: number | null; history: Sample[]; derived?: boolean };
type Status = { checkedAt: string; services: Record<string, Service>; metrics: Metric[] };
type Range = 'day' | 'week' | 'month';

function History({ history, isThai }: { history: Sample[]; isThai: boolean }) {
  const recent = history.slice(-90);
  const missing = Math.max(0, 90 - recent.length);
  return <div className="status-bars-wrap"><div className="status-bars" role="img" aria-label={isThai ? `ประวัติ uptime 90 วัน` : `90-day uptime history`}>
    {Array.from({ length: missing }, (_, index) => <span key={`empty-${index}`} className="status-bar unknown" />)}
    {recent.map((sample, index) => <span key={index} className={`status-bar ${sample.up === null ? 'unknown' : sample.up ? 'up' : 'down'}`} title={`${new Date(sample.ts).toLocaleString(isThai ? 'th-TH' : 'en-US')} · ${sample.up ? (isThai ? 'ทำงานปกติ' : 'Operational') : (isThai ? 'ออฟไลน์' : 'Offline')}`} />)}
  </div><div className="status-bars-labels"><span>{isThai ? '90 วันที่แล้ว' : '90 days ago'}</span><span>{isThai ? 'วันนี้' : 'Today'}</span></div></div>;
}

function PlayerChart({ metrics, range, isThai }: { metrics: Metric[]; range: Range; isThai: boolean }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const now = Date.now();
  const cutoff = now - ({ day: 1, week: 7, month: 30 }[range] * 86400000);
  const visible = metrics.filter(point => Number.isFinite(Date.parse(point.ts)) && Date.parse(point.ts) >= cutoff && Date.parse(point.ts) <= now && Number.isFinite(point.players)).sort((a, b) => Date.parse(a.ts) - Date.parse(b.ts));
  const chartValues = visible.length > 240 ? Array.from({ length: 240 }, (_, index) => visible[Math.round(index * (visible.length - 1) / 239)]) : visible;
  const maximum = Math.max(4, Math.ceil(chartValues.reduce((max, item) => Math.max(max, item.players), 0) / 4) * 4);
  const first = chartValues.length ? Date.parse(chartValues[0].ts) : now;
  const last = chartValues.length ? Date.parse(chartValues[chartValues.length - 1].ts) : now;
  const points = chartValues.map(item => ({ x: last === first ? 450 : (Date.parse(item.ts) - first) / (last - first) * 900, y: 108 - item.players / maximum * 98 }));
  const hovered = hoveredIndex === null ? null : chartValues[hoveredIndex] ?? null;
  const hoverPoint = hoveredIndex === null ? null : points[hoveredIndex] ?? null;
  const updateHover = (event: MouseEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width || !points.length) return;
    const x = ((event.clientX - bounds.left) / bounds.width) * 900;
    let nearest = 0;
    for (let index = 1; index < points.length; index += 1) {
      if (Math.abs(points[index].x - x) < Math.abs(points[nearest].x - x)) nearest = index;
    }
    setHoveredIndex(nearest);
  };
  const format = (value: number) => new Date(value).toLocaleString(isThai ? 'th-TH' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const areaPath = points.length ? `${linePath} L ${points[points.length - 1].x} 108 L ${points[0].x} 108 Z` : '';
  return <div className="metrics-chart">
    {visible.length > 0 ? <><div className="chart-overview"><strong>2b2t</strong><span>~ {chartValues[chartValues.length - 1].players.toLocaleString()} {isThai ? 'ผู้เล่น' : 'players'}</span></div><svg viewBox="0 0 900 110" preserveAspectRatio="none" role="img" onMouseMove={updateHover} onMouseLeave={() => setHoveredIndex(null)} aria-label={isThai ? `กราฟผู้เล่น ${visible.length} จุดข้อมูล` : `Player history, ${visible.length} samples`}>
      <defs><linearGradient id="player-area-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#9ba3b2" stopOpacity=".18" /><stop offset="100%" stopColor="#9ba3b2" stopOpacity=".015" /></linearGradient></defs>
      <path d={areaPath} className="chart-area" />
      <polyline points={points.map(point => `${point.x},${point.y}`).join(' ')} className="chart-line chart-line-primary" />
      {hoverPoint && hovered && <><line x1={hoverPoint.x} y1="5" x2={hoverPoint.x} y2="108" className="chart-crosshair" /><circle cx={hoverPoint.x} cy={hoverPoint.y} r="4.5" className="chart-hover-point" /><g className="chart-tooltip" transform={`translate(${Math.max(4, Math.min(732, hoverPoint.x + 12))} ${Math.max(8, hoverPoint.y - 43)})`}><rect width="164" height="66" rx="7" /><text x="14" y="25">{format(Date.parse(hovered.ts))}</text><circle cx="18" cy="48" r="3.5" /><text x="31" y="52">{`${hovered.players.toLocaleString()} ${isThai ? 'ผู้เล่น' : 'players'}`}</text></g></>}
      {points.length === 1 && <circle cx={points[0].x} cy={points[0].y} r="3" fill="#19b96b" />}
    </svg><div className="chart-labels"><span>{format(first)}</span><span>{last !== first ? format(last) : ''}</span></div></> : <div className="chart-no-data">{isThai ? 'ยังไม่มีข้อมูลผู้เล่นในช่วงเวลานี้' : 'No player data for this period'}</div>}
  </div>;
}

export default function StatusPage({ lang }: { lang: 'en' | 'th' }) {
  const isThai = lang === 'th';
  const t = (th: string, en: string) => isThai ? th : en;
  const [range, setRange] = useState<Range>('day');
  const [data, setData] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let mounted = true;
    let timer: number;
    const controller = new AbortController();
    const check = async () => {
      setLoading(true);
      const timeout = window.setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch('/api/status?format=legacy', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error('Status unavailable');
        const result: Status = await response.json();
        if (!result.services || !Array.isArray(result.metrics) || !Number.isFinite(Date.parse(result.checkedAt))) throw new Error('Invalid status');
        if (mounted) { setData(result); setFailed(false); }
      } catch {
        if (mounted) setFailed(true);
      } finally {
        window.clearTimeout(timeout);
        if (mounted) {
          setLoading(false);
          timer = window.setTimeout(() => setRefresh(value => value + 1), 60000);
        }
      }
    };
    void check();
    return () => { mounted = false; controller.abort(); window.clearTimeout(timer); };
  }, [refresh]);

  const monitored = Object.values<Service>(data?.services ?? {}).filter(service => service.configured);
  const down = monitored.some(service => service.up === false);
  const healthy = monitored.length > 0 && monitored.every(service => service.up === true);
  const state = failed || !data ? 'unknown' : down ? 'down' : healthy ? 'up' : 'unknown';
  const SummaryIcon = state === 'up' ? CheckCircle2 : state === 'down' || failed ? AlertCircle : Activity;
  const summary = failed ? t('ไม่สามารถอัปเดตสถานะได้', 'Unable to update status') : !data ? t('กำลังตรวจสอบสถานะระบบ', 'Checking system status') : down ? t('บางบริการขัดข้อง', 'Some services are offline') : healthy ? t('บริการที่ตรวจสอบทำงานปกติ', 'Monitored services are operational') : t('ยังยืนยันสถานะบางบริการไม่ได้', 'Some service statuses are unknown');
  const groups = [
    { name: 'Minecraft', items: [{ id: 'minecraft', name: t('เซิร์ฟเวอร์หลัก', 'Main server') }, { id: 'queue', name: t('ระบบคิว', 'Queue') }] },
    { name: t('เว็บไซต์และร้านค้า', 'Website & shop'), items: [{ id: 'website', name: t('เว็บไซต์', 'Website') }, { id: 'shop', name: t('ร้านค้า', 'Shop') }] },
  ];

  return <div className="status-page">
    <header className="status-header"><div className="status-container status-header-inner"><Link to={`/${lang}`} className="status-brand"><img src={logoImage} alt="2b2t-th" /></Link><div className="status-header-actions"><nav className="status-nav" aria-label={t('เมนูสถานะระบบ', 'Status navigation')}><Link to={`/${lang}`}>{t('หน้าหลัก', 'Home')}</Link><Link to={`/${lang}/updates`}>{t('อัปเดต', 'Updates')}</Link><Link className="active" aria-current="page" to={`/${lang}/status`}>{t('สถานะระบบ', 'Status')}</Link></nav><div className="language-switch" aria-label="Language"><Link className={isThai ? 'selected' : ''} to={`/th/status`} lang="th" aria-current={isThai ? 'page' : undefined}>ไทย</Link><span>/</span><Link className={!isThai ? 'selected' : ''} to={`/en/status`} lang="en" aria-current={!isThai ? 'page' : undefined}>ENG</Link></div></div></div></header>
    <main className="status-container status-main">
      <div className="status-heading"><div><h1>{t('สถานะระบบ', 'System status')}</h1><p>{t('ติดตามความพร้อมใช้งานของ 2b2t-th', 'Service availability across 2b2t-th')}</p></div><button className="status-refresh" disabled={loading} onClick={() => setRefresh(value => value + 1)}><RefreshCw size={16} />{loading ? t('กำลังตรวจสอบ', 'Checking') : t('รีเฟรชสถานะ', 'Refresh status')}</button></div>
      <div className={`status-overall status-overall-${state}`} role="status" aria-live="polite"><SummaryIcon size={28} /><div><strong>{summary}</strong><p>{failed ? data ? t('แสดงข้อมูลจากการตรวจสอบครั้งก่อน กดลองใหม่เพื่ออัปเดต', 'Showing the last successful check. Retry to update.') : t('ดึงข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', 'Could not retrieve status. Please try again.') : t('ตรวจสอบอัตโนมัติทุก 60 วินาที', 'Automatically checks every 60 seconds')}</p></div>{failed && <button className="status-refresh" disabled={loading} onClick={() => setRefresh(value => value + 1)}>{t('ลองใหม่', 'Retry')}</button>}</div>
      {groups.map(group => <section className="status-group" key={group.name}><h2><span className="status-group-title"><CircleChevronDown size={16} />{group.name}</span></h2>{group.items.map(service => {
        const item = data?.services[service.id];
        const serviceState = !item?.configured || item.up == null ? 'unknown' : item.up ? 'up' : 'down';
        const label = item?.configured === false ? t('ยังไม่เปิดตรวจสอบ', 'Not monitored') : serviceState === 'unknown' ? t('ไม่มีข้อมูล', 'Unknown') : serviceState === 'up' ? t('ทำงานปกติ', 'Operational') : t('ออฟไลน์', 'Offline');
        return <div className="status-row" key={service.id}><div className="status-row-main"><div className="status-service-name"><span className={`status-operational ${serviceState}`} aria-label={`${service.name}: ${label}`} title={label}><i />{service.name}</span>{item?.derived && <small>{t('อ้างอิงสถานะเซิร์ฟเวอร์', 'Based on server status')}</small>}</div><div className="status-service-meta"><span className="status-uptime">{item?.uptime != null ? `${item.uptime.toFixed(1)}% ${t('uptime', 'uptime')}` : '—'}</span></div></div><History history={item?.history ?? []} isThai={isThai} /></div>;
      })}</section>)}
      <section className="status-panel metrics-panel"><div className="panel-title"><h2>{t('ตัวชี้วัดระบบ', 'System metrics')}</h2><div className="range-tabs" role="group" aria-label={t('ช่วงเวลาของกราฟ', 'Chart period')}>{(['month', 'week', 'day'] as const).map(value => <button key={value} aria-pressed={range === value} className={range === value ? 'selected' : ''} onClick={() => setRange(value)}>{t(value === 'month' ? 'เดือน' : value === 'week' ? 'สัปดาห์' : 'วัน', value)}</button>)}</div></div><PlayerChart metrics={data?.metrics ?? []} range={range} isThai={isThai} /></section>
      <p className="status-history-note">{t('กราฟแสดงเฉพาะข้อมูลที่มีการบันทึกไว้ในช่วงเวลาที่เลือก', 'The chart only shows available samples within the selected period.')}</p>
    </main><footer className="status-container status-footer"><span>© 2026 2b2t-th Thailand Community</span><span>{data ? `${t('ตรวจล่าสุด', 'Last checked')} ${new Date(data.checkedAt).toLocaleString(isThai ? 'th-TH' : 'en-US')}` : t('ยังไม่มีผลการตรวจสอบ', 'No check results yet')}</span><Link to={`/${isThai ? 'en' : 'th'}/status`} lang={isThai ? 'en' : 'th'}>{isThai ? 'English' : 'ภาษาไทย'}</Link></footer>
  </div>;
}
