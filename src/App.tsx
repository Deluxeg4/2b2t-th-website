/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Users, Copy, Check, MessageSquare, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { translations } from './translations';
import logoImage from './assets/server-logo.png?url';

const gameplayImages = Object.values(
  import.meta.glob('../gameplay/*.{png,jpg,jpeg,webp}', {
    eager: true,
    import: 'default',
    query: '?url',
  })
) as string[];

function LinkifiedMessage({ text }: { text: string }) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return (
    <>
      {parts.map((part, index) =>
        part.startsWith('http://') || part.startsWith('https://') ? (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#f5c542] underline decoration-[#f5c542]/60 underline-offset-2 hover:text-[#ffd766]"
          >
            {part}
          </a>
        ) : (
          part
        )
      )}
    </>
  );
}

function getUpdateMessage(update: any, lang: 'en' | 'th') {
  return lang === 'en' && update.messageEn ? update.messageEn : update.message;
}



function GameplayCarousel() {
  const repeatCount = 21;
  const startIndex = gameplayImages.length * Math.floor(repeatCount / 2);
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const trackImages = Array.from({ length: gameplayImages.length * repeatCount }, (_, index) => {
    return gameplayImages[index % gameplayImages.length];
  });

  const scrollByImage = (direction: 'left' | 'right' = 'right') => {
    if (gameplayImages.length <= 1) return;

    const step = direction === 'left' ? -1 : 1;
    setCurrentIndex((index) => {
      const nextIndex = index + step;
      const minIndex = gameplayImages.length * 2;
      const maxIndex = gameplayImages.length * (repeatCount - 2);

      if (nextIndex <= minIndex) {
        return nextIndex + gameplayImages.length * Math.floor(repeatCount / 2);
      }

      if (nextIndex >= maxIndex) {
        return nextIndex - gameplayImages.length * Math.floor(repeatCount / 2);
      }

      return nextIndex;
    });
  };

  useEffect(() => {
    if (gameplayImages.length <= 1) return;

    const interval = window.setInterval(() => {
      scrollByImage('right');
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full bg-[#454545] rounded-sm shadow-lg p-4 text-white text-left">
      <button
        type="button"
        onClick={() => scrollByImage('left')}
        aria-label="Previous gameplay image"
        className="absolute left-6 top-1/2 z-10 -translate-y-1/2 w-11 h-11 rounded-sm bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
      >
        <ChevronLeft size={26} />
      </button>
      <button
        type="button"
        onClick={() => scrollByImage('right')}
        aria-label="Next gameplay image"
        className="absolute right-6 top-1/2 z-10 -translate-y-1/2 w-11 h-11 rounded-sm bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
      >
        <ChevronRight size={26} />
      </button>
      <div className="overflow-hidden rounded-sm">
        <div
          className="flex transition-transform duration-200 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {trackImages.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="shrink-0 w-full bg-[#353535] rounded-sm border border-[#555] overflow-hidden"
            >
              <img
                src={image}
                alt={`Gameplay screenshot ${index + 1}`}
                loading={index === 0 ? 'eager' : 'lazy'}
                draggable={false}
                className="w-full aspect-video object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Home({ lang, playerCount, handleCopyIp, copied, updates, loadingUpdates }: { lang: 'en' | 'th', playerCount: number | string, handleCopyIp: () => void, copied: boolean, updates: any[], loadingUpdates: boolean }) {
  const t = translations[lang].home;
  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full">
      {/* Left Side Area */}
      <div className="flex flex-col gap-4 w-full lg:flex-1">
        <GameplayCarousel />
        <div className="w-full h-full bg-[#454545] rounded-sm shadow-lg p-6 text-white text-left">
          <h3 className="text-xl font-bold tracking-wide mb-4">{t.newsUpdates}</h3>
          <div className="space-y-4">
            {loadingUpdates ? (
              <p className="text-gray-400">{t.loading}</p>
            ) : updates.length > 0 ? (
              updates.slice(0, 4).map((update, index) => (
                <div key={index} className="bg-[#353535] p-4 rounded-sm border border-[#555]">
                  <span className="text-sm text-gray-400">{update.date}</span>
                  <div className="text-sm text-gray-300 mt-2 whitespace-pre-wrap">
                    <LinkifiedMessage text={getUpdateMessage(update, lang)} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400">{t.noUpdates}</p>
            )}
          </div>
        </div>
      </div>

      {/* Right Side Area */}
      <div className="flex flex-col gap-4 w-full lg:w-[500px] shrink-0">
        <div className="w-full bg-[#454545] rounded-sm shadow-lg p-8 text-white text-left">
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl font-bold text-center tracking-wide">{t.title}</h2>
            <p className="text-gray-300 text-[17px] leading-relaxed">
              {t.description}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
              <div className="flex items-center gap-2 bg-[#353535] px-4 py-2 rounded-sm border border-[#555] w-full sm:w-auto mt-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                <Users size={18} className="text-gray-300" />
                <span className="font-medium tracking-wide whitespace-nowrap">{playerCount} {t.playingNow}</span>
              </div>
              <div className="relative group w-full sm:w-auto mt-2">
                <button
                  onClick={handleCopyIp}
                  className="flex items-center gap-2 bg-white text-black px-5 py-2 rounded-sm font-bold hover:bg-gray-200 transition-colors w-full justify-center"
                >
                  {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                  {t.copyIp}
                </button>
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1.5 px-3 rounded-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {copied ? t.copied : t.clickToCopy}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full bg-[#454545] rounded-sm shadow-lg p-6 text-white text-left">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#5865F2] p-2 rounded-sm">
              <MessageSquare size={20} className="text-white" />
            </div>
            <h3 className="text-xl font-bold tracking-wide">{t.discordCommunity}</h3>
          </div>
          <div className="w-full min-h-[500px] bg-[#36393f] rounded-sm border border-[#2c2f33] overflow-hidden">
            <iframe
              src="https://canary.discord.com/widget?id=1348603803162640414&theme=dark"
              width="100%"
              height="500"
              allowTransparency={true}
              frameBorder="0"
              sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}

function Updates({ lang, updates, loadingUpdates }: { lang: 'en' | 'th', updates: any[], loadingUpdates: boolean }) {
  const t = translations[lang].updates;
  return (
    <div className="w-full bg-[#454545] rounded-sm shadow-lg p-8 md:p-12 text-white text-left min-h-[500px]">
      <h2 className="text-3xl md:text-4xl font-bold tracking-wide">{t.title}</h2>
      <p className="text-gray-400 text-sm mt-2 mb-6 border-b border-[#555] pb-4">{t.logTitle}</p>
      <div className="flex flex-col gap-4 text-gray-300 text-[15px]">
        {loadingUpdates ? (
          <p className="text-gray-400">{t.loadingDiscord}</p>
        ) : updates.length > 0 ? (
          updates.map((update, index) => (
            <div key={index} className="bg-[#353535] p-5 rounded-sm border border-[#555]">
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-2">
                <span className="text-gray-500 text-sm">{update.date}</span>
              </div>
              <div className="whitespace-pre-wrap">
                <LinkifiedMessage text={getUpdateMessage(update, lang)} />
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">{t.noUpdatesChannel}</p>
        )}
      </div>
    </div>
  );
}

function Modifications({ lang }: { lang: 'en' | 'th' }) {
  const t = translations[lang].modifications;
  return (
    <div className="w-full bg-[#454545] rounded-sm shadow-lg p-8 md:p-12 text-white text-left min-h-[500px]">
      <h2 className="text-3xl md:text-4xl font-bold tracking-wide">{t.title}</h2>
      <p className="text-gray-400 text-sm mt-2 mb-6 border-b border-[#555] pb-4">{t.lastEdit}</p>
      <div className="text-gray-300 text-[17px] leading-relaxed flex flex-col gap-6">
        <p>
          {t.softwareDesc}
          <a href="https://github.com/PaperMC/Folia" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{t.here}</a>.
        </p>
        <p>
          {t.gamemodeDesc}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          {t.features.map((feature: any, index: number) => (
            <div key={index} className="bg-[#353535] p-5 rounded-sm border border-[#555]">
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-[15px] text-gray-300 whitespace-pre-line">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Commands({ lang }: { lang: 'en' | 'th' }) {
  const t = translations[lang].commands;
  return (
    <div className="w-full bg-[#454545] rounded-sm shadow-lg p-8 md:p-12 text-white text-left min-h-[500px]">
      <h2 className="text-3xl md:text-4xl font-bold tracking-wide">{t.title}</h2>
      <p className="text-gray-400 text-sm mt-2 mb-6 border-b border-[#555] pb-4">{t.lastEdit}</p>
      <div className="text-gray-300 text-[15px] leading-relaxed flex flex-col gap-6">
        <p className="text-[17px]">{t.desc}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
          <div className="bg-[#353535] p-5 rounded-sm border border-[#555]">
            <h3 className="text-xl font-bold text-white mb-3">{t.auth.title}</h3>
            <div className="space-y-4">
              <div>
                <code className="text-green-400 block bg-black/30 px-2 py-1 rounded mb-1">/reg [pw] [pw]</code>
                <code className="text-green-400 block bg-black/30 px-2 py-1 rounded mb-1">/register [pw] [pw]</code>
                <p className="text-sm text-gray-400">{t.auth.register}</p>
              </div>
              <div>
                <code className="text-green-400 block bg-black/30 px-2 py-1 rounded mb-1">/login [pw]</code>
                <code className="text-green-400 block bg-black/30 px-2 py-1 rounded mb-1">/l [pw]</code>
                <p className="text-sm text-gray-400">{t.auth.login}</p>
              </div>
              <div>
                <code className="text-green-400 block bg-black/30 px-2 py-1 rounded mb-1">/cp [old] [new]</code>
                <code className="text-green-400 block bg-black/30 px-2 py-1 rounded mb-1">/changepassword [old] [new]</code>
                <p className="text-sm text-gray-400">{t.auth.changePassword}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#353535] p-5 rounded-sm border border-[#555]">
            <h3 className="text-xl font-bold text-white mb-3">{t.pm.title}</h3>
            <div className="space-y-4">
              <div>
                <code className="text-green-400 block bg-black/30 px-2 py-1 rounded mb-1">/msg, /whisper, /pm, /w [name]</code>
                <p className="text-sm text-gray-400">{t.pm.send}</p>
              </div>
              <div>
                <code className="text-green-400 block bg-black/30 px-2 py-1 rounded mb-1">/r, /reply [message]</code>
                <p className="text-sm text-gray-400">{t.pm.reply}</p>
              </div>
              <div>
                <code className="text-green-400 block bg-black/30 px-2 py-1 rounded mb-1">/l, /last [message]</code>
                <p className="text-sm text-gray-400">{t.pm.last}</p>
              </div>
              <p className="text-xs text-yellow-500 mt-2 bg-yellow-500/10 p-2 rounded">{t.pm.warning}</p>
            </div>
          </div>
          <div className="bg-[#353535] p-5 rounded-sm border border-[#555]">
            <h3 className="text-xl font-bold text-white mb-3">{t.ignore.title}</h3>
            <div className="space-y-4">
              <div>
                <code className="text-green-400 block bg-black/30 px-2 py-1 rounded mb-1">/ignore [name]</code>
                <p className="text-sm text-gray-400">{t.ignore.temp}</p>
              </div>
              <div>
                <code className="text-green-400 block bg-black/30 px-2 py-1 rounded mb-1">/ignorehard [name]</code>
                <p className="text-sm text-gray-400">{t.ignore.hard}</p>
              </div>
              <div>
                <code className="text-green-400 block bg-black/30 px-2 py-1 rounded mb-1">/ignorelist</code>
                <p className="text-sm text-gray-400">{t.ignore.list}</p>
              </div>
              <div>
                <code className="text-green-400 block bg-black/30 px-2 py-1 rounded mb-1">/ignoredeathmsgs [name]</code>
                <p className="text-sm text-gray-400">{t.ignore.death}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServerStability({ lang }: { lang: 'en' | 'th' }) {
  const t = translations[lang].serverStability;
  return (
    <div className="w-full bg-[#454545] rounded-sm shadow-lg p-8 md:p-12 text-white text-left min-h-[500px]">
      <h2 className="text-3xl md:text-4xl font-bold tracking-wide">{t.title}</h2>
      <div className="text-gray-300 text-[17px] leading-relaxed flex flex-col gap-6 mt-6">
        <div className="bg-red-500/10 border-l-4 border-red-500 p-6 rounded-r-md">
          <h3 className="text-xl font-bold text-red-500 mb-2 flex items-center gap-2">{t.warning.title}</h3>
          <p className="mb-4">{t.warning.desc1}<strong className="text-white">{t.warning.desc1Bold}</strong></p>
          <p>{t.warning.desc2}</p>
        </div>
        <div className="bg-[#353535] p-6 rounded-sm border border-[#555]">
          <h3 className="text-xl font-bold text-white mb-4">{t.crimeAct.title}</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-red-400 mb-1">{t.crimeAct.section10.title}</h4>
              <p>{t.crimeAct.section10.desc}</p>
            </div>
            <div>
              <h4 className="font-bold text-red-400 mb-1">{t.crimeAct.section13.title}</h4>
              <p>{t.crimeAct.section13.desc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConnectionGuide({ lang }: { lang: 'en' | 'th' }) {
  const t = translations[lang].connectionGuide;
  return (
    <div className="w-full bg-[#454545] rounded-sm shadow-lg p-8 md:p-12 text-white text-left min-h-[500px]">
      <h2 className="text-3xl md:text-4xl font-bold tracking-wide">{t.title}</h2>
      <p className="text-gray-400 text-sm mt-2 mb-6 border-b border-[#555] pb-4">{t.subTitle}</p>
      <div className="flex flex-col gap-8">
        <div>
          <h3 className="text-2xl font-bold text-[#FFAA00] mb-6 flex items-center gap-2">
            <span className="bg-[#FFAA00]/20 p-2 rounded-sm border border-[#FFAA00]/50">{t.java}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#353535] rounded-sm border border-[#555] overflow-hidden flex flex-col">
              <div className="p-4 bg-[#2a2a2a] border-b border-[#555]"><h4 className="font-bold text-lg text-white">{t.step} 1</h4><p className="text-sm text-gray-400">{t.javaSteps.step1}</p></div>
              <div className="p-4 flex-1 flex items-center justify-center bg-[#1a1a1a]"><img src="/java-connect-multiplayer.jpg" alt="Step 1" className="max-w-full h-auto rounded shadow-sm object-contain" /></div>
            </div>
            <div className="bg-[#353535] rounded-sm border border-[#555] overflow-hidden flex flex-col">
              <div className="p-4 bg-[#2a2a2a] border-b border-[#555]"><h4 className="font-bold text-lg text-white">{t.step} 2</h4><p className="text-sm text-gray-400">{t.javaSteps.step2}</p></div>
              <div className="p-4 flex-1 flex items-center justify-center bg-[#1a1a1a]"><img src="/java-connect-add-server.png" alt="Step 2" className="max-w-full h-auto rounded shadow-sm object-contain" /></div>
            </div>
            <div className="bg-[#353535] rounded-sm border border-[#555] overflow-hidden flex flex-col">
              <div className="p-4 bg-[#2a2a2a] border-b border-[#555]"><h4 className="font-bold text-lg text-white">{t.step} 3</h4><p className="text-sm text-gray-400">{t.javaSteps.step3}</p></div>
              <div className="p-4 flex-1 flex items-center justify-center bg-[#1a1a1a]"><img src="/java-connect-enter-ip.png" alt="Step 3" className="max-w-full h-auto rounded shadow-sm object-contain" /></div>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-[#55FF55] mb-6 flex items-center gap-2">
            <span className="bg-[#55FF55]/20 p-2 rounded-sm border border-[#55FF55]/50">{t.bedrock}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#353535] rounded-sm border border-[#555] overflow-hidden flex flex-col">
              <div className="p-4 bg-[#2a2a2a] border-b border-[#555]"><h4 className="font-bold text-lg text-white">{t.step} 1</h4><p className="text-sm text-gray-400">{t.bedrockSteps.step1}</p></div>
              <div className="p-4 flex-1 flex items-center justify-center bg-[#1a1a1a]"><img src="/bedrock-connect-servers.png" alt="Bedrock Step 1" className="max-w-full h-auto rounded shadow-sm object-contain" /></div>
            </div>
            <div className="bg-[#353535] rounded-sm border border-[#555] overflow-hidden flex flex-col">
              <div className="p-4 bg-[#2a2a2a] border-b border-[#555]"><h4 className="font-bold text-lg text-white">{t.step} 2</h4><p className="text-sm text-gray-400">{t.bedrockSteps.step2}</p></div>
              <div className="p-4 flex-1 flex items-center justify-center bg-[#1a1a1a]"><img src="/bedrock-connect-add-server.png" alt="Bedrock Step 2" className="max-w-full h-auto rounded shadow-sm object-contain" /></div>
            </div>
            <div className="bg-[#353535] rounded-sm border border-[#555] overflow-hidden flex flex-col">
              <div className="p-4 bg-[#2a2a2a] border-b border-[#555]"><h4 className="font-bold text-lg text-white">{t.step} 3</h4><p className="text-sm text-gray-400">{t.bedrockSteps.step3}</p></div>
              <div className="p-4 flex-1 flex items-center justify-center bg-[#1a1a1a]"><img src="/bedrock-connect-enter-ip.png" alt="Bedrock Step 3" className="max-w-full h-auto rounded shadow-sm object-contain" /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function About({ lang }: { lang: 'en' | 'th' }) {
  const t = translations[lang].about;
  return (
    <div className="w-full bg-[#454545] rounded-sm shadow-lg p-8 md:p-12 text-white text-left min-h-[500px]">
      <h2 className="text-3xl md:text-4xl font-bold tracking-wide">{t.title}</h2>
      <div className="text-gray-300 text-[17px] leading-relaxed flex flex-col gap-6 mt-6">
        <p>{t.desc1}</p>
        <p>{t.desc2}</p>
        <p>{t.desc3}</p>
      </div>
      <div className="relative w-full h-[90px] mx-auto mt-8">
        <iframe
          title="NameMC 2b2t-th.org server banner"
          src="https://namemc.com/server/2b2t-th.org/embed"
          width="728"
          height="90"
          className="block w-full h-[90px] border-0 pointer-events-none"
        />
        <a
          href="https://namemc.com/server/2b2t-th.org"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open 2b2t-th.org on NameMC in a new tab"
          className="absolute inset-0"
        />
      </div>
    </div>
  );
}

function Partner({ lang }: { lang: 'en' | 'th' }) {
  const [showDiscordPopup, setShowDiscordPopup] = useState(false);
  const isThai = lang === 'th';
  const minecraftThMessageTh = `ตอนนี้ 2B2T Thailand ได้เข้าร่วมเป็น Partner กับ MINECRAFT TH แล้ว!

ศูนย์รวม Community Minecraft ของคนไทย
ทุกคนสามารถพูดคุย แลกเปลี่ยนข่าวสาร หาเพื่อนเล่น แชร์ผลงาน
โปรโมทเซิร์ฟเวอร์ และรวมตัวผู้เล่น Minecraft จากทั่วไทยไว้ในที่เดียว

ภายในเซิร์ฟเวอร์สามารถ:

พูดคุยข่าวสาร Minecraft ล่าสุด
แชร์ผลงานและโปรโมทเซิร์ฟเวอร์
หาเพื่อนเล่นและสร้าง Community
ร่วมกิจกรรมต่าง ๆ กับผู้เล่นคนไทย

ติดตามข่าวสารและข้อมูลเพิ่มเติม:
https://mc.in.th/

เข้าร่วม Discord:
https://discord.gg/mcth

มาเป็นส่วนหนึ่งของ Community Minecraft ไทยที่กำลังเติบโตไปด้วยกัน!`;
  const minecraftThMessageEn = `2B2T Thailand has officially partnered with MINECRAFT TH!

A central Minecraft community hub for Thai players.
Everyone can chat, exchange news, find friends to play with, share creations,
promote servers, and connect with Minecraft players from across Thailand in one place.

Inside the community, you can:

Talk about the latest Minecraft news
Share creations and promote servers
Find friends and build a community
Join activities with Thai Minecraft players

Follow news and more information:
https://mc.in.th/

Join Discord:
https://discord.gg/mcth

Be part of the growing Thai Minecraft community!`;
  const minecraftThMessage = isThai ? minecraftThMessageTh : minecraftThMessageEn;
  const cadsmcMessageTh = `CADSMC เป็น Partner ของ 2B2T Thailand

CADS Studio ให้บริการด้าน Minecraft Server ครบวงจร ตั้งแต่ Setup เซิร์ฟเวอร์ เขียน Plugin ทำเว็บไซต์ เชื่อมต่อ DDNS ตั้งค่า Firewall, Docker และดูแลระบบหลังบ้านสำหรับเซิร์ฟเวอร์ที่ต้องใช้งานจริง

ทีมมีประสบการณ์ในวงการ Minecraft มากกว่า 7 ปี ครอบคลุมงาน Server Infrastructure, Proxy Network, Java Plugin, Web, Linux และการปรับ Performance ให้เหมาะกับแนวเซิร์ฟเวอร์ เช่น SMP, Survival, Anarchy, DonutSMP หรือระบบ custom

สามารถติดต่อเพื่อเริ่มคุยโปรเจกต์ ขอคำปรึกษา หรือดูรายละเอียดบริการเพิ่มเติมได้ที่:
https://dev.2b2t-th.org/

Discord:
https://discord.com/invite/xtVgj52nN6`;
  const cadsmcMessageEn = `CADSMC is a partner of 2B2T Thailand.

CADS Studio provides end-to-end Minecraft server services, including server setup, custom plugins, websites, DDNS integration, firewall configuration, Docker setup, and backend systems for production Minecraft servers.

The team has more than 7 years of Minecraft server experience, covering server infrastructure, proxy networks, Java plugins, web development, Linux systems, and performance tuning for SMP, Survival, Anarchy, DonutSMP, and custom server projects.

You can contact CADS Studio, discuss a project, request advice, or view more service details at:
https://dev.2b2t-th.org/

Discord:
https://discord.com/invite/xtVgj52nN6`;
  const cadsmcMessage = isThai ? cadsmcMessageTh : cadsmcMessageEn;

  return (
    <div className="w-full bg-[#454545] rounded-sm shadow-lg p-8 md:p-12 text-white text-left min-h-[500px]">
      <div className="flex flex-col gap-2 border-b border-[#555] pb-5">
        <span className="text-sm font-bold uppercase tracking-wide text-[#f5c542]">Partner</span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-wide">Server Partners</h2>
        <p className="text-gray-400 text-sm">
          {isThai ? 'รายชื่อพาร์ทเนอร์และประกาศความร่วมมือของ 2B2T Thailand' : 'Partners and collaboration announcements for 2B2T Thailand'}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-5">
        <div className="bg-[#353535] rounded-sm border border-[#555] overflow-hidden">
          <div className="p-5 md:p-6 border-b border-[#555] bg-[#2f2f2f]">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-[#f5c542]">Community Partner</span>
              <h3 className="text-2xl font-bold text-white">MINECRAFT TH</h3>
              <p className="text-gray-400 text-sm">{isThai ? 'ประกาศเมื่อ May 10, 2026 6:39 PM' : 'Announced on May 10, 2026 6:39 PM'}</p>
            </div>
          </div>
          <div className="p-5 md:p-6 text-gray-300 text-[17px] leading-relaxed whitespace-pre-wrap">
            <LinkifiedMessage text={minecraftThMessage} />
          </div>
          <div className="p-5 md:p-6 pt-0 flex flex-col sm:flex-row gap-3">
            <a
              href="https://mc.in.th/"
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-4 rounded-sm bg-white text-black font-bold hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              {isThai ? 'เปิดเว็บไซต์' : 'Open Website'}
            </a>
            <button
              type="button"
              onClick={() => setShowDiscordPopup(true)}
              className="h-11 px-4 rounded-sm bg-[#5865F2] text-white font-bold hover:bg-[#4752c4] transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare size={18} />
              Discord
            </button>
          </div>
        </div>

        <div className="bg-[#353535] rounded-sm border border-[#555] overflow-hidden">
          <div className="p-5 md:p-6 border-b border-[#555] bg-[#2f2f2f]">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-[#f5c542]">Partner</span>
              <h3 className="text-2xl font-bold text-white">CADSMC</h3>
              <p className="text-gray-400 text-sm">{isThai ? 'พาร์ทเนอร์ของ 2B2T Thailand' : 'Partner of 2B2T Thailand'}</p>
            </div>
          </div>
          <div className="p-5 md:p-6 text-gray-300 text-[17px] leading-relaxed whitespace-pre-wrap">
            <LinkifiedMessage text={cadsmcMessage} />
          </div>
          <div className="p-5 md:p-6 pt-0 flex flex-col sm:flex-row gap-3">
            <a
              href="https://dev.2b2t-th.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-4 rounded-sm bg-white text-black font-bold hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              {isThai ? 'เปิดเว็บไซต์' : 'Open Website'}
            </a>
            <a
              href="https://discord.com/invite/xtVgj52nN6"
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-4 rounded-sm bg-[#5865F2] text-white font-bold hover:bg-[#4752c4] transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare size={18} />
              Discord
            </a>
          </div>
        </div>
      </div>

      {showDiscordPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="discord-popup-title"
          onClick={() => setShowDiscordPopup(false)}
        >
          <div
            className="w-full max-w-md bg-[#2f3136] border border-[#5865F2]/60 rounded-sm shadow-2xl p-6 text-white text-left"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="bg-[#5865F2] p-2 rounded-sm">
                <MessageSquare size={22} />
              </div>
              <div>
                <h2 id="discord-popup-title" className="text-2xl font-bold tracking-wide">MINECRAFT TH Discord</h2>
                <p className="text-gray-400 text-sm">{isThai ? 'Community Minecraft ของคนไทย' : 'Thai Minecraft Community'}</p>
              </div>
            </div>
            <p className="text-gray-300 mt-5 leading-relaxed">
              {isThai
                ? 'เข้าร่วม Discord ของ MINECRAFT TH เพื่อพูดคุย หาเพื่อนเล่น แชร์ผลงาน และติดตามข่าวสาร Minecraft ของคนไทย'
                : 'Join the MINECRAFT TH Discord to chat, find friends, share creations, and follow Minecraft news from the Thai community.'}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href="https://discord.gg/mcth"
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 flex-1 rounded-sm bg-[#5865F2] text-white font-bold hover:bg-[#4752c4] transition-colors flex items-center justify-center"
              >
                {isThai ? 'เปิด Discord' : 'Open Discord'}
              </a>
              <button
                type="button"
                onClick={() => setShowDiscordPopup(false)}
                className="h-11 flex-1 rounded-sm bg-[#454545] text-white font-bold hover:bg-[#5a5a5a] transition-colors"
              >
                {isThai ? 'ปิด' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Contact({ lang }: { lang: 'en' | 'th' }) {
  const isThai = lang === 'th';
  const [copiedContact, setCopiedContact] = useState<string | null>(null);
  const copyContact = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedContact(value);
    setTimeout(() => setCopiedContact(null), 1800);
  };

  return (
    <div className="w-full bg-[#454545] rounded-sm shadow-lg p-8 md:p-12 text-white text-left min-h-[500px]">
      <div className="border-b border-[#555] pb-5">
        <span className="text-sm font-bold uppercase tracking-wide text-[#f5c542]">Support</span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-wide mt-2">2b2t-th Support</h2>
        <p className="text-gray-400 text-sm mt-2">
          {isThai
            ? 'ช่องทางติดต่อทีมงานสำหรับปัญหาเกี่ยวกับเซิร์ฟเวอร์ การเข้าเล่น และการสนับสนุน'
            : 'Contact the team for server issues, connection help, and support.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        <div className="bg-[#353535] p-5 rounded-sm border border-[#555]">
          <div className="bg-[#5865F2] w-11 h-11 rounded-sm flex items-center justify-center mb-4">
            <MessageSquare size={22} />
          </div>
          <h3 className="text-xl font-bold text-white">{isThai ? 'Discord Ticket' : 'Discord Ticket'}</h3>
          <p className="text-gray-300 mt-3 leading-relaxed">
            {isThai
              ? 'วิธีที่เร็วที่สุดในการติดต่อทีมงาน เปิด Ticket ใน Discord เพื่อแจ้งปัญหา ขอความช่วยเหลือ หรือสอบถามเรื่องบัญชีและการเข้าเล่น'
              : 'The fastest way to reach the team. Open a ticket in Discord for issues, help requests, account questions, or connection support.'}
          </p>
          <a
            href="https://discord.gg/mcth"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 h-11 px-4 rounded-sm bg-[#5865F2] text-white font-bold hover:bg-[#4752c4] transition-colors flex items-center justify-center"
          >
            {isThai ? 'เปิด Discord' : 'Open Discord'}
          </a>
        </div>

        <div className="bg-[#353535] p-5 rounded-sm border border-[#555]">
          <div className="bg-white text-black w-11 h-11 rounded-sm flex items-center justify-center mb-4">
            <Copy size={22} />
          </div>
          <h3 className="text-xl font-bold text-white">{isThai ? 'ข้อมูลที่ควรเตรียม' : 'What To Include'}</h3>
          <ul className="text-gray-300 mt-3 leading-relaxed space-y-2">
            <li>{isThai ? '- ชื่อในเกมของคุณ' : '- Your in-game name'}</li>
            <li>{isThai ? '- เวอร์ชัน Java หรือ Bedrock ที่ใช้' : '- Your Java or Bedrock version'}</li>
            <li>{isThai ? '- เวลาโดยประมาณที่เกิดปัญหา' : '- Approximate time of the issue'}</li>
            <li>{isThai ? '- รูปภาพ วิดีโอ หรือข้อความ error ถ้ามี' : '- Screenshots, videos, or error messages if available'}</li>
          </ul>
        </div>

        <div className="bg-[#353535] p-5 rounded-sm border border-[#555]">
          <div className="bg-[#f5c542] text-black w-11 h-11 rounded-sm flex items-center justify-center mb-4">
            <Globe size={22} />
          </div>
          <h3 className="text-xl font-bold text-white">{isThai ? 'ลิงก์สำคัญ' : 'Useful Links'}</h3>
          <div className="flex flex-col gap-3 mt-4">
            <Link to={`${isThai ? '/th' : '/en'}/connection-guide`} className="h-11 px-4 rounded-sm bg-[#2f2f2f] border border-[#555] text-white hover:bg-[#5a5a5a] transition-colors flex items-center justify-center">
              {isThai ? 'วิธีเข้าเล่น' : 'Connection Guide'}
            </Link>
            <Link to={`${isThai ? '/th' : '/en'}/updates`} className="h-11 px-4 rounded-sm bg-[#2f2f2f] border border-[#555] text-white hover:bg-[#5a5a5a] transition-colors flex items-center justify-center">
              {isThai ? 'อัปเดตล่าสุด' : 'Latest Updates'}
            </Link>
            <Link to={`${isThai ? '/th' : '/en'}/server-stability`} className="h-11 px-4 rounded-sm bg-[#2f2f2f] border border-[#555] text-white hover:bg-[#5a5a5a] transition-colors flex items-center justify-center">
              {isThai ? 'เสถียรภาพเซิร์ฟเวอร์' : 'Server Stability'}
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-[#353535] p-5 md:p-6 rounded-sm border border-[#555] mt-5">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-[#f5c542]">{isThai ? 'ติดต่อโดยตรง' : 'Direct Contact'}</span>
          <h3 className="text-2xl font-bold text-white">{isThai ? 'ช่องทางติดต่อทีมงาน' : 'Team Contact'}</h3>
          <p className="text-gray-400 text-sm">
            {isThai
              ? 'สำหรับการติดต่อส่วนตัวหรือเรื่องที่ต้องการคุยกับทีมงานโดยตรง'
              : 'For direct contact or cases that need to be discussed with the team.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
          <button
            type="button"
            onClick={() => copyContact('zeb.deluxeg4')}
            className="bg-[#2f2f2f] border border-[#555] rounded-sm p-4 text-left hover:bg-[#5a5a5a] transition-colors"
          >
            <p className="text-gray-500 text-sm">Discord</p>
            <p className="text-white font-bold mt-1">zeb.deluxeg4</p>
            <p className="text-[#f5c542] text-xs mt-2">
              {copiedContact === 'zeb.deluxeg4' ? (isThai ? 'คัดลอกแล้ว' : 'Copied') : (isThai ? 'คลิกเพื่อคัดลอก' : 'Click to copy')}
            </p>
          </button>
          <button
            type="button"
            onClick={() => copyContact('polarac.java')}
            className="bg-[#2f2f2f] border border-[#555] rounded-sm p-4 text-left hover:bg-[#5a5a5a] transition-colors"
          >
            <p className="text-gray-500 text-sm">Discord</p>
            <p className="text-white font-bold mt-1">polarac.java</p>
            <p className="text-[#f5c542] text-xs mt-2">
              {copiedContact === 'polarac.java' ? (isThai ? 'คัดลอกแล้ว' : 'Copied') : (isThai ? 'คลิกเพื่อคัดลอก' : 'Click to copy')}
            </p>
          </button>
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@2b2t-th.org"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#2f2f2f] border border-[#555] rounded-sm p-4 hover:bg-[#5a5a5a] transition-colors"
          >
            <p className="text-gray-500 text-sm">Email</p>
            <p className="text-white font-bold mt-1 break-all">contact@2b2t-th.org</p>
            <p className="text-[#f5c542] text-xs mt-2">{isThai ? 'เปิด Gmail' : 'Open Gmail'}</p>
          </a>
        </div>
      </div>
    </div>
  );
}
export default function App() {
  const [copied, setCopied] = useState(false);
  const [playerCount, setPlayerCount] = useState<number | string>('--');
  const [lang, setLang] = useState<'en' | 'th'>('th');
  const [updates, setUpdates] = useState<any[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(true);
  const [showShopPopup, setShowShopPopup] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const pathLang = pathSegments[0] === 'en' || pathSegments[0] === 'th' ? pathSegments[0] : null;
  const localizedPath = pathLang ? `/${pathSegments.slice(1).join('/')}` : location.pathname;
  const langPrefix = `/${lang}`;

  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        const response = await fetch('https://api.mcsrvstat.us/3/2b2t-th.org');
        const data = await response.json();
        if (data.online) {
          setPlayerCount(data.players?.online ?? 0);
        } else {
          setPlayerCount('Offline');
        }
      } catch (error) {
        setPlayerCount('Offline');
      }
    };

    const fetchUpdates = async () => {
      try {
        const response = await fetch(`/updates.json?t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          setUpdates(data);
        }
      } catch (error) {
        console.error('Failed to fetch updates', error);
      } finally {
        setLoadingUpdates(false);
      }
    };

    fetchServerStatus();
    fetchUpdates();

    const interval = setInterval(() => {
      fetchServerStatus();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (pathLang && pathLang !== lang) {
      setLang(pathLang);
    }
  }, [pathLang, lang]);

  const handleCopyIp = () => {
    navigator.clipboard.writeText('2b2t-th.org');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLanguageToggle = () => {
    const nextLang = lang === 'en' ? 'th' : 'en';
    const nextPath = localizedPath === '/' ? `/${nextLang}` : `/${nextLang}${localizedPath}`;
    setLang(nextLang);
    navigate(nextPath);
  };

  const navItems = [
    { name: translations[lang].nav.home, path: langPrefix, matchPath: '/' },
    { name: translations[lang].nav.updates, path: `${langPrefix}/updates`, matchPath: '/updates' },
    { name: translations[lang].nav.modifications, path: `${langPrefix}/modifications`, matchPath: '/modifications' },
    { name: translations[lang].nav.commands, path: `${langPrefix}/commands`, matchPath: '/commands' },
    { name: translations[lang].nav.connectionGuide, path: `${langPrefix}/connection-guide`, matchPath: '/connection-guide' },
    { name: translations[lang].nav.serverStability, path: `${langPrefix}/server-stability`, matchPath: '/server-stability' },
    { name: translations[lang].nav.about, path: `${langPrefix}/about`, matchPath: '/about' }
  ];

  const t = translations[lang];

  return (
    <div className="fixed inset-0 bg-[#354256]">
      <div className="absolute inset-0 z-0" style={{ backgroundImage: `url('/site-background.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}></div>
      <div className="absolute inset-0 bg-[#252525] opacity-80 z-10"></div>

      <div className="relative z-20 w-full h-full overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full flex flex-col gap-3 max-w-[98vw] xl:max-w-7xl pt-14 pb-16 px-4">
          <div className="w-full flex justify-center">
            <img src={logoImage} alt="Server Logo" draggable={false} className="max-w-full h-auto object-contain max-h-32" />
          </div>

          <div className="w-full flex justify-end">
            <button
              onClick={handleLanguageToggle}
              className="px-4 py-2 text-sm rounded-sm font-bold transition-colors whitespace-nowrap bg-[#454545] text-white hover:bg-[#5a5a5a] border border-[#555] flex items-center gap-2 shadow-lg"
            >
              <Globe size={16} />
              {lang === 'en' ? 'TH' : 'EN'}
            </button>
          </div>

          <div className="w-full h-auto min-h-20 py-2 bg-[#454545] rounded-sm shadow-lg flex flex-wrap md:flex-nowrap items-center px-4 md:px-5 gap-2 overflow-x-auto no-scrollbar justify-start">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`h-10 md:h-12 px-3 text-sm md:text-base rounded-sm font-medium transition-colors whitespace-nowrap shrink-0 flex items-center justify-center text-center ${localizedPath === item.matchPath
                    ? 'bg-white text-black'
                    : 'bg-transparent text-white hover:bg-[#5a5a5a]'
                  }`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              to={`${langPrefix}/partner`}
              className={`ml-auto h-10 md:h-12 px-3 text-sm md:text-base rounded-sm font-medium transition-colors whitespace-nowrap shrink-0 flex items-center justify-center text-center ${localizedPath === '/partner'
                  ? 'bg-white text-black'
                  : 'bg-transparent text-white hover:bg-[#5a5a5a]'
                }`}
            >
              {t.nav.partner}
            </Link>
            <button onClick={() => setShowShopPopup(true)} className="h-10 md:h-12 px-3 text-sm md:text-base rounded-sm font-medium transition-colors whitespace-nowrap shrink-0 flex items-center justify-center text-center bg-[#3b82f6] text-white hover:bg-[#2563eb]">{t.nav.shop}</button>
          </div>

          {showShopPopup && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="shop-popup-title"
              onClick={() => setShowShopPopup(false)}
            >
              <div
                className="w-full max-w-sm bg-[#454545] border border-[#666] rounded-sm shadow-2xl p-6 text-white text-left"
                onClick={(event) => event.stopPropagation()}
              >
                <h2 id="shop-popup-title" className="text-2xl font-bold tracking-wide">{t.nav.shopComingSoonTitle}</h2>
                <p className="text-gray-300 mt-3 leading-relaxed">{t.nav.shopComingSoonDesc}</p>
                <button
                  type="button"
                  onClick={() => setShowShopPopup(false)}
                  className="mt-6 w-full h-11 rounded-sm bg-white text-black font-bold hover:bg-gray-200 transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          )}

          <Routes>
            <Route path="/en" element={<Home lang={lang} playerCount={playerCount} handleCopyIp={handleCopyIp} copied={copied} updates={updates} loadingUpdates={loadingUpdates} />} />
            <Route path="/th" element={<Home lang={lang} playerCount={playerCount} handleCopyIp={handleCopyIp} copied={copied} updates={updates} loadingUpdates={loadingUpdates} />} />
            <Route path="/en/updates" element={<Updates lang={lang} updates={updates} loadingUpdates={loadingUpdates} />} />
            <Route path="/th/updates" element={<Updates lang={lang} updates={updates} loadingUpdates={loadingUpdates} />} />
            <Route path="/en/modifications" element={<Modifications lang={lang} />} />
            <Route path="/th/modifications" element={<Modifications lang={lang} />} />
            <Route path="/en/commands" element={<Commands lang={lang} />} />
            <Route path="/th/commands" element={<Commands lang={lang} />} />
            <Route path="/en/connection-guide" element={<ConnectionGuide lang={lang} />} />
            <Route path="/th/connection-guide" element={<ConnectionGuide lang={lang} />} />
            <Route path="/en/server-stability" element={<ServerStability lang={lang} />} />
            <Route path="/th/server-stability" element={<ServerStability lang={lang} />} />
            <Route path="/en/about" element={<About lang={lang} />} />
            <Route path="/th/about" element={<About lang={lang} />} />
            <Route path="/en/partner" element={<Partner lang={lang} />} />
            <Route path="/th/partner" element={<Partner lang={lang} />} />
            <Route path="/en/contact" element={<Contact lang={lang} />} />
            <Route path="/th/contact" element={<Contact lang={lang} />} />
            <Route path="/" element={<Home lang={lang} playerCount={playerCount} handleCopyIp={handleCopyIp} copied={copied} updates={updates} loadingUpdates={loadingUpdates} />} />
            <Route path="/updates" element={<Updates lang={lang} updates={updates} loadingUpdates={loadingUpdates} />} />
            <Route path="/modifications" element={<Modifications lang={lang} />} />
            <Route path="/commands" element={<Commands lang={lang} />} />
            <Route path="/connection-guide" element={<ConnectionGuide lang={lang} />} />
            <Route path="/server-stability" element={<ServerStability lang={lang} />} />
            <Route path="/about" element={<About lang={lang} />} />
            <Route path="/partner" element={<Partner lang={lang} />} />
            <Route path="/contact" element={<Contact lang={lang} />} />
            <Route path="*" element={<Navigate to={langPrefix} replace />} />
          </Routes>
          <div className="w-full text-center text-gray-500 text-sm mt-4 pb-4 flex items-center justify-center gap-3">
            <span>&copy; 2026 2b2t-th</span>
            <span className="text-gray-600">|</span>
            <Link to={`${langPrefix}/contact`} className="text-gray-400 hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
