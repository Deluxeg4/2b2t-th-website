import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertCircle, CheckCircle2, Globe2, RefreshCw, Server } from 'lucide-react';
import logoImage from './assets/server-logo.png?url';

type Sample = { ts: string; up: boolean };
type Metric = { ts: string; players: number };
type Service = { configured: boolean; up: boolean | null; uptime: number | null; players?: number | null; history: Sample[]; derived?: boolean };
type Status = { checkedAt: string; services: Record<string, Service>; metrics: Metric[] };
type Range = 'day' | 'week' | 'month';

function History({ history, isThai }: { history: Sample[]; isThai: boolean }) {
  const recent = history.slice(-60);
  return <div className="status-bars" aria-label={isThai ? `ประวัติ ${recent.length} ครั้งล่าสุด` : `Last ${recent.length} checks`}>
    {Array.from({ length: 60 - recent.length }, (_, index) => <span key={`empty-${index}`} className="status-bar unknown" />)}
    {recent.map((sample, index) => <span key={index} className={`status-bar ${sample.up ? 'up' : 'down'}`} title={`${new Date(sample.ts).toLocaleString(isThai ? 'th-TH' : 'en-US')} · ${sample.up ? (isThai ? 'ทำงานปกติ' : 'Operational') : (isThai ? 'ออฟไลน์' : 'Offline')}`} />)}
  </div>;
}

function PlayerChart({ metrics, range, isThai }: { metrics: Metric[]; range: Range; isThai: boolean }) {
  const now = Date.now();
  const cutoff = now - ({ day: 1, week: 7, month: 30 }[range] * 86400000);
  const visible = metrics.filter(point => Date.parse(point.ts) >= cutoff && Date.parse(point.ts) <= now && Number.isFinite(point.players)).sort((a, b) => Date.parse(a.ts) - Date.parse(b.ts));
  const maximum = Math.max(4, Math.ceil(visible.reduce((max, item) => Math.max(max, item.players), 0) / 4) * 4);
  const first = visible.length ? Date.parse(visible[0].ts) : now;
  const last = visible.length ? Date.parse(visible[visible.length - 1].ts) : now;
  const points = visible.map(item => ({ x: last === first ? 450 : (Date.parse(item.ts) - first) / (last - first) * 900, y: 108 - item.players / maximum * 98 }));
  const format = (value: number) => new Date(value).toLocaleString(isThai ? 'th-TH' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  return <div className="metrics-chart">
    {visible.length > 0 ? <><div className="chart-scale">{[1, .75, .5, .25, 0].map(ratio => <span key={ratio}>{maximum * ratio}</span>)}</div><svg viewBox="0 0 900 110" preserveAspectRatio="none" role="img" aria-label={isThai ? `กราฟผู้เล่น ${visible.length} จุดข้อมูล` : `Player history, ${visible.length} samples`}>
      {[10, 35, 60, 85, 108].map(y => <line key={y} x1="0" y1={y} x2="900" y2={y} className="chart-grid" />)}
      <polyline points={points.map(point => `${point.x},${point.y}`).join(' ')} className="chart-line chart-line-primary" />
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
        const response = await fetch('/api/status', { cache: 'no-store', signal: controller.signal });
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
    { name: 'Minecraft', icon: <Server size={20} />, items: [{ id: 'minecraft', name: 'Minecraft Server' }, { id: 'queue', name: t('ระบบคิว', 'Queue') }] },
    { name: t('เว็บไซต์และร้านค้า', 'Website & shop'), icon: <Globe2 size={20} />, items: [{ id: 'website', name: t('เว็บไซต์', 'Website') }, { id: 'shop', name: t('ร้านค้า', 'Shop') }] },
  ];

  return <div className="status-page">
    <header className="status-header"><div className="status-container status-header-inner"><Link to={`/${lang}`} className="status-brand"><img src={logoImage} alt="2b2t-th" /></Link><div className="status-header-actions"><nav className="status-nav" aria-label={t('เมนูสถานะระบบ', 'Status navigation')}><Link to={`/${lang}`}>{t('หน้าหลัก', 'Home')}</Link><Link to={`/${lang}/updates`}>{t('อัปเดต', 'Updates')}</Link><Link className="active" aria-current="page" to={`/${lang}/status`}>{t('สถานะระบบ', 'Status')}</Link></nav><div className="language-switch" aria-label="Language"><Link className={isThai ? 'selected' : ''} to={`/th/status`} lang="th" aria-current={isThai ? 'page' : undefined}>ไทย</Link><span>/</span><Link className={!isThai ? 'selected' : ''} to={`/en/status`} lang="en" aria-current={!isThai ? 'page' : undefined}>ENG</Link></div></div></div></header>
    <main className="status-container status-main">
      <div className="status-heading"><div><h1>{t('สถานะระบบ', 'System status')}</h1><p>{t('ติดตามความพร้อมใช้งานของ 2b2t-th', 'Service availability across 2b2t-th')}</p></div><button className="status-refresh" disabled={loading} onClick={() => setRefresh(value => value + 1)}><RefreshCw size={16} />{loading ? t('กำลังตรวจสอบ', 'Checking') : t('รีเฟรชสถานะ', 'Refresh status')}</button></div>
      <div className={`status-overall status-overall-${state}`} role="status" aria-live="polite"><SummaryIcon size={28} /><div><strong>{summary}</strong><p>{failed ? data ? t('แสดงข้อมูลจากการตรวจสอบครั้งก่อน กดลองใหม่เพื่ออัปเดต', 'Showing the last successful check. Retry to update.') : t('ดึงข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', 'Could not retrieve status. Please try again.') : t('ตรวจสอบอัตโนมัติทุก 60 วินาที', 'Automatically checks every 60 seconds')}</p></div>{failed && <button className="status-refresh" disabled={loading} onClick={() => setRefresh(value => value + 1)}>{t('ลองใหม่', 'Retry')}</button>}</div>
      <div className="status-table-summary">{t('บริการที่กำลังติดตาม', 'Monitored services')} <strong>{groups.reduce((total, group) => total + group.items.length, 0)}</strong> {t('รายการ', 'services')}</div>
      {groups.map(group => <section className="status-group" key={group.name}><h2>{group.icon}{group.name}</h2><div className="status-table-head"><span>{t('บริการ', 'Service')}</span><span>{t('สถานะ', 'Status')}</span><span>{t('ข้อมูลล่าสุด', 'Latest data')}</span></div>{group.items.map(service => {
        const item = data?.services[service.id];
        const serviceState = !item?.configured || item.up == null ? 'unknown' : item.up ? 'up' : 'down';
        const label = item?.configured === false ? t('ยังไม่เปิดตรวจสอบ', 'Not monitored') : serviceState === 'unknown' ? t('ไม่มีข้อมูล', 'Unknown') : serviceState === 'up' ? t('ทำงานปกติ', 'Operational') : t('ออฟไลน์', 'Offline');
        return <div className="status-row" key={service.id}><div className="status-row-main"><div className="status-service-name"><strong>{service.name}</strong>{item?.derived && <small>{t('อ้างอิงสถานะเซิร์ฟเวอร์', 'Based on server status')}</small>}</div><div className="status-service-meta"><span className={`status-operational ${serviceState}`}><i />{label}</span><span className="status-uptime">{service.id === 'minecraft' && item?.players != null ? `${item.players.toLocaleString()} ${t('ผู้เล่น', 'players')}` : item?.uptime != null ? `${item.uptime}% ${t('พร้อมใช้งาน', 'uptime')}` : '—'}</span></div></div><div className="status-row-history"><strong>{service.name}</strong><span>{t('ประวัติ 60 ครั้งล่าสุด', 'Last 60 checks')}</span><History history={item?.history ?? []} isThai={isThai} /></div></div>;
      })}</section>)}
      <div className="status-history-key"><span><i className="up" />{t('ปกติ', 'Operational')}</span><span><i className="down" />{t('ขัดข้อง', 'Offline')}</span><span><i className="unknown" />{t('ไม่มีข้อมูล', 'No data')}</span><p>{t('แต่ละแท่งแทนการตรวจสอบหนึ่งครั้ง', 'Each bar represents one check')}</p></div>
      <section className="status-panel metrics-panel"><div className="panel-title"><h2>{t('จำนวนผู้เล่น', 'Player activity')}</h2><span><Activity size={16} />{data?.services.minecraft?.players == null ? '—' : `${data.services.minecraft.players.toLocaleString()} ${t('ผู้เล่นล่าสุด', 'players at last check')}`}</span></div><div className="range-tabs" role="group" aria-label={t('ช่วงเวลาของกราฟ', 'Chart period')}>{(['day', 'week', 'month'] as const).map(value => <button key={value} aria-pressed={range === value} className={range === value ? 'selected' : ''} onClick={() => setRange(value)}>{value === 'day' ? t('24 ชั่วโมง', '24 hours') : value === 'week' ? t('7 วัน', '7 days') : t('30 วัน', '30 days')}</button>)}</div><div className="chart-legend"><span className="legend-primary" />{t('จำนวนผู้เล่นจากข้อมูลที่บันทึกไว้', 'Players from recorded checks')}</div><PlayerChart metrics={data?.metrics ?? []} range={range} isThai={isThai} /></section>
      <p className="status-history-note">{t('กราฟแสดงเฉพาะข้อมูลที่มีการบันทึกไว้ในช่วงเวลาที่เลือก', 'The chart only shows available samples within the selected period.')}</p>
    </main><footer className="status-container status-footer"><span>© 2026 2b2t-th Thailand Community</span><span>{data ? `${t('ตรวจล่าสุด', 'Last checked')} ${new Date(data.checkedAt).toLocaleString(isThai ? 'th-TH' : 'en-US')}` : t('ยังไม่มีผลการตรวจสอบ', 'No check results yet')}</span><Link to={`/${isThai ? 'en' : 'th'}/status`} lang={isThai ? 'en' : 'th'}>{isThai ? 'English' : 'ภาษาไทย'}</Link></footer>
  </div>;
}
