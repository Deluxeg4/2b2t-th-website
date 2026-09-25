/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Users, Copy, Check, MessageSquare, Globe, ChevronLeft, ChevronRight, CheckCircle2, Activity, Menu, X } from 'lucide-react';
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const trackImages = gameplayImages;

  const scrollByImage = (direction: 'left' | 'right' = 'right') => {
    if (gameplayImages.length <= 1) return;

    const step = direction === 'left' ? -1 : 1;
    setCurrentIndex((index) => (index + step + gameplayImages.length) % gameplayImages.length);
  };

  useEffect(() => {
    if (gameplayImages.length <= 1) return;

    const interval = window.setInterval(() => {
      scrollByImage('right');
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full min-w-0 bg-[#454545] rounded-sm shadow-lg p-2 sm:p-4 text-white text-left">
      <button
        type="button"
        onClick={() => scrollByImage('left')}
        aria-label="Previous gameplay image"
        className="absolute left-3 sm:left-6 top-1/2 z-10 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-sm bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        type="button"
        onClick={() => scrollByImage('right')}
        aria-label="Next gameplay image"
        className="absolute right-3 sm:right-6 top-1/2 z-10 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-sm bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
      >
        <ChevronRight size={22} />
      </button>
      <div className="overflow-hidden rounded-sm">
        <div
          className="flex w-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {trackImages.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="w-full flex-none bg-[#353535] rounded-sm border border-[#555] overflow-hidden"
            >
              <img
                src={image}
                alt={`Gameplay screenshot ${index + 1}`}
                width={1920}
                height={1057}
                loading={Math.abs(index - currentIndex) <= 1 ? 'eager' : 'lazy'}
                draggable={false}
                className="gameplay-screenshot block w-full aspect-video object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ServerInfoCard({ lang, playerCount, handleCopyIp, copied }: { lang: 'en' | 'th', playerCount: number | string, handleCopyIp: () => void, copied: boolean }) {
  const t = translations[lang].home;
  return (
    <div className="w-full rounded-sm bg-[#454545] p-6 text-left text-white shadow-lg sm:p-8">
      <div className="flex flex-col gap-5">
        <h2 className="text-center text-3xl font-bold tracking-wide">{t.title}</h2>
        <p className="text-[17px] leading-relaxed text-gray-300">{t.description}</p>
        <div className="mt-1 flex flex-col items-center justify-between gap-3 sm:flex-row sm:gap-4">
          <div className="mt-1 flex w-full items-center gap-2 rounded-sm border border-[#555] bg-[#353535] px-4 py-2 sm:mt-0 sm:w-auto">
            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />
            <Users size={18} className="text-gray-300" />
            <span className="whitespace-nowrap font-medium tracking-wide">{playerCount} {t.playingNow}</span>
          </div>
          <div className="group relative mt-1 w-full sm:mt-0 sm:w-auto">
            <button
              type="button"
              onClick={handleCopyIp}
              className="flex w-full items-center justify-center gap-2 rounded-sm bg-white px-5 py-2 font-bold text-black transition-colors hover:bg-gray-200 sm:w-auto"
            >
              {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
              {t.copyIp}
            </button>
            <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-sm bg-black px-3 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              {copied ? t.copied : t.clickToCopy}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Home({ lang, playerCount, handleCopyIp, copied, updates, loadingUpdates }: { lang: 'en' | 'th', playerCount: number | string, handleCopyIp: () => void, copied: boolean, updates: any[], loadingUpdates: boolean }) {
  const t = translations[lang].home;
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="lg:hidden">
        <ServerInfoCard lang={lang} playerCount={playerCount} handleCopyIp={handleCopyIp} copied={copied} />
      </div>
      <div className="flex w-full flex-col gap-4 lg:flex-row">
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
        <div className="hidden lg:block">
          <ServerInfoCard lang={lang} playerCount={playerCount} handleCopyIp={handleCopyIp} copied={copied} />
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
  const [showMinecraftWebsitePopup, setShowMinecraftWebsitePopup] = useState(false);
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
  return (
    <div className="w-full bg-[#454545] rounded-sm shadow-lg p-8 md:p-12 text-white text-left min-h-[500px]">
      <div className="flex flex-col gap-2 border-b border-[#555] pb-5">
        <span className="text-sm font-bold uppercase tracking-wide text-[#f5c542]">Partner</span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-wide">Server Partner</h2>
        <p className="text-gray-400 text-sm">
          {isThai ? 'พาร์ทเนอร์และประกาศความร่วมมือของ 2B2T Thailand' : 'Partner and collaboration announcements for 2B2T Thailand'}
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
            <button
              type="button"
              onClick={() => setShowMinecraftWebsitePopup(true)}
              className="h-11 px-4 rounded-sm bg-white text-black font-bold hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              {isThai ? 'เปิดเว็บไซต์' : 'Open Website'}
            </button>
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

      </div>

      {showMinecraftWebsitePopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="minecraft-website-popup-title"
          onClick={() => setShowMinecraftWebsitePopup(false)}
        >
          <div
            className="w-full max-w-md bg-[#2f3136] border border-white/30 rounded-sm shadow-2xl p-6 text-white text-left"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="bg-white text-black p-2 rounded-sm">
                <Globe size={22} />
              </div>
              <div>
                <h2 id="minecraft-website-popup-title" className="text-2xl font-bold tracking-wide">MINECRAFT TH Website</h2>
                <p className="text-gray-400 text-sm">{isThai ? 'Community Minecraft ของคนไทย' : 'Thai Minecraft Community'}</p>
              </div>
            </div>
            <p className="text-gray-300 mt-5 leading-relaxed">
              {isThai
                ? 'เปิดเว็บไซต์ MINECRAFT TH เพื่อดูข่าวสาร ชุมชน และรายละเอียดเพิ่มเติมของ Community Minecraft ไทย'
                : 'Open the MINECRAFT TH website to view news, community details, and more information about the Thai Minecraft community.'}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href="https://mc.in.th/"
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 flex-1 rounded-sm bg-white text-black font-bold hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                {isThai ? 'เปิดเว็บไซต์' : 'Open Website'}
              </a>
              <button
                type="button"
                onClick={() => setShowMinecraftWebsitePopup(false)}
                className="h-11 flex-1 rounded-sm bg-[#454545] text-white font-bold hover:bg-[#5a5a5a] transition-colors"
              >
                {isThai ? 'ปิด' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

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
  const [showTicketPopup, setShowTicketPopup] = useState(false);
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
          <button
            type="button"
            onClick={() => setShowTicketPopup(true)}
            className="mt-5 h-11 px-4 rounded-sm bg-[#5865F2] text-white font-bold hover:bg-[#4752c4] transition-colors flex items-center justify-center"
          >
            {isThai ? 'เปิด Discord' : 'Open Discord'}
          </button>
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

      {showTicketPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ticket-popup-title"
          onClick={() => setShowTicketPopup(false)}
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
                <h2 id="ticket-popup-title" className="text-2xl font-bold tracking-wide">2b2t-th Ticket</h2>
                <p className="text-gray-400 text-sm">{isThai ? 'Support Discord Channel' : 'Support Discord Channel'}</p>
              </div>
            </div>
            <p className="text-gray-300 mt-5 leading-relaxed">
              {isThai
                ? 'เปิดช่อง Ticket ใน Discord เพื่อแจ้งปัญหา ขอความช่วยเหลือ หรือสอบถามเรื่องบัญชีและการเข้าเล่น'
                : 'Open the Discord ticket channel for issues, help requests, account questions, or connection support.'}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href="https://discord.com/channels/1348603803162640414/1375433127702429787"
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 flex-1 rounded-sm bg-[#5865F2] text-white font-bold hover:bg-[#4752c4] transition-colors flex items-center justify-center"
              >
                {isThai ? 'เปิด Ticket' : 'Open Ticket'}
              </a>
              <button
                type="button"
                onClick={() => setShowTicketPopup(false)}
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
type Range = 'day' | 'week' | 'month';
type ServiceHealth = 'operational' | 'degraded' | 'outage' | 'not_configured';
type MetricPoint = { timestamp: string; value: number };
type ServiceHistory = { timestamp: string; status: ServiceHealth | 'unknown' };
type StatusService = { name: string; status: ServiceHealth; uptimePercent: number | null; history: ServiceHistory[] };
type LiveStatus = {
  overallStatus: 'operational' | 'degraded' | 'outage';
  services: StatusService[];
  playerCount: { online: number | null; max: number | null };
  metrics: { responseTimeMs: MetricPoint[]; playersOnline: MetricPoint[] };
  incidents: { serviceId?: string; title: string; date: string; body: string; resolved: boolean; resolvedAt?: string }[];
  lastCheckedAt: string;
  hasHistory: boolean;
};

const rangeMs: Record<Range, number> = { day: 86400000, week: 7 * 86400000, month: 30 * 86400000 };

function UptimeBars({ history, lang }: { history: ServiceHistory[]; lang: 'en' | 'th' }) {
  const isThai = lang === 'th';
  const bars = history.slice(-60);
  return <div className="status-bars" aria-label={isThai ? 'ประวัติการทำงาน 60 วัน' : '60 day uptime history'}>{bars.map((item, index) => {
    const date = new Date(item.timestamp).toLocaleDateString(isThai ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const label = item.status === 'unknown' ? (isThai ? 'ไม่มีข้อมูล' : 'No data') : statusLabel(item.status, lang);
    return <span key={`${item.timestamp}-${index}`} title={`${date}: ${label}`} aria-label={`${date}: ${label}`} className={`status-bar ${item.status}`} />;
  })}</div>;
}

function statusLabel(status: ServiceHealth | 'unknown', lang: 'en' | 'th') {
  const labels = {
    en: { operational: 'Operational', degraded: 'Degraded', outage: 'Outage', not_configured: 'Not configured', unknown: 'No data' },
    th: { operational: 'ปกติ', degraded: 'มีปัญหาบางส่วน', outage: 'ขัดข้อง', not_configured: 'ยังไม่ได้ตั้งค่า', unknown: 'ไม่มีข้อมูล' },
  };
  return labels[lang][status];
}

function serviceName(name: string, lang: 'en' | 'th') {
  if (lang === 'en') return name;
  const names: Record<string, string> = {
    Minecraft: 'Minecraft',
    Queue: 'คิว',
    'Main server': 'เซิร์ฟเวอร์หลัก',
    Website: 'เว็บไซต์',
    Shop: 'ร้านค้า',
  };
  return names[name] || name;
}

function MetricsChart({ title, points, range, unit, isThai }: { title: string; points: MetricPoint[]; range: Range; unit: string; isThai: boolean }) {
  const cutoff = Date.now() - rangeMs[range];
  const visible = points.filter((point) => Date.parse(point.timestamp) >= cutoff);
  if (!visible.length) return <div className="metric-card"><h3>{title}</h3><p className="chart-no-data">{isThai ? 'ยังไม่มีข้อมูลในช่วงเวลานี้' : 'No data in this time range yet.'}</p></div>;
  const values = visible.map((point) => point.value);
  const max = Math.max(1, ...values);
  const pointsString = values.map((value, index) => `${visible.length === 1 ? 450 : (index / (visible.length - 1)) * 900},${108 - (value / max) * 96}`).join(' ');
  const latest = visible[visible.length - 1].value;
  return <div className="metric-card"><div className="metric-card-title"><h3>{title}</h3><strong>{latest} {unit}</strong></div><div className="metrics-chart"><div className="chart-scale"><span>{max}</span><span>{Math.round(max / 2)}</span><span>0</span></div><svg viewBox="0 0 900 110" preserveAspectRatio="none" role="img" aria-label={title}>{[10, 58, 108].map((y) => <line key={y} x1="0" y1={y} x2="900" y2={y} className="chart-grid" />)}<polyline points={pointsString} className="chart-line chart-line-primary" /></svg><div className="chart-labels"><span>{new Date(visible[0].timestamp).toLocaleString(isThai ? 'th-TH' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span><span>{visible.length} {isThai ? 'จุดข้อมูล' : 'samples'}</span><span>{new Date(visible[visible.length - 1].timestamp).toLocaleString(isThai ? 'th-TH' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div></div></div>;
}

function StatusPage({ lang, onToggleLanguage }: { lang: 'en' | 'th'; onToggleLanguage: () => void }) {
  const [status, setStatus] = useState<LiveStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [range, setRange] = useState<Range>('week');
  const isThai = lang === 'th';
  useEffect(() => {
    let active = true;
    const loadStatus = async () => {
      try {
        const response = await fetch('/api/status', { cache: 'no-store' });
        if (!response.ok) throw new Error(`Status request failed: ${response.status}`);
        const data: LiveStatus = await response.json();
        if (!active) return;
        setStatus(data);
        setHasError(false);
      } catch {
        if (active) setHasError(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadStatus();
    const timer = window.setInterval(loadStatus, 60000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  const bannerText = status?.overallStatus === 'outage'
    ? (isThai ? 'ระบบกำลังขัดข้อง' : 'Systems are experiencing an outage')
    : status?.overallStatus === 'degraded'
      ? (isThai ? 'พบปัญหาบางส่วนของระบบ' : 'Some systems are experiencing issues')
      : (isThai ? 'ระบบทั้งหมดทำงานปกติ' : 'All systems operational');
  const lastChecked = status?.lastCheckedAt
    ? new Date(status.lastCheckedAt).toLocaleString(isThai ? 'th-TH' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })
    : null;
  const recentIncidents = status?.incidents.filter((incident) => Date.parse(incident.date) >= Date.now() - 7 * 86400000) || [];
  const rangeText: Record<Range, string> = { day: isThai ? '24 ชั่วโมง' : '24 hours', week: isThai ? '7 วัน' : '7 days', month: isThai ? '30 วัน' : '30 days' };

  return <div className="status-page">
    <header className="status-header"><div className="status-container status-header-inner"><div className="status-brand"><img src={logoImage} alt="2b2t-th" /></div><button type="button" className="status-language-toggle" onClick={onToggleLanguage} aria-label={isThai ? 'Switch language to English' : 'เปลี่ยนภาษาเป็นภาษาไทย'}><Globe size={16} />{isThai ? 'EN' : 'TH'}</button></div></header>
    <main className="status-container status-main">
      <div className="status-title-row"><div><h1>{isThai ? 'สถานะระบบ' : 'System status'}</h1><p className="status-subtitle">{isThai ? 'สถานะบริการและประวัติการทำงานของ 2b2t-th' : 'Current service health and uptime history for 2b2t-th'}</p></div><div className="status-last-checked"><span className={`status-live-dot ${status?.overallStatus || 'unknown'}`} /><span>{lastChecked ? `${isThai ? 'ตรวจล่าสุด' : 'Last checked'} ${lastChecked}` : (isThai ? 'กำลังตรวจสอบ…' : 'Checking…')}</span></div></div>
      {hasError && <div className="status-error" role="alert">{isThai ? 'ไม่สามารถโหลดสถานะได้ในขณะนี้' : 'Unable to load status right now.'}{status && <span>{isThai ? ' แสดงข้อมูลล่าสุดที่โหลดได้' : ' Showing the last available data.'}</span>}</div>}
      {!status && loading && <div className="status-loading" role="status">{isThai ? 'กำลังโหลดสถานะ…' : 'Loading status…'}</div>}
      {!status && !loading && hasError && <div className="status-error-empty"><Activity size={20} /><p>{isThai ? 'ลองโหลดหน้าใหม่อีกครั้ง' : 'Please try refreshing the page.'}</p></div>}
      {status && <>
        <div className={`status-overall status-overall-${status.overallStatus}`} aria-live="polite"><span className="overall-icon"><CheckCircle2 size={22} /></span><span>{bannerText}</span></div>
        <section className="status-group" aria-label={isThai ? 'สถานะบริการ' : 'Service status'}>
          <div className="status-table-head"><span>{isThai ? 'บริการ' : 'Service'}</span><span>{isThai ? 'สถานะ' : 'Status'}</span><span>{isThai ? 'ระยะเวลาใช้งาน' : 'Uptime'}</span><span>{isThai ? 'ประวัติ 90 วัน' : '90 day history'}</span></div>
          <div className="service-list">{status.services.map((service) => <article className="status-row" key={service.name}><strong>{serviceName(service.name, lang)}</strong><span className={`status-operational is-${service.status}`}><i />{statusLabel(service.status, lang)}</span><span className="status-uptime">{service.uptimePercent == null ? (isThai ? 'กำลังสะสมข้อมูล' : 'Collecting history') : `${service.uptimePercent.toFixed(2)}%`}</span><UptimeBars history={service.history} lang={lang} /></article>)}</div>
        </section>
        <section className="status-panel metrics-panel"><div className="panel-title"><h2>{isThai ? 'ตัวชี้วัดระบบ' : 'System metrics'}</h2><span>{status.playerCount.online == null ? '—' : `${status.playerCount.online}${status.playerCount.max == null ? '' : ` / ${status.playerCount.max}`} ${isThai ? 'ผู้เล่น' : 'players'}`}</span></div><div className="range-tabs" role="tablist" aria-label={isThai ? 'ช่วงเวลาของกราฟ' : 'Chart time range'}>{(['day', 'week', 'month'] as const).map((item) => <button type="button" role="tab" aria-selected={range === item} key={item} className={range === item ? 'selected' : ''} onClick={() => setRange(item)}>{rangeText[item]}</button>)}</div><div className="metrics-grid"><MetricsChart title={isThai ? 'เวลาตอบสนอง' : 'Response time'} points={status.metrics.responseTimeMs} range={range} unit="ms" isThai={isThai} /><MetricsChart title={isThai ? 'ผู้เล่นออนไลน์' : 'Players online'} points={status.metrics.playersOnline} range={range} unit={isThai ? 'คน' : 'players'} isThai={isThai} /></div></section>
        <section className="status-panel notices-panel"><h2>{isThai ? 'ประกาศล่าสุด' : 'Recent notices'}</h2>{recentIncidents.length === 0 ? <div className="notice-empty"><p>{isThai ? 'ไม่มีประกาศในช่วง 7 วันที่ผ่านมา' : 'No notices reported for the past 7 days'}</p></div> : <ul className="incident-list">{recentIncidents.map((incident, index) => <li key={`${incident.date}-${index}`}><time dateTime={incident.date}>{new Date(incident.date).toLocaleString(isThai ? 'th-TH' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}</time><div><strong>{incident.title}</strong><p>{incident.body}</p>{incident.resolved && <small>{isThai ? 'แก้ไขแล้ว' : 'Resolved'}{incident.resolvedAt ? ` · ${new Date(incident.resolvedAt).toLocaleString(isThai ? 'th-TH' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}` : ''}</small>}</div></li>)}</ul>}</section>
      </>}
    </main>
    <footer className="status-container status-footer"><span>© 2026 2b2t-th</span><a href="https://status.2b2t.org/" target="_blank" rel="noreferrer">{isThai ? 'แหล่งข้อมูลสถานะ' : 'Status source'}</a></footer>
  </div>;
}

export default function App() {
  const [copied, setCopied] = useState(false);
  const [playerCount, setPlayerCount] = useState<number | string>('--');
  const [lang, setLang] = useState<'en' | 'th'>('th');
  const [updates, setUpdates] = useState<any[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(true);
  const [showShopPopup, setShowShopPopup] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isStatusHost = window.location.hostname.toLowerCase() === 'status.2b2t-th.org';
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const pathLang = pathSegments[0] === 'en' || pathSegments[0] === 'th' ? pathSegments[0] : null;
  const localizedPath = isStatusHost && location.pathname === '/'
    ? '/status'
    : pathLang ? `/${pathSegments.slice(1).join('/')}` : location.pathname;
  const langPrefix = `/${lang}`;
  const isThai = lang === 'th';
  const statusLabel = isThai ? 'สถานะระบบ' : 'Status';

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

  if (localizedPath === '/status') {
    return <StatusPage lang={lang} onToggleLanguage={handleLanguageToggle} />;
  }

  return (
    <div className="fixed inset-0 bg-[#354256]">
      <div className="absolute inset-0 z-0" style={{ backgroundImage: `url('/site-background.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}></div>
      <div className="absolute inset-0 bg-[#252525] opacity-80 z-10"></div>

      <div className="relative z-20 w-full h-full overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full flex flex-col gap-3 max-w-[98vw] xl:max-w-7xl pt-14 pb-16 px-4">
          <div className="w-full flex justify-center">
            <img src={logoImage} alt="Server Logo" draggable={false} className="max-w-full h-auto object-contain max-h-32" />
          </div>

          <div className="w-full flex items-center justify-end gap-2">
            <a
              href={`${langPrefix}/status`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={statusLabel}
              className={`px-4 py-2 text-sm rounded-sm font-bold transition-colors whitespace-nowrap border flex items-center gap-2 shadow-lg ${localizedPath === '/status'
                  ? 'bg-white text-black border-white'
                  : 'bg-[#454545] text-white hover:bg-[#5a5a5a] border-[#555]'
                }`}
            >
              <Activity size={16} />
              {statusLabel}
            </a>
            <button
              onClick={handleLanguageToggle}
              className="px-4 py-2 text-sm rounded-sm font-bold transition-colors whitespace-nowrap bg-[#454545] text-white hover:bg-[#5a5a5a] border border-[#555] flex items-center gap-2 shadow-lg"
            >
              <Globe size={16} />
              {lang === 'en' ? 'TH' : 'EN'}
            </button>
          </div>

          <div className="relative w-full min-w-0">
            <div className="relative flex w-full items-center justify-between gap-2 rounded-sm bg-[#454545] p-2 shadow-lg md:hidden">
              <button
                type="button"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-main-navigation"
                onClick={() => setIsMobileMenuOpen((open) => !open)}
                className="flex min-h-10 shrink-0 items-center gap-2 rounded-sm px-3 text-sm font-semibold text-white hover:bg-[#5a5a5a]"
              >
                <Menu size={18} />
                {t.nav.menu}
              </button>
              <div className="ml-auto flex shrink-0 items-center gap-1">
                <Link
                  to={`${langPrefix}/partner`}
                  className={`flex min-h-10 items-center justify-center whitespace-nowrap rounded-sm px-2.5 text-xs font-medium ${localizedPath === '/partner' ? 'bg-white text-black' : 'text-white hover:bg-[#5a5a5a]'}`}
                >
                  {t.nav.partner}
                </Link>
                <button
                  type="button"
                  onClick={() => setShowShopPopup(true)}
                  className="flex min-h-10 items-center justify-center whitespace-nowrap rounded-sm bg-[#3b82f6] px-2.5 text-xs font-medium text-white hover:bg-[#2563eb]"
                >
                  {t.nav.shop}
                </button>
              </div>
            </div>
            <div
              className={`fixed inset-0 z-50 md:hidden ${isMobileMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
              aria-hidden={!isMobileMenuOpen}
            >
              <button
                type="button"
                tabIndex={isMobileMenuOpen ? 0 : -1}
                aria-label={isThai ? 'ปิดเมนู' : 'Close menu'}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`absolute inset-0 h-full w-full ${isMobileMenuOpen ? 'bg-black/35 backdrop-blur-sm' : 'bg-transparent backdrop-blur-0'}`}
              />
              <nav
                id="mobile-main-navigation"
                aria-label={isThai ? 'เมนูหลัก' : 'Main navigation'}
                inert={!isMobileMenuOpen}
                className={`absolute inset-y-0 left-0 flex h-full w-[80vw] flex-col overflow-y-auto bg-[#252525] px-6 pb-8 pt-[max(1.5rem,env(safe-area-inset-top))] text-white shadow-2xl transition-transform duration-[180ms] ease-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
              >
                <div className="mb-8 flex items-center justify-between border-b border-white/15 pb-5">
                  <span className="text-lg font-bold">{t.nav.menu}</span>
                  <button
                    type="button"
                    aria-label={isThai ? 'ปิดเมนู' : 'Close menu'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex h-11 w-11 items-center justify-center rounded-sm bg-white/10 hover:bg-white/20"
                  >
                    <X size={22} />
                  </button>
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex min-h-12 items-center rounded-sm px-4 text-base font-medium ${localizedPath === item.matchPath ? 'bg-white text-black' : 'text-white hover:bg-white/10'}`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="mt-6 border-t border-white/15 pt-5">
                  <div className="mb-4 flex items-center gap-3 rounded-sm bg-white/5 px-4 py-3">
                    <Users size={19} className="shrink-0 text-green-400" />
                    <span className="text-sm font-medium">{playerCount} {t.home.playingNow}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyIp}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-white px-4 text-sm font-bold text-black transition-colors hover:bg-gray-200"
                  >
                    {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                    {copied ? t.home.copied : `${t.home.copyIp} · ${isThai ? 'คัดลอก IP' : 'Copy IP'}`}
                  </button>
                </div>
              </nav>
            </div>
            <nav aria-label={isThai ? 'เมนูหลัก' : 'Main navigation'} className="hidden w-full min-w-0 items-center gap-2 overflow-x-auto rounded-sm bg-[#454545] px-4 py-2 shadow-lg no-scrollbar md:flex md:flex-nowrap">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`min-w-0 min-h-11 w-full px-2 py-2 text-xs leading-tight md:min-h-12 md:h-12 md:w-auto md:px-3 md:py-0 md:text-base rounded-sm font-medium transition-colors whitespace-normal break-words md:whitespace-nowrap md:shrink-0 flex items-center justify-center text-center ${localizedPath === item.matchPath
                    ? 'bg-white text-black'
                    : 'bg-transparent text-white hover:bg-[#5a5a5a]'
                  }`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              to={`${langPrefix}/partner`}
              className={`min-w-0 min-h-11 w-full px-2 py-2 text-xs leading-tight md:ml-auto md:min-h-12 md:h-12 md:w-auto md:px-3 md:py-0 md:text-base rounded-sm font-medium transition-colors whitespace-normal break-words md:whitespace-nowrap md:shrink-0 flex items-center justify-center text-center ${localizedPath === '/partner'
                  ? 'bg-white text-black'
                  : 'bg-transparent text-white hover:bg-[#5a5a5a]'
                }`}
            >
              {t.nav.partner}
            </Link>
            <button onClick={() => setShowShopPopup(true)} className="min-w-0 min-h-11 w-full px-2 py-2 text-xs leading-tight md:min-h-12 md:h-12 md:w-auto md:px-3 md:py-0 md:text-base rounded-sm font-medium transition-colors whitespace-normal break-words md:whitespace-nowrap md:shrink-0 flex items-center justify-center text-center bg-[#3b82f6] text-white hover:bg-[#2563eb]">{t.nav.shop}</button>
            </nav>
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
            <span className="text-gray-600">|</span>
            <a href={`${langPrefix}/status`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              {statusLabel}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
