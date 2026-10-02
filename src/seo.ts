export type SeoLanguage = 'th' | 'en';

export type SeoCopy = {
  title: string;
  description: string;
};

type RouteSeo = Record<SeoLanguage, SeoCopy>;

export const canonicalOrigin = 'https://www.2b2t-th.org';
export const statusOrigin = 'https://status.2b2t-th.org';

export const routeSeo: Record<string, RouteSeo> = {
  '/': {
    th: {
      title: '2b2t Thailand - เซิร์ฟเวอร์ Minecraft Anarchy ประเทศไทย | 2b2t-th.org',
      description: '2b2t Thailand คือเซิร์ฟเวอร์ Minecraft Anarchy ที่รองรับ Java Edition และ Bedrock Edition ใช้ IP 2b2t-th.org และมีโลกที่ไม่รีเซ็ต',
    },
    en: {
      title: '2b2t Thailand - Minecraft Anarchy Server | 2b2t-th.org',
      description: 'Join 2b2t Thailand, a persistent Minecraft anarchy server for Java Edition and Bedrock Edition at 2b2t-th.org.',
    },
  },
  '/mods': {
    th: {
      title: 'การปรับแต่ง 2b2t Thailand | 2b2t-th.org',
      description: 'อ่านรายละเอียดซอฟต์แวร์ ระบบการเล่น และการปรับแต่งต่าง ๆ ของเซิร์ฟเวอร์ 2b2t Thailand',
    },
    en: {
      title: '2b2t Thailand Server Modifications | 2b2t-th.org',
      description: 'Learn about the server software, gameplay systems, and modifications used by 2b2t Thailand.',
    },
  },
  '/commands': {
    th: {
      title: 'คำสั่ง 2b2t Thailand | 2b2t-th.org',
      description: 'ดูคำสั่งแชทของ 2b2t Thailand พร้อมวิธีสมัครและเข้าสู่ระบบ การส่งข้อความส่วนตัว การตั้งค่าแชท และคำสั่งอื่น ๆ',
    },
    en: {
      title: '2b2t Thailand Commands | 2b2t-th.org',
      description: 'Browse 2b2t Thailand chat commands for account login, private messages, chat settings, and other server features.',
    },
  },
  '/terms': {
    th: {
      title: 'กฎและข้อกำหนด 2b2t Thailand | 2b2t-th.org',
      description: 'ข้อกำหนดของ 2b2t Thailand ครอบคลุมแนวทางการเล่น ความประพฤตินอกเกม ความเสถียรเซิร์ฟเวอร์ ชุมชน และการรายงาน',
    },
    en: {
      title: '2b2t Thailand Rules and Terms | 2b2t-th.org',
      description: 'Review 2b2t Thailand guidance for gameplay, conduct outside the game, server stability, community content, and reporting.',
    },
  },
  '/about': {
    th: {
      title: 'เกี่ยวกับ 2b2t Thailand | 2b2t-th.org',
      description: 'รู้จัก 2b2t Thailand เซิร์ฟเวอร์ Minecraft Anarchy ที่เปิดให้บริการวันที่ 10 เมษายน 2026 รองรับ Java Edition และ Bedrock Edition',
    },
    en: {
      title: 'About 2b2t Thailand | 2b2t-th.org',
      description: 'Learn about 2b2t Thailand, a Minecraft anarchy server opened on April 10, 2026, with Java Edition and Bedrock Edition support.',
    },
  },
  '/contact': {
    th: {
      title: 'ติดต่อ 2b2t Thailand | 2b2t-th.org',
      description: 'ช่องทางติดต่อทีมงาน 2b2t Thailand เพื่อสอบถาม แจ้งปัญหา หรือส่งรายงานเกี่ยวกับเซิร์ฟเวอร์และชุมชน',
    },
    en: {
      title: 'Contact 2b2t Thailand | 2b2t-th.org',
      description: 'Contact the 2b2t Thailand team with questions, server issues, or reports about the server and community.',
    },
  },
  '/updates': {
    th: {
      title: 'ข่าวสารและอัปเดต 2b2t Thailand | 2b2t-th.org',
      description: 'ติดตามข่าวสารและบันทึกการอัปเดตล่าสุดของเซิร์ฟเวอร์ 2b2t Thailand',
    },
    en: {
      title: '2b2t Thailand News and Updates | 2b2t-th.org',
      description: 'Read the latest news and update log for the 2b2t Thailand Minecraft server.',
    },
  },
  '/partner': {
    th: {
      title: 'พันธมิตรและชุมชน 2b2t Thailand | 2b2t-th.org',
      description: 'ข้อมูลชุมชนพันธมิตรและช่องทางประสานงานของ 2b2t Thailand',
    },
    en: {
      title: '2b2t Thailand Partners and Community | 2b2t-th.org',
      description: 'Find partner community information and coordination links for 2b2t Thailand.',
    },
  },
};

export const statusSeo: Record<SeoLanguage, SeoCopy> = {
  th: {
    title: 'สถานะระบบ 2b2t Thailand | status.2b2t-th.org',
    description: 'ตรวจสอบสถานะเซิร์ฟเวอร์ Minecraft และบริการต่าง ๆ ของ 2b2t Thailand',
  },
  en: {
    title: '2b2t Thailand System Status | status.2b2t-th.org',
    description: 'Check the current status of the 2b2t Thailand Minecraft server and related services.',
  },
};

export function getSeoMetadata(pathname: string, lang: SeoLanguage, isStatusHost: boolean) {
  const isStatusPage = isStatusHost || pathname === '/status';
  const canonical = isStatusPage
    ? `${statusOrigin}/`
    : `${canonicalOrigin}${pathname === '/' ? '/' : pathname}`;

  return {
    ...(isStatusPage ? statusSeo[lang] : (routeSeo[pathname] ?? routeSeo['/'])[lang]),
    canonical,
  };
}
