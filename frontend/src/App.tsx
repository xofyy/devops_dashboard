import { useState, useRef, useEffect } from "react";
import Navbar from "./components/Navbar";
import SystemStats from "./components/SystemStats";
import UptimeStatus from "./components/UptimeStatus";
import DockerStatus from "./components/DockerStatus";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DockerMonitor from "./components/DockerMonitor";
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

function SortablePanel({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
        opacity: isDragging ? 0.85 : 1,
        minHeight: 220,
        minWidth: 320,
        flexBasis: '320px',
        flexGrow: 1,
        maxWidth: '420px',
        width: '100%',
        overflow: 'hidden',
        boxShadow: isDragging ? '0 8px 32px 0 rgba(80,80,180,0.25)' : undefined,
        scale: isDragging ? 1.04 : 1,
      }}
      {...attributes}
      {...listeners}
      className="transition-all duration-200"
    >
      {isDragging ? <div style={{ minHeight: 220 }} /> : children}
    </div>
  );
}

function App() {
  const [activePanels, setActivePanels] = useState({
    system: true,
    uptime: true,
    docker: true,
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  // Sürüklenebilir panel sırası
  const [panelOrder, setPanelOrder] = useState(panels.map(p => p.key));
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const panelMeta = panels.reduce((acc, p) => { acc[p.key] = { label: p.label, icon: p.icon }; return acc; }, {} as Record<string, { label: string; icon: React.ReactNode }>);

  // Dışarı tıklanınca filtre kutusunu kapat
  useEffect(() => {
    if (!filterOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [filterOpen]);

  // Aktif panelleri diziye topla ve sıralamaya göre sırala
  const visiblePanels = panelOrder
    .map((key) => panels.find((p) => p.key === key)!)
    .filter((panel) => activePanels[panel.key as keyof typeof activePanels]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 font-sans dark:bg-gray-900 dark:text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={
            <>
              {/* Filtre Butonu ve Popover */}
              <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 mb-8 flex justify-end">
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold shadow hover:bg-indigo-700 transition relative"
                  onClick={() => setFilterOpen((v) => !v)}
                  aria-label="Panel filtrele"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a1 1 0 0 1-.293.707l-6.414 6.414A1 1 0 0 0 13 14.414V19a1 1 0 0 1-1.447.894l-2-1A1 1 0 0 1 9 18v-3.586a1 1 0 0 0-.293-.707L2.293 6.707A1 1 0 0 1 2 6V4z" />
                  </svg>
                  <span className="hidden sm:inline">Filtrele</span>
                  <span className="ml-2 bg-white text-indigo-700 rounded-full px-2 text-xs font-bold">{Object.values(activePanels).filter(Boolean).length}</span>
                </button>
                {filterOpen && (
                  <div ref={filterRef} className="absolute mt-14 right-8 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-4 flex flex-col gap-3 min-w-[260px] animate-fade-in">
                    <span className="font-bold text-indigo-700 dark:text-indigo-300 text-base mb-2">Gösterilecek Paneller</span>
                    {panels.map((panel) => (
                      <label key={panel.key} className="flex items-center gap-2 cursor-pointer select-none text-sm font-semibold text-gray-700 dark:text-gray-200">
                        <input
                          type="checkbox"
                          checked={activePanels[panel.key as keyof typeof activePanels]}
                          onChange={() => setActivePanels((prev) => ({ ...prev, [panel.key]: !prev[panel.key as keyof typeof prev] }))}
                          className="accent-indigo-600 w-4 h-4 rounded focus:ring-2 focus:ring-indigo-400"
                        />
                        <span className="flex items-center gap-1">
                          <span className="w-5 h-5">{panel.icon}</span>
                          {panel.label}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <main className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 py-10 flex flex-wrap gap-10 justify-center items-stretch overflow-x-hidden">
                <DndContext
                  collisionDetection={closestCenter}
                  onDragStart={event => setDraggingId(event.active.id as string)}
                  onDragEnd={(event) => {
                    const { active, over } = event;
                    setDraggingId(null);
                    if (active.id !== over?.id) {
                      setPanelOrder((items) => arrayMove(items, items.indexOf(active.id as string), items.indexOf(over?.id as string)));
                    }
                  }}
                  onDragCancel={() => setDraggingId(null)}
                >
                  <SortableContext items={visiblePanels.map(p => p.key)} strategy={rectSortingStrategy}>
                    {visiblePanels.map((panel) => (
                      <SortablePanel key={panel.key} id={panel.key}>
                        {panel.component}
                      </SortablePanel>
                    ))}
                  </SortableContext>
                  <DragOverlay adjustScale style={{ width: 420, maxWidth: '90vw', zIndex: 100 }}>
                    {draggingId ? (
                      <div className="rounded-2xl shadow-2xl bg-white dark:bg-gray-800 border border-indigo-300 dark:border-indigo-700 w-full max-w-[420px] p-8 flex flex-col items-center justify-center opacity-90 scale-105">
                        <div className="mb-2 text-indigo-700 dark:text-indigo-300">{panelMeta[draggingId].icon}</div>
                        <div className="font-bold text-lg mb-2">{panelMeta[draggingId].label}</div>
                        <div className="text-xs text-gray-400">Paneli taşıyorsunuz...</div>
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              </main>
            </>
          } />
          <Route path="/docker-monitor" element={<DockerMonitor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
