/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Users, Copy, Check, MessageSquare, Globe, ChevronLeft, ChevronRight, Activity, Menu, X } from 'lucide-react';
import StatusPage from './StatusPage';
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
                loading={index === currentIndex ? 'eager' : 'lazy'}
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

function ServerInfoCard({ lang, playerCount, handleCopyIp, copied, isPrimaryHeading = false }: { lang: 'en' | 'th', playerCount: number | string, handleCopyIp: () => void, copied: boolean, isPrimaryHeading?: boolean }) {
  const t = translations[lang].home;
  const descriptionParts = t.description.split('2b2t-th.org');
  const HeadingTag = isPrimaryHeading ? 'h1' : 'h2';
  return (
    <div className="w-full rounded-sm bg-[#454545] p-5 text-left text-white shadow-lg sm:p-8">
      <div className="flex flex-col gap-5">
        <HeadingTag className="text-center text-2xl sm:text-3xl font-bold tracking-wide">{t.title}</HeadingTag>
        <p className="text-[17px] leading-relaxed text-gray-300">
          {descriptionParts[0]}
          <button
            type="button"
            onClick={handleCopyIp}
            aria-label={t.clickToCopy}
            title={copied ? t.copied : t.clickToCopy}
            className="inline cursor-pointer bg-transparent p-0 align-baseline font-[inherit] text-[#f5c542] hover:underline"
          >
            2b2t-th.org
          </button>
          {descriptionParts.slice(1).join('2b2t-th.org')}
        </p>
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
        <ServerInfoCard lang={lang} playerCount={playerCount} handleCopyIp={handleCopyIp} copied={copied} isPrimaryHeading />
      </div>
      <div className="flex w-full flex-col gap-4 lg:flex-row">
      {/* Left Side Area */}
      <div className="flex flex-col gap-4 w-full lg:flex-1">
        <GameplayCarousel />
        <div className="w-full h-full bg-[#454545] rounded-sm shadow-lg p-4 sm:p-6 text-white text-left">
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
        <div className="w-full bg-[#454545] rounded-sm shadow-lg p-4 sm:p-6 text-white text-left">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#5865F2] p-2 rounded-sm">
              <MessageSquare size={20} className="text-white" />
            </div>
            <h3 className="text-xl font-bold tracking-wide">{t.discordCommunity}</h3>
          </div>
          <div className="w-full min-h-[440px] bg-[#36393f] rounded-sm border border-[#2c2f33] overflow-hidden">
            <iframe
              src="https://canary.discord.com/widget?id=1348603803162640414&theme=dark"
              width="100%"
              height="440"
              className="discord-widget-frame"
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
    <div className="w-full bg-[#454545] rounded-sm shadow-lg p-5 sm:p-8 md:p-12 text-white text-left min-h-[360px] md:min-h-[500px]">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide">{t.title}</h2>
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
    <div className="w-full bg-[#454545] rounded-sm shadow-lg p-5 sm:p-8 md:p-12 text-white text-left min-h-[360px] md:min-h-[500px]">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide">{t.title}</h2>
      <div className="mt-4 mb-6 border-b border-[#555]" />
      <div className="text-gray-300 text-[17px] leading-relaxed">
        <p>
          {t.softwareDesc}
          <a href="https://github.com/PaperMC/Folia" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{t.here}</a>.
        </p>
        <p className="mt-4">
          {t.gamemodeDesc}
        </p>
        <div className="mt-6 border-t border-[#666]">
          {t.features.map((feature: any, index: number) => (
            <section key={index} className="border-b border-[#666] py-5 last:border-b-0 last:pb-0">
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-[15px] text-gray-300 whitespace-pre-line">
                {feature.desc}
                {feature.link === 'commands' && <> <Link to={`/${lang}/commands`} className="text-blue-400 hover:underline">{t.here}</Link>.</>}
                {feature.link === 'grim' && <><a href="https://github.com/GrimAnticheat/Grim" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{t.here}</a>.</>}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function Commands({ lang }: { lang: 'en' | 'th' }) {
  const t = translations[lang].commands;
  return (
    <div className="w-full bg-[#454545] rounded-sm shadow-lg p-5 sm:p-8 md:p-12 text-white text-left min-h-[360px] md:min-h-[500px]">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide">{t.title}</h2>
      <div className="mt-4 mb-6 border-b border-[#555]" />
      <div className="text-gray-300 text-[15px] leading-relaxed">
        <p className="mb-7 text-[17px]">{t.desc}</p>

        <section className="border-b border-[#666] pb-7 mb-7">
          <h3 className="text-xl font-bold text-white mb-3">{t.auth.title}</h3>
          <p className="text-sm text-gray-400 mb-3">{t.auth.note}</p>
          <ul className="list-none pl-0 space-y-3">
            <li>
              <div className="text-base"><code className="text-base text-green-400">/reg [password] [password]</code>{' , '}<code className="text-base text-green-400">/register [password] [password]</code></div>
              <p className="mt-1 text-sm text-gray-400">{t.auth.register}</p>
            </li>
            <li>
              <div className="text-base"><code className="text-base text-green-400">/login [password]</code>{' , '}<code className="text-base text-green-400">/l [password]</code></div>
              <p className="mt-1 text-sm text-gray-400">{t.auth.login}</p>
            </li>
          </ul>
        </section>

        <section className="border-b border-[#666] pb-7 mb-7">
          <h3 className="text-xl font-bold text-white mb-3">{t.pm.title}</h3>
          <p className="mb-3 text-sm text-gray-400">{t.pm.intro}</p>
          <ul className="list-none pl-0 space-y-4">
            <li>
              <div className="text-base"><code className="text-base text-green-400">/msg [name]</code>{' , '}<code className="text-base text-green-400">/whisper [name]</code>{' , '}<code className="text-base text-green-400">/pm [name]</code>{' , '}<code className="text-base text-green-400">/w [name]</code></div>
              <p className="mt-1 text-sm text-gray-400">{t.pm.send}</p>
            </li>
            <li>
              <p className="mb-4 rounded bg-yellow-500/10 p-2 text-xs text-yellow-500">{t.pm.warning}</p>
              <div className="text-base"><code className="text-base text-green-400">/r [message]</code>{' , '}<code className="text-base text-green-400">/reply [message]</code></div>
              <p className="mt-1 text-sm text-gray-400">{t.pm.reply}</p>
            </li>
            <li>
              <div className="text-base"><code className="text-base text-green-400">/l [message]</code>{' , '}<code className="text-base text-green-400">/last [message]</code></div>
              <p className="mt-1 text-sm text-gray-400">{t.pm.last}</p>
            </li>
          </ul>
        </section>

        <section className="border-b border-[#666] pb-7 mb-7">
          <h3 className="text-xl font-bold text-white mb-3">{t.ignore.title}</h3>
          <ul className="list-none pl-0 space-y-3">
            <li><code className="text-base text-green-400">/ignore [name]</code><p className="mt-1 text-sm text-gray-400">{t.ignore.temp}</p></li>
            <li><code className="text-base text-green-400">/ignorehard [name]</code><p className="mt-1 text-sm text-gray-400">{t.ignore.hard}</p></li>
            <li><code className="text-base text-green-400">/ignorelist</code><p className="mt-1 text-sm text-gray-400">{t.ignore.list}</p></li>
            <li><code className="text-base text-green-400">/ignoredeathmsgs [name]</code><p className="mt-1 text-sm text-gray-400">{t.ignore.death}</p></li>
          </ul>
        </section>

        <section className="border-b border-[#666] pb-7 mb-7">
          <h3 className="text-xl font-bold text-white mb-3">{t.chatVisibility.title}</h3>
          <ul className="list-none pl-0 space-y-3">
            <li><code className="text-base text-green-400">/togglechat</code><p className="mt-1 text-sm text-gray-400">{t.chatVisibility.global}</p></li>
            <li><code className="text-base text-green-400">/toggleprivatemsgs</code><p className="mt-1 text-sm text-gray-400">{t.chatVisibility.private}</p></li>
            <li><code className="text-base text-green-400">/toggledeathmsgs</code><p className="mt-1 text-sm text-gray-400">{t.chatVisibility.deathSession}</p></li>
            <li><code className="text-base text-green-400">/toggledeathmsgshard</code><p className="mt-1 text-sm text-gray-400">{t.chatVisibility.deathPermanent}</p></li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-white mb-3">{t.misc.title}</h3>
          <ul className="list-none pl-0">
            <li><code className="text-base text-green-400">/kill</code><p className="mt-1 text-sm text-gray-400">{t.misc.kill}</p></li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function Terms({ lang }: { lang: 'en' | 'th' }) {
  const t = translations[lang].terms;
  return (
    <div className="w-full bg-[#454545] rounded-sm shadow-lg p-5 sm:p-8 md:p-12 text-white text-left min-h-[360px] md:min-h-[500px]">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide">{t.title}</h2>
      <div className="text-gray-300 text-[17px] leading-relaxed flex flex-col gap-6 mt-6">
        <div className="bg-[#353535] p-6 rounded-sm border border-[#555]">
          <h3 className="text-xl font-bold text-white mb-3">{t.gameplayTitle}</h3>
          <p>{t.gameplay}</p>
        </div>
        <div className="bg-[#353535] p-6 rounded-sm border border-[#555]">
          <h3 className="text-xl font-bold text-white mb-3">{t.conductTitle}</h3>
          <p>{t.conduct}</p>
        </div>
        <div className="bg-[#353535] p-6 rounded-sm border border-[#555]">
          <h3 className="text-xl font-bold text-white mb-3">{t.fairPlayTitle}</h3>
          <p>{t.fairPlay}</p>
        </div>
        <div className="bg-[#353535] p-6 rounded-sm border border-[#555]">
          <h3 className="text-xl font-bold text-white mb-3">{t.communityTitle}</h3>
          <p>{t.content}</p>
        </div>
        <div className="bg-[#353535] p-6 rounded-sm border border-[#555] mt-8">
          <h3 className="text-xl font-bold text-white mb-3">{t.punishmentsTitle}</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t.chatPunishment}</li>
            <li>{t.serverPunishment}</li>
          </ul>
        </div>
        <div className="bg-[#353535] p-6 rounded-sm border border-[#555]">
          <h3 className="text-xl font-bold text-white mb-3">{t.reportingTitle}</h3>
          <p>{t.reporting}
            <a href="mailto:contact@2b2t-th.org" className="text-blue-400 hover:underline">contact@2b2t-th.org</a>
          </p>
        </div>
      </div>
    </div>
  );
}

function About({ lang, handleCopyIp, copied }: { lang: 'en' | 'th'; handleCopyIp: () => void; copied: boolean }) {
  const t = translations[lang].about;
  const copyText = translations[lang].home;
  const descriptionParts = t.desc1.split('2b2t-th.org');
  return (
    <div className="w-full bg-[#454545] rounded-sm shadow-lg p-5 sm:p-8 md:p-12 text-white text-left min-h-[360px] md:min-h-[500px]">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide">{t.title}</h2>
      <div className="text-gray-300 text-[17px] leading-relaxed flex flex-col gap-6 mt-6">
        <p>
          {descriptionParts[0]}
          <button
            type="button"
            onClick={handleCopyIp}
            aria-label={copyText.clickToCopy}
            title={copied ? copyText.copied : copyText.clickToCopy}
            className="inline cursor-pointer bg-transparent p-0 align-baseline font-[inherit] text-[#f5c542] hover:underline"
          >
            2b2t-th.org
          </button>
          {descriptionParts.slice(1).join('2b2t-th.org')}
        </p>
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
    <div className="w-full bg-[#454545] rounded-sm shadow-lg p-5 sm:p-8 md:p-12 text-white text-left min-h-[360px] md:min-h-[500px]">
      <div className="flex flex-col gap-2 border-b border-[#555] pb-5">
        <span className="text-sm font-bold uppercase tracking-wide text-[#f5c542]">Partner</span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide">Server Partner</h2>
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
    <div className="w-full bg-[#454545] rounded-sm shadow-lg p-5 sm:p-8 md:p-12 text-white text-left min-h-[360px] md:min-h-[500px]">
      <div className="border-b border-[#555] pb-5">
        <span className="text-sm font-bold uppercase tracking-wide text-[#f5c542]">Support</span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide mt-2">2b2t-th Support</h2>
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
            <Link to="/terms" className="h-11 px-4 rounded-sm bg-[#2f2f2f] border border-[#555] text-white hover:bg-[#5a5a5a] transition-colors flex items-center justify-center">
              {isThai ? 'ข้อกำหนด' : 'Terms'}
            </Link>
            <Link to="/updates" className="h-11 px-4 rounded-sm bg-[#2f2f2f] border border-[#555] text-white hover:bg-[#5a5a5a] transition-colors flex items-center justify-center">
              {isThai ? 'อัปเดตล่าสุด' : 'Latest Updates'}
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
export default function App() {
  const [copied, setCopied] = useState(false);
  const [playerCount, setPlayerCount] = useState<number | string>('--');
  const [lang, setLang] = useState<'en' | 'th'>('th');
  const [updates, setUpdates] = useState<any[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isStatusHost = window.location.hostname.toLowerCase() === 'status.2b2t-th.org';
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const pathLang = pathSegments[0] === 'en' || pathSegments[0] === 'th' ? pathSegments[0] : null;
  const localizedPath = isStatusHost && location.pathname === '/'
    ? '/status'
    : pathLang ? `/${pathSegments.slice(1).join('/')}` : location.pathname;
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
    if (pathLang) {
      setLang(pathLang);
    }
    const canonicalPath = isStatusHost ? '/' : pathLang ? localizedPath : null;
    if (canonicalPath && location.pathname !== canonicalPath) {
      navigate({ pathname: canonicalPath, search: location.search, hash: location.hash }, { replace: true });
    }
  }, [pathLang, isStatusHost, location.pathname, location.search, location.hash, localizedPath, navigate]);

  const handleCopyIp = () => {
    navigator.clipboard.writeText('2b2t-th.org');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLanguageToggle = () => {
    const nextLang = lang === 'en' ? 'th' : 'en';
    setLang(nextLang);
  };

  const navItems = [
    { name: translations[lang].nav.home, path: '/', matchPath: '/' },
    { name: translations[lang].nav.modifications, path: '/mods', matchPath: '/mods' },
    { name: translations[lang].nav.commands, path: '/commands', matchPath: '/commands' },
    { name: translations[lang].nav.about, path: '/about', matchPath: '/about' },
    { name: translations[lang].nav.terms, path: '/terms', matchPath: '/terms' }
  ];

  const t = translations[lang];

  if (localizedPath === '/status') {
    return <StatusPage lang={lang} />;
  }

  return (
    <div className="fixed inset-0 bg-[#354256]">
      <div className="absolute inset-0 z-0" style={{ backgroundImage: `url('/site-background.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}></div>
      <div className="absolute inset-0 bg-[#252525] opacity-80 z-10"></div>

      <div className="relative z-20 w-full h-full overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full flex flex-col gap-3 max-w-[98vw] xl:max-w-7xl pt-7 sm:pt-14 pb-8 sm:pb-16 px-3 sm:px-4">
          <div className="w-full flex justify-center">
            <img src={logoImage} alt="Server Logo" draggable={false} className="max-w-full h-auto object-contain max-h-20 sm:max-h-32" />
          </div>

          <div className="w-full flex items-center justify-end gap-2">
            <a
              href="https://status.2b2t-th.org/"
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
            </nav>
          </div>

          <Routes>
            <Route path="/en" element={<Home lang={lang} playerCount={playerCount} handleCopyIp={handleCopyIp} copied={copied} updates={updates} loadingUpdates={loadingUpdates} />} />
            <Route path="/th" element={<Home lang={lang} playerCount={playerCount} handleCopyIp={handleCopyIp} copied={copied} updates={updates} loadingUpdates={loadingUpdates} />} />
            <Route path="/en/updates" element={<Updates lang={lang} updates={updates} loadingUpdates={loadingUpdates} />} />
            <Route path="/th/updates" element={<Updates lang={lang} updates={updates} loadingUpdates={loadingUpdates} />} />
            <Route path="/en/mods" element={<Modifications lang={lang} />} />
            <Route path="/th/mods" element={<Modifications lang={lang} />} />
            <Route path="/en/modifications" element={<Navigate to="/en/mods" replace />} />
            <Route path="/th/modifications" element={<Navigate to="/th/mods" replace />} />
            <Route path="/en/commands" element={<Commands lang={lang} />} />
            <Route path="/th/commands" element={<Commands lang={lang} />} />
            <Route path="/en/connection-guide" element={<Navigate to="/terms" replace />} />
            <Route path="/th/connection-guide" element={<Navigate to="/terms" replace />} />
            <Route path="/en/server-stability" element={<Navigate to="/terms" replace />} />
            <Route path="/th/server-stability" element={<Navigate to="/terms" replace />} />
            <Route path="/en/terms" element={<Terms lang={lang} />} />
            <Route path="/th/terms" element={<Terms lang={lang} />} />
            <Route path="/en/about" element={<About lang={lang} handleCopyIp={handleCopyIp} copied={copied} />} />
            <Route path="/th/about" element={<About lang={lang} handleCopyIp={handleCopyIp} copied={copied} />} />
            <Route path="/en/partner" element={<Partner lang={lang} />} />
            <Route path="/th/partner" element={<Partner lang={lang} />} />
            <Route path="/en/contact" element={<Contact lang={lang} />} />
            <Route path="/th/contact" element={<Contact lang={lang} />} />
            <Route path="/" element={<Home lang={lang} playerCount={playerCount} handleCopyIp={handleCopyIp} copied={copied} updates={updates} loadingUpdates={loadingUpdates} />} />
            <Route path="/updates" element={<Updates lang={lang} updates={updates} loadingUpdates={loadingUpdates} />} />
            <Route path="/mods" element={<Modifications lang={lang} />} />
            <Route path="/modifications" element={<Navigate to="/mods" replace />} />
            <Route path="/commands" element={<Commands lang={lang} />} />
            <Route path="/connection-guide" element={<Navigate to="/terms" replace />} />
            <Route path="/server-stability" element={<Navigate to="/terms" replace />} />
            <Route path="/terms" element={<Terms lang={lang} />} />
            <Route path="/about" element={<About lang={lang} handleCopyIp={handleCopyIp} copied={copied} />} />
            <Route path="/partner" element={<Partner lang={lang} />} />
            <Route path="/contact" element={<Contact lang={lang} />} />
            <Route path="*" element={<Navigate to={pathLang ? localizedPath : '/'} replace />} />
          </Routes>
          <div className="w-full text-center text-gray-500 text-sm mt-4 pb-4 flex items-center justify-center gap-3">
            <span>&copy; 2026 2b2t-th</span>
            <span className="text-gray-600">|</span>
            <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
              Contact
            </Link>
            <span className="text-gray-600">|</span>
            <a href="https://status.2b2t-th.org/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              {statusLabel}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
