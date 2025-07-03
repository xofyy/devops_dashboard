import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Tooltip from "./Tooltip";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  // Tema durumunu state olarak tut
  const [isDark, setIsDark] = useState(() => typeof document !== 'undefined' && document.body.classList.contains('dark'));

  const handleRefresh = () => {
    window.location.reload();
  };
  const handleThemeToggle = () => {
    if (document.body.classList.contains("dark")) {
      document.body.classList.remove("dark");
      setIsDark(false);
    } else {
      document.body.classList.add("dark");
      setIsDark(true);
    }
  };
  const handleInfo = () => {
    alert("DevOps Dashboard: Sistem durumunu ve metrikleri izleyebileceğiniz bir paneldir. Daha fazla bilgi için dokümantasyona bakınız.");
  };

  // Menü kapandığında route değişirse otomatik kapansın
  // (mobilde UX için)
  // location.pathname değişince menüyü kapat
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Eğer başka bir yerde tema değişirse (örn. başka sekmede), state'i güncelle
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.body.classList.contains('dark'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <nav className={`w-full shadow-lg py-4 px-6 flex items-center justify-between rounded-b-2xl mb-8 relative transition-colors duration-300
      ${isDark
        ? 'bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-800'
        : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-yellow-400'}
    `}>
      {/* Hamburger Menü Butonu (sol) */}
      <button
        className="flex flex-col justify-center items-center w-11 h-11 rounded-xl shadow bg-white/10 hover:bg-white/20 transition focus:outline-none focus:ring-2 focus:ring-indigo-300 mr-3 md:mr-6"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Menüyü Aç/Kapat"
      >
        <span className={`block w-6 h-0.5 bg-white mb-1 transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-white mb-1 transition-all ${menuOpen ? 'opacity-0' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
      </button>
      <Link to="/" className="text-3xl font-extrabold tracking-tight drop-shadow-lg select-none hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-300 transition text-white">
        DevOps Dashboard
      </Link>
      {/* Sağdaki ikonlar */}
      <div className="flex items-center gap-4 ml-auto">
        <Tooltip content="Yenile" position="bottom">
          <button 
            onClick={handleRefresh} className="w-11 h-11 flex items-center justify-center rounded-xl shadow bg-white/10 hover:bg-white/20 transition text-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            title={"Sayfayı yenile"}
          >
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M19.418 9A7.978 7.978 0 0 0 12 4c-2.042 0-3.899.767-5.318 2M4.582 15A7.978 7.978 0 0 0 12 20c2.042 0 3.899-.767 5.318-2" />
            </svg>
          </button>
        </Tooltip>
        <Tooltip content="Tema Değiştir" position="bottom">
          <button
            onClick={handleThemeToggle}
            title={isDark ? "Açık temaya geç" : "Koyu temaya geç"}
            aria-label={isDark ? "Açık temaya geç" : "Koyu temaya geç"}
            className="w-11 h-11 flex items-center justify-center rounded-xl shadow bg-white/10 hover:bg-white/20 transition text-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 relative overflow-hidden"
          >
            {/* Güneş ikonu */}
            <span
              className={`absolute inset-0 flex items-center justify-center transition-all duration-300
                ${isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 rotate-45 pointer-events-none'}`}
              style={{ transitionProperty: 'opacity, transform' }}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 7.07l-1.41-1.41M6.05 6.05L4.64 4.64m12.02 0l-1.41 1.41M6.05 17.95l-1.41 1.41" />
              </svg>
            </span>
            {/* Ay ikonu */}
            <span
              className={`absolute inset-0 flex items-center justify-center transition-all duration-300
                ${!isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-45 pointer-events-none'}`}
              style={{ transitionProperty: 'opacity, transform' }}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
              </svg>
            </span>
          </button>
        </Tooltip>
        <Tooltip content="Bilgi/Yardım" position="bottom">
          <button 
            onClick={handleInfo} className="w-11 h-11 flex items-center justify-center rounded-xl shadow bg-white/10 hover:bg-white/20 transition text-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            title={"Bilgi/Yardım"}
          >
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
            </svg>
          </button>
        </Tooltip>
      </div>
      {/* Soldan açılır menü (drawer/sidebar) */}
      <div className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-900 shadow-2xl flex flex-col gap-2 p-8 transition-transform duration-300 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button className="self-end mb-6" onClick={() => setMenuOpen(false)} aria-label="Menüyü Kapat">
          <svg className="w-7 h-7 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <Link
          to="/"
          className={`block px-4 py-2 rounded font-semibold text-lg transition hover:bg-indigo-100 dark:hover:bg-indigo-800 ${location.pathname === '/' ? 'bg-indigo-700 text-white' : 'text-indigo-700 dark:text-indigo-200'}`}
          onClick={() => setMenuOpen(false)}
        >
          Anasayfa
        </Link>
        <Link
          to="/docker-monitor"
          className={`block px-4 py-2 rounded font-semibold text-lg transition hover:bg-indigo-100 dark:hover:bg-indigo-800 ${location.pathname === '/docker-monitor' ? 'bg-indigo-700 text-white' : 'text-indigo-700 dark:text-indigo-200'}`}
          onClick={() => setMenuOpen(false)}
        >
          Docker İzleme
        </Link>
      </div>
      {/* Menü açıkken arka planı karart */}
      {menuOpen && <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setMenuOpen(false)}></div>}
    </nav>
  );
} 