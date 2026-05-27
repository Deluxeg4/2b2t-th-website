import { motion } from 'motion/react';
import { 
  Code2, 
  Layers, 
  Terminal, 
  Boxes, 
  MessageSquare, 
  ArrowRight,
  Cpu,
  ExternalLink
} from 'lucide-react';

const SERVICES = [
  {
    icon: <Code2 className="w-6 h-6" />,
    title: 'Custom Plugin',
    titleTh: 'พัฒนาและแก้ไขปลั๊กอิน',
    price: '100฿ +',
    desc: 'Folia optimization, version updates, and custom forks tailored to your needs.',
    descTh: 'รองรับ Folia, การอัปเดตเวอร์ชัน และการ Fork ปลั๊กอินเพื่อปรับแต่งฟีเจอร์เฉพาะตัว'
  },
  {
    icon: <Terminal className="w-6 h-6" />,
    title: 'Basic Server Setup',
    titleTh: 'ตั้งค่าเซิร์ฟเวอร์พื้นฐาน',
    price: '50฿ +',
    desc: 'Perfect for Survival with your friends. Optimized and ready to play.',
    descTh: 'เหมาะสำหรับกลุ่มเพื่อน เล่น Survival ร่วมกัน การตั้งค่าที่เสถียรและพร้อมใช้งานทันที'
  },
  {
    icon: <Cpu className="w-6 h-6" />,
    title: 'Medium Scale Setup',
    titleTh: 'เซิร์ฟเวอร์ขนาดกลาง (10-20 Players)',
    price: '100฿ +',
    desc: 'Performance-optimized configuration for growing player bases.',
    descTh: 'การปรับจูนประสิทธิภาพระดับสูง รองรับผู้เล่น 10-20 คน ได้อย่างลื่นไหล'
  },
  {
    icon: <Layers className="w-6 h-6" />,
    title: 'Proxy Server Setup',
    titleTh: 'วางระบบ Proxy (Multiple Servers)',
    price: '300฿ +',
    desc: 'BungeeCord or Velocity integration for seamless server networking.',
    descTh: 'เชื่อมต่อหลายเซิร์ฟเวอร์เข้าด้วยกันด้วย BungeeCord หรือ Velocity อย่างเป็นระบบ'
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'Server Consulting',
    titleTh: 'ปรึกษาการตั้งค่าเซิร์ฟเวอร์',
    price: 'Free',
    desc: 'Expert guidance on architecture, plugins, and overall server health.',
    descTh: 'รับปรึกษาและวางแผนผังระบบเซิร์ฟเวอร์ ปลั๊กอิน และการดูแลรักษาเชิงรุก'
  },
  {
    icon: <Boxes className="w-6 h-6" />,
    title: 'Network Infrastructure',
    titleTh: 'วางโครงสร้างเครือข่ายและความปลอดภัย',
    price: '100฿ +',
    desc: 'Complete network setup with focus on protection and uptime.',
    descTh: 'จัดการระบบ Network พร้อมระบบป้องกันการโจมตี (DDoS Protection) และป้องกันเซิร์ฟเวอร์ล่ม'
  },
  {
    icon: <Terminal className="w-6 h-6" />,
    title: 'Switch To Linux Setup',
    titleTh: 'ย้ายระบบและตั้งค่าบน Linux',
    price: '100฿ +',
    desc: 'Professional migration for maximum performance and stability.',
    descTh: 'การันตี Performance Upgrade 25-50% พร้อมการปรับจูน OS ให้ลื่นไหลที่สุด'
  }
];

export default function App() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="/Gemini_Generated_Image_mql5dwmql5dwmql5-Photoroom.png" 
              alt="CADS Logo" 
              className="w-10 h-10 object-contain"
            />
            <span className="font-mono text-xl font-bold tracking-tighter text-zinc-900 border-b-2 border-zinc-900">CADS.</span>
          </div>
          <div className="flex items-center gap-10 text-sm font-medium text-zinc-500">
            <a href="#services" className="hover:text-zinc-900 transition-colors">Services</a>
            <a href="https://discord.gg/xtVgj52nN6" target="_blank" rel="noreferrer" className="btn-primary py-2 px-6 text-sm rounded-full flex items-center gap-2">
              Contact <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-48 pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-12">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-zinc-900/5 blur-3xl rounded-full" />
                <img 
                  src="/Gemini_Generated_Image_mql5dwmql5dwmql5-Photoroom.png" 
                  alt="CADS Studio Logo" 
                  className="w-32 h-32 md:w-48 md:h-48 object-contain relative z-10"
                />
              </motion.div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-zinc-900 mb-8">
              Reliable <span className="text-zinc-400 italic">Server</span> Engineering.
            </h1>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto mb-12 leading-relaxed">
              CADS Studio มอบโซลูชันระดับโปรสำหรับ Minecraft Server ด้วยความเชี่ยวชาญด้านโครงสร้างระบบและประสิทธิภาพขั้นสูง
            </p>
            <div className="flex justify-center">
              <a href="https://discord.gg/xtVgj52nN6" target="_blank" rel="noreferrer" className="btn-primary rounded-full group px-8 py-4">
                ติดต่อสอบถามผ่าน Discord <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-32 px-6 bg-white border-y border-zinc-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-16">
            <div className="lg:col-span-1">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4 block">Our Expertise</span>
              <h2 className="text-4xl font-bold text-zinc-900 mb-6">บริการของ CADS</h2>
              <p className="text-zinc-500 mb-8 leading-relaxed">
                เราเน้นความเป็นระเบียบ ความเสถียร และประสิทธิภาพสูงสุด เพื่อให้เซิร์ฟเวอร์ของคุณเติบโตได้อย่างมั่นคง
              </p>
            </div>
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-8">
              {SERVICES.map((service, i) => (
                <div key={i} className="card-hover flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-900 border border-zinc-100">
                      {service.icon}
                    </div>
                    <span className="text-sm font-mono font-bold text-zinc-900 bg-zinc-100 px-3 py-1 rounded-full">
                      {service.price}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{service.title}</h3>
                  <p className="text-sm font-medium text-zinc-400 mb-4">{service.titleTh}</p>
                  <p className="text-zinc-500 text-sm leading-relaxed mb-4 flex-grow">{service.desc}</p>
                  <div className="pt-4 border-t border-zinc-50">
                    <p className="text-zinc-400 text-xs italic">{service.descTh}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Simple */}
      <section id="contact" className="py-32 px-6 bg-zinc-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">
            Let's Talk.
          </h2>
          <p className="text-zinc-400 text-lg mb-12">
            ยินดีให้คำปรึกษาและวางแผนโปรเจกต์ – <span className="text-white">สามารถติดต่อสอบถามก่อนได้เลยครับ</span>
          </p>
          <a 
            href="https://discord.gg/xtVgj52nN6" 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-zinc-900 font-bold rounded-2xl hover:bg-zinc-200 transition-all text-xl"
          >
            Join our Discord <MessageSquare className="w-6 h-6" />
          </a>
          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img 
                src="/Gemini_Generated_Image_mql5dwmql5dwmql5-Photoroom.png" 
                alt="CADS Logo" 
                className="w-8 h-8 object-contain invert"
              />
              <span className="font-mono font-bold tracking-tighter">CADS.</span>
            </div>
            <p className="text-zinc-500 text-sm">© 2026 CADS Studio. Engineering Excellence.</p>
          </div>
        </div>
      </section>
    </div>
  );
}


