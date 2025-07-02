import { useState } from "react";
import Navbar from "./components/Navbar";
import SystemStats from "./components/SystemStats";
import UptimeStatus from "./components/UptimeStatus";
import DockerStatus from "./components/DockerStatus";

const panels = [
  {
    key: "system",
    label: "System Stats",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M9 9h6v6H9z" />
      </svg>
    ),
    component: <SystemStats />,
  },
  {
    key: "uptime",
    label: "Uptime Status",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    component: <UptimeStatus />,
  },
  {
    key: "docker",
    label: "Docker Status",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="7" rx="2" />
        <path d="M7 11V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
      </svg>
    ),
    component: <DockerStatus />,
  },
];

function App() {
  const [activePanels, setActivePanels] = useState({
    system: true,
    uptime: true,
    docker: true,
  });

  const togglePanel = (key: string) => {
    setActivePanels((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  // Aktif panelleri diziye topla
  const visiblePanels = panels.filter((panel) => activePanels[panel.key as keyof typeof activePanels]);
  // Grid sütununu panel sayısına göre ayarla (en az 1, en çok 3)
  const gridCols = visiblePanels.length === 1 ? 'grid-cols-1' : visiblePanels.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="min-h-screen bg-gray-100 font-sans dark:bg-gray-900 dark:text-white">
      <Navbar />
      {/* Modern Panel Seçici - Şık ve Düzgün Butonlar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 mb-6 flex flex-wrap gap-3 items-center justify-center">
        {panels.map((panel) => {
          const isActive = activePanels[panel.key as keyof typeof activePanels];
          return (
            <button
              key={panel.key}
              onClick={() => togglePanel(panel.key)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition-all duration-200 border focus:outline-none text-sm shadow-sm select-none
                ${isActive
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-lg hover:bg-indigo-700 hover:border-indigo-700 focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-800"
                  : "bg-white dark:bg-gray-800 text-gray-500 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200"}
                hover:scale-105`}
              title={isActive ? `${panel.label} panelini gizle` : `${panel.label} panelini göster`}
              style={{ minWidth: 140 }}
            >
              <span className={`transition-colors duration-200 ${isActive ? "text-white" : "text-gray-400 dark:text-gray-400"}`}>{panel.icon}</span>
              <span className="font-bold tracking-tight truncate">{panel.label}</span>
            </button>
          );
        })}
      </div>
      <main className={`max-w-7xl mx-auto px-4 sm:px-8 md:px-12 py-10 grid gap-10 ${gridCols}`}>
        {/* Responsive ve boşluksuz panel gösterimi */}
        {visiblePanels.map((panel) => (
          <div key={panel.key} className="transition-all duration-300 opacity-100 scale-100">
            {panel.component}
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;
