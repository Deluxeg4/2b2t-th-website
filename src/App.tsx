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



function GameplayCarousel() {
  const [currentIndex, setCurrentIndex] = useState(gameplayImages.length > 1 ? 1 : 0);
  const [isAnimating, setIsAnimating] = useState(true);
  const carouselImages =
    gameplayImages.length > 1
      ? [gameplayImages[gameplayImages.length - 1], ...gameplayImages, gameplayImages[0]]
      : gameplayImages;

  const scrollByImage = (direction: 'left' | 'right' = 'right') => {
    if (gameplayImages.length <= 1) return;

    setIsAnimating(true);
    setCurrentIndex((index) => (direction === 'left' ? index - 1 : index + 1));
  };

  useEffect(() => {
    if (gameplayImages.length <= 1) return;

    const interval = window.setInterval(() => {
      scrollByImage('right');
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  const handleTransitionEnd = () => {
    if (gameplayImages.length <= 1) return;

    if (currentIndex === 0) {
      setIsAnimating(false);
      setCurrentIndex(gameplayImages.length);
      requestAnimationFrame(() => requestAnimationFrame(() => setIsAnimating(true)));
    }

    if (currentIndex === carouselImages.length - 1) {
      setIsAnimating(false);
      setCurrentIndex(1);
      requestAnimationFrame(() => requestAnimationFrame(() => setIsAnimating(true)));
    }
  };

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
          onTransitionEnd={handleTransitionEnd}
          className={`flex ${isAnimating ? 'transition-transform duration-500 ease-out' : ''}`}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {carouselImages.map((image, index) => (
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
                    {update.message}
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
              <div className="whitespace-pre-wrap">{update.message}</div>
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
    </div>
  );
}
export default function App() {
  const [copied, setCopied] = useState(false);
  const [playerCount, setPlayerCount] = useState<number | string>('--');
  const [lang, setLang] = useState<'en' | 'th'>('en');
  const [updates, setUpdates] = useState<any[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(true);
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
        <div className="mx-auto w-full flex flex-col gap-4 max-w-[98vw] xl:max-w-7xl pt-16 pb-16 px-4">
          <div className="w-full flex justify-center mb-2">
            <img src={logoImage} alt="Server Logo" draggable={false} className="max-w-full h-auto object-contain max-h-32" />
          </div>

          <div className="w-full flex justify-end mb-1">
            <button
              onClick={handleLanguageToggle}
              className="px-4 py-2 text-sm rounded-sm font-bold transition-colors whitespace-nowrap bg-[#454545] text-white hover:bg-[#5a5a5a] border border-[#555] flex items-center gap-2 shadow-lg"
            >
              <Globe size={16} />
              {lang === 'en' ? 'TH' : 'EN'}
            </button>
          </div>

          <div className="w-full h-auto min-h-20 py-2 bg-[#454545] rounded-sm shadow-lg flex flex-wrap md:flex-nowrap items-center px-4 md:px-6 gap-2 md:gap-3 overflow-x-auto no-scrollbar justify-start">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`h-10 md:h-12 px-3 md:px-4 text-sm md:text-base lg:text-lg rounded-sm font-medium transition-colors whitespace-nowrap shrink-0 flex items-center justify-center text-center ${localizedPath === item.matchPath
                    ? 'bg-white text-black'
                    : 'bg-transparent text-white hover:bg-[#5a5a5a]'
                  }`}
              >
                {item.name}
              </Link>
            ))}
            <button onClick={() => alert(t.nav.comingSoon)} className="ml-auto h-10 md:h-12 px-3 md:px-4 text-sm md:text-base lg:text-lg rounded-sm font-medium transition-colors whitespace-nowrap shrink-0 flex items-center justify-center text-center bg-[#3b82f6] text-white hover:bg-[#2563eb]">{t.nav.shop}</button>
          </div>

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
            <Route path="/" element={<Home lang={lang} playerCount={playerCount} handleCopyIp={handleCopyIp} copied={copied} updates={updates} loadingUpdates={loadingUpdates} />} />
            <Route path="/updates" element={<Updates lang={lang} updates={updates} loadingUpdates={loadingUpdates} />} />
            <Route path="/modifications" element={<Modifications lang={lang} />} />
            <Route path="/commands" element={<Commands lang={lang} />} />
            <Route path="/connection-guide" element={<ConnectionGuide lang={lang} />} />
            <Route path="/server-stability" element={<ServerStability lang={lang} />} />
            <Route path="/about" element={<About lang={lang} />} />
            <Route path="*" element={<Navigate to={langPrefix} replace />} />
          </Routes>
          <div className="w-full text-center text-gray-500 text-sm mt-4 pb-4">
            2b2t-th &copy; 2026
          </div>
        </div>
      </div>
    </div>
  );
}
