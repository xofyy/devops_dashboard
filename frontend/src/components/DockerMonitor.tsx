import { useEffect, useState } from "react";
import type { DockerContainer } from "../api/fetchStatus";
import { fetchDockerStatus, fetchContainerLogs, startContainer, stopContainer, restartContainer, fetchContainerDetails, type ContainerDetails } from "../api/fetchStatus";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DOCKER_FAVORITES_KEY, CPU_ALERT_THRESHOLD, MEM_ALERT_THRESHOLD, DEFAULT_LOG_TAIL } from "../constants";

interface MetricPoint {
  time: string;
  cpu: number;
  mem: number;
  net_rx: number;
  net_tx: number;
  blk_read: number;
  blk_write: number;
  ts: number;
}

export default function DockerMonitor() {
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [metrics, setMetrics] = useState<MetricPoint[]>([]);
  const [timeRange, setTimeRange] = useState<number>(60); // saniye cinsinden, varsayılan 1dk
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string>("");
  const [logFilter, setLogFilter] = useState("");
  const [details, setDetails] = useState<ContainerDetails | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(DOCKER_FAVORITES_KEY) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(DOCKER_FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // Favori ekle/çıkar
  const toggleFavorite = (id: string) => {
    setFavorites((prev) => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  // Favori ve diğer container'ları ayır
  const favoriteContainers = containers.filter(c => favorites.includes(c.id));
  const otherContainers = containers.filter(c => !favorites.includes(c.id));

  // Container listesini çek
  useEffect(() => {
    fetchDockerStatus().then((data) => {
      console.log("[DEBUG] fetchDockerStatus response:", data);
      setContainers(data);
    });
  }, []);

  // Seçili container'ın metriklerini periyodik olarak çek
  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    const fetchMetrics = async () => {
      const data = await fetchDockerStatus();
      const c = data.find((d) => d.id === selectedId);
      if (c) {
        setMetrics((prev) => {
          const now = Date.now();
          const newPoint = {
            time: new Date().toLocaleTimeString(),
            cpu: c.cpu_percent || 0,
            mem: c.mem_percent || 0,
            net_rx: c.net_rx || 0,
            net_tx: c.net_tx || 0,
            blk_read: c.blk_read || 0,
            blk_write: c.blk_write || 0,
            ts: now,
          };
          // Seçili zaman aralığına göre filtrele
          const cutoff = now - timeRange * 1000;
          return [...prev, newPoint].filter((m) => m.ts >= cutoff);
        });
      }
      setLoading(false);
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 2000);
    return () => clearInterval(interval);
  }, [selectedId, timeRange]);

  // Logları periyodik çek
  useEffect(() => {
    if (!selectedId) {
      setLogs("");
      return;
    }
    let cancelled = false;
    const fetchLogs = async () => {
      try {
        const res = await fetchContainerLogs(selectedId, DEFAULT_LOG_TAIL);
        if (!cancelled) setLogs(res.logs);
      } catch {
        if (!cancelled) setLogs("Log alınamadı");
      }
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedId]);

  // Detayları çek
  useEffect(() => {
    if (!selectedId) {
      setDetails(null);
      return;
    }
    fetchContainerDetails(selectedId).then(setDetails);
  }, [selectedId]);

  // Aksiyon butonları
  const selectedContainer = containers.find((c) => c.id === selectedId);
  const handleAction = async (action: "start" | "stop" | "restart") => {
    if (!selectedId) return;
    setActionLoading(true);
    setActionMessage("");
    let result;
    if (action === "start") result = await startContainer(selectedId);
    if (action === "stop") result = await stopContainer(selectedId);
    if (action === "restart") result = await restartContainer(selectedId);
    setActionMessage(result?.message || "");
    setActionLoading(false);
    // İşlem sonrası metrikleri ve logları güncelle
    fetchDockerStatus().then(setContainers);
    fetchContainerLogs(selectedId, 100).then((res) => setLogs(res.logs));
  };

  // Uyarı hesaplama
  const lastMetric = metrics.length > 0 ? metrics[metrics.length - 1] : null;
  const cpuAlert = lastMetric && lastMetric.cpu > CPU_ALERT_THRESHOLD;
  const memAlert = lastMetric && lastMetric.mem > MEM_ALERT_THRESHOLD;

  return (
    <div className="max-w-4xl mx-auto mt-12 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
      <h1 className="text-3xl font-extrabold mb-4 text-indigo-700 dark:text-indigo-300 tracking-tight drop-shadow">Docker İzleme Paneli</h1>
      <p className="text-lg text-gray-700 dark:text-gray-200 mb-6 max-w-2xl">Aktif bir container seçin ve anlık metrikleri, logları, detayları ve aksiyonları modern bir panelde izleyin.</p>
      <div className="mb-8">
        <label className="block mb-2 font-semibold text-indigo-700 dark:text-indigo-300">Container Seç:</label>
        <select
          className="w-full p-2 rounded min-h-[40px] bg-white text-black dark:bg-gray-900 dark:text-white border border-gray-400"
          value={selectedId}
          onChange={(e) => {
            setSelectedId(e.target.value);
            setMetrics([]);
          }}
        >
          <option value="">Bir container seçin...</option>
          {favoriteContainers.length > 0 && (
            <optgroup label="Favoriler">
              {favoriteContainers.map((c) => (
                <option key={c.id} value={c.id} className="bg-white text-black dark:bg-gray-900 dark:text-white">
                  ★ {c.name} ({c.image})
                </option>
              ))}
            </optgroup>
          )}
          {otherContainers.length > 0 && (
            <optgroup label="Diğerleri">
              {otherContainers.map((c) => (
                <option key={c.id} value={c.id} className="bg-white text-black dark:bg-gray-900 dark:text-white">
                  {c.name} ({c.image})
                </option>
              ))}
            </optgroup>
          )}
        </select>
        {/* Favori yıldızları için ayrı bir liste */}
        <div className="flex flex-wrap gap-2 mt-2">
          {containers.map((c) => (
            <button
              key={c.id}
              onClick={() => toggleFavorite(c.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs border shadow-sm transition hover:scale-105 focus:outline-none ${favorites.includes(c.id) ? "bg-yellow-300 text-yellow-900 border-yellow-400" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"}`}
              title={favorites.includes(c.id) ? "Favorilerden çıkar" : "Favorilere ekle"}
              type="button"
            >
              <span className="text-lg">{favorites.includes(c.id) ? "★" : "☆"}</span>
              <span className="truncate max-w-[120px]">{c.name}</span>
            </button>
          ))}
        </div>
      </div>
      {/* DEBUG: Container isimlerini ekrana yazdır */}
      <ul className="mb-4 text-sm text-gray-500">
        {containers.map((c) => (
          <li key={c.id}>{c.name} ({c.image})</li>
        ))}
      </ul>
      {selectedId && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 shadow-inner">
          {/* Uyarı Paneli */}
          {(cpuAlert || memAlert) && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-400 text-red-800 font-bold flex items-center gap-3 animate-pulse">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
              {cpuAlert && <span>CPU kullanımı kritik seviyede! ({lastMetric?.cpu?.toFixed(1)}%)</span>}
              {memAlert && <span>RAM kullanımı kritik seviyede! ({lastMetric?.mem?.toFixed(1)}%)</span>}
            </div>
          )}
          {/* Zaman Aralığı Seçici */}
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <label className="font-semibold">Zaman Aralığı:</label>
            <select
              className="p-1 rounded border border-gray-400 bg-white dark:bg-gray-800 dark:text-white text-sm"
              value={timeRange}
              onChange={e => setTimeRange(Number(e.target.value))}
            >
              <option value={60}>1 dk</option>
              <option value={300}>5 dk</option>
              <option value={900}>15 dk</option>
            </select>
            <span className="text-xs text-gray-500 ml-2">(Grafiklerde gösterilecek süre)</span>
          </div>
          {/* Detay Paneli */}
          {details && !details.error && (
            <div className="mb-6 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-bold mb-2 text-indigo-700 dark:text-indigo-300">Container Detayları</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div><span className="font-semibold">ID:</span> <span className="break-all">{details.id}</span></div>
                <div><span className="font-semibold">İsim:</span> {details.name}</div>
                <div><span className="font-semibold">Image:</span> {details.image}</div>
                <div><span className="font-semibold">Durum:</span> {details.status}</div>
                <div><span className="font-semibold">Oluşturulma:</span> {new Date(details.created).toLocaleString()}</div>
                <div><span className="font-semibold">Çalışma Dizini:</span> {details.working_dir || '-'}</div>
                <div><span className="font-semibold">Network:</span> {details.network_mode}</div>
                <div><span className="font-semibold">Restart Policy:</span> {details.restart_policy ? JSON.stringify(details.restart_policy) : '-'}</div>
                <div><span className="font-semibold">Entrypoint:</span> {details.entrypoint?.join(' ') || '-'}</div>
                <div><span className="font-semibold">Komut:</span> {details.command?.join(' ') || '-'}</div>
                <div className="md:col-span-2"><span className="font-semibold">Mounts:</span> {details.mounts && details.mounts.length > 0 ? details.mounts.map((m, i) => <span key={i} className="inline-block bg-gray-200 dark:bg-gray-700 rounded px-2 py-1 mx-1 my-0.5">{JSON.stringify(m)}</span>) : '-'}</div>
                <div className="md:col-span-2"><span className="font-semibold">Labels:</span> {details.labels && Object.keys(details.labels).length > 0 ? Object.entries(details.labels).map(([k, v]) => <span key={k} className="inline-block bg-gray-200 dark:bg-gray-700 rounded px-2 py-1 mx-1 my-0.5">{k}: {v}</span>) : '-'}</div>
                <div className="md:col-span-2"><span className="font-semibold">Env:</span> {details.env && details.env.length > 0 ? details.env.map((e, i) => <span key={i} className="inline-block bg-gray-200 dark:bg-gray-700 rounded px-2 py-1 mx-1 my-0.5">{e}</span>) : '-'}</div>
              </div>
            </div>
          )}
          {details?.error && <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-700">Detaylar alınamadı: {details.error}</div>}
          {/* Aksiyon Butonları */}
          <div className="mb-6 flex gap-3 items-center flex-wrap">
            {selectedContainer?.status === "running" ? (
              <>
                <button onClick={() => handleAction("stop")}
                  className="px-4 py-2 rounded bg-red-600 text-white font-bold hover:bg-red-700 transition disabled:opacity-60 shadow-sm"
                  disabled={actionLoading}
                >Durdur</button>
                <button onClick={() => handleAction("restart")}
                  className="px-4 py-2 rounded bg-yellow-500 text-white font-bold hover:bg-yellow-600 transition disabled:opacity-60 shadow-sm"
                  disabled={actionLoading}
                >Yeniden Başlat</button>
              </>
            ) : (
              <button onClick={() => handleAction("start")}
                className="px-4 py-2 rounded bg-green-600 text-white font-bold hover:bg-green-700 transition disabled:opacity-60 shadow-sm"
                disabled={actionLoading}
              >Başlat</button>
            )}
            {actionLoading && <span className="ml-2 text-indigo-500 animate-pulse">İşlem yapılıyor...</span>}
            {actionMessage && <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">{actionMessage}</span>}
          </div>
          <h2 className="text-xl font-bold mb-4 text-indigo-600 dark:text-indigo-200">Kaynak Kullanımı</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" minTickGap={20} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => v + "%"} />
              <Tooltip formatter={(v: number) => v.toFixed(2) + "%"} />
              <Legend />
              <Line type="monotone" dataKey="cpu" stroke="#6366f1" name="CPU (%)" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="mem" stroke="#f59e42" name="RAM (%)" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          <h2 className="text-xl font-bold mt-8 mb-4 text-indigo-600 dark:text-indigo-200">Ağ Trafiği (Bytes)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={metrics} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" minTickGap={20} />
              <YAxis tickFormatter={(v) => (v / 1024).toFixed(0) + " KB"} />
              <Tooltip formatter={(v: number) => (v / 1024).toFixed(2) + " KB"} />
              <Legend />
              <Line type="monotone" dataKey="net_rx" stroke="#10b981" name="Alınan (RX)" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="net_tx" stroke="#f43f5e" name="Gönderilen (TX)" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          <h2 className="text-xl font-bold mt-8 mb-4 text-indigo-600 dark:text-indigo-200">Disk I/O (Bytes)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={metrics} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" minTickGap={20} />
              <YAxis tickFormatter={(v) => (v / 1024).toFixed(0) + " KB"} />
              <Tooltip formatter={(v: number) => (v / 1024).toFixed(2) + " KB"} />
              <Legend />
              <Line type="monotone" dataKey="blk_read" stroke="#0ea5e9" name="Okuma (Read)" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="blk_write" stroke="#f59e42" name="Yazma (Write)" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          {/* Log Paneli */}
          <h2 className="text-xl font-bold mt-8 mb-4 text-indigo-600 dark:text-indigo-200">Container Logları</h2>
          {/* Log Arama Kutusu */}
          <input
            type="text"
            className="mb-2 w-full p-2 rounded border border-gray-400 bg-white dark:bg-gray-800 dark:text-white text-sm font-mono"
            placeholder="Loglarda ara..."
            value={logFilter}
            onChange={e => setLogFilter(e.target.value)}
          />
          <div className="bg-black text-green-400 font-mono text-xs rounded-lg p-4 h-64 overflow-y-auto whitespace-pre-wrap border border-gray-700 shadow-inner">
            {logs
              ? logs
                  .split("\n")
                  .filter(line => !logFilter || line.toLowerCase().includes(logFilter.toLowerCase()))
                  .map((line, i) => <div key={i}>{line}</div>)
              : <span className="text-gray-400">Log bulunamadı veya yükleniyor...</span>}
          </div>
        </div>
      )}
      {loading && <div className="mt-4 text-indigo-500">Yükleniyor...</div>}
    </div>
  );
} 