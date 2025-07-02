// import { useState } from "react";

export default function Navbar() {
  // Tema değiştirici için state kaldırıldı (kullanılmıyor)

  const handleRefresh = () => {
    window.location.reload();
  };
  const handleThemeToggle = () => {
    // Sadece body class'ı değiştiriliyor
    if (document.body.classList.contains("dark")) {
      document.body.classList.remove("dark");
    } else {
      document.body.classList.add("dark");
    }
  };
  const handleInfo = () => {
    alert("DevOps Dashboard: Sistem durumunu ve metrikleri izleyebileceğiniz bir paneldir. Daha fazla bilgi için dokümantasyona bakınız.");
  };

  return (
    <nav className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-yellow-400 shadow-lg py-4 px-6 flex items-center justify-between rounded-b-2xl mb-8">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-extrabold text-white tracking-wide drop-shadow">DevOps Dashboard</span>
      </div>
      <div className="flex items-center gap-4">
        {/* Yenile (Refresh) İkonu */}
        <button onClick={handleRefresh} title="Yenile">
          <svg className="w-6 h-6 text-white hover:text-gray-200 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M19.418 9A7.978 7.978 0 0 0 12 4c-2.042 0-3.899.767-5.318 2M4.582 15A7.978 7.978 0 0 0 12 20c2.042 0 3.899-.767 5.318-2" />
          </svg>
        </button>
        {/* Tema Değiştirici İkonu */}
        <button onClick={handleThemeToggle} title="Tema Değiştir">
          <svg className="w-6 h-6 text-white hover:text-gray-200 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.95 7.07l-.71-.71M4.05 4.93l-.71-.71M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
          </svg>
        </button>
        {/* Bilgi/Yardım İkonu */}
        <button onClick={handleInfo} title="Bilgi/Yardım">
          <svg className="w-6 h-6 text-white hover:text-gray-200 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
          </svg>
        </button>
      </div>
    </nav>
  );
} 