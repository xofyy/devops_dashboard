import { useEffect, useState } from "react";
import { fetchDockerStatus, type DockerContainer } from "../api/fetchStatus";
import Spinner from "./Spinner";
import Toast from "./Toast";

const MONITORED_KEY = "monitoredContainers";

interface DockerStatusProps {
  attributes?: React.HTMLAttributes<Element>;
  listeners?: Record<string, (...args: unknown[]) => void>;
  isDragging?: boolean;
  setNodeRef?: (node: HTMLElement | null) => void;
  style?: React.CSSProperties;
}

export default function DockerStatus({ attributes = {}, listeners = {}, isDragging = false, setNodeRef, style }: DockerStatusProps) {
  const [containers, setContainers] = useState<DockerContainer[] | null>(null);
  const [monitored, setMonitored] = useState<string[]>(() => {
    const saved = localStorage.getItem(MONITORED_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [alerts, setAlerts] = useState<string[]>([]);
  const [toast, setToast] = useState<{message: string, type?: "error" | "success" | "info"} | null>(null);

  useEffect(() => {
    const load = () => {
      fetchDockerStatus()
        .then(setContainers)
        .catch((err) => {
          setToast({ message: err.message || "Docker durumu alınamadı", type: "error" });
        });
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  // Monitor for alerts
  useEffect(() => {
    if (!containers) return;
    const newAlerts: string[] = [];
    monitored.forEach((name) => {
      const c = containers.find((c) => c.name === name);
      if (!c) {
        newAlerts.push(`Container '${name}' is not found!`);
      } else if (c.status !== "running") {
        newAlerts.push(`Container '${name}' is not running! Status: ${c.status}`);
      }
    });
    setAlerts(newAlerts);
  }, [containers, monitored]);

  // Handle checkbox change
  const handleMonitorChange = (name: string, checked: boolean) => {
    let next: string[];
    if (checked) {
      next = [...monitored, name];
    } else {
      next = monitored.filter((n) => n !== name);
    }
    setMonitored(next);
    localStorage.setItem(MONITORED_KEY, JSON.stringify(next));
  };

  if (!containers) return <Spinner />;

  return (
    <div ref={setNodeRef} style={style} className="bg-gradient-to-br from-white/90 via-indigo-50 to-indigo-100 dark:from-gray-800 dark:via-indigo-900 dark:to-gray-900 p-6 rounded-2xl shadow-xl hover:shadow-2xl border-0 ring-1 ring-indigo-100 dark:ring-indigo-900 overflow-x-auto mb-6 transition-all">
      <div
        {...attributes}
        {...listeners}
        className={`cursor-grab active:cursor-grabbing select-none flex items-center gap-3 mb-3 px-2 py-1 rounded-t-xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100 text-2xl border-b border-gray-100 dark:border-gray-700 transition-all ${isDragging ? 'bg-indigo-100 dark:bg-indigo-900 opacity-80 scale-105' : 'bg-gray-50 dark:bg-gray-900'}`}
        style={{ userSelect: 'none' }}
      >
        {/* Docker Icon */}
        <svg className="w-7 h-7 text-blue-500 dark:text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="7" rx="2" />
          <path d="M7 11V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
        </svg>
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100">Docker Containers</h2>
      </div>
      {/* Monitored containers list */}
      {monitored.length > 0 && (
        <div className="mb-3">
          <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">Monitored: </span>
          {monitored.map((name) => (
            <span key={name} className="inline-block bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700 text-blue-800 dark:text-blue-200 rounded-full px-2.5 py-1 mr-1 text-xs font-semibold shadow border border-blue-200 dark:border-blue-800 tracking-wide">
              {name}
            </span>
          ))}
        </div>
      )}
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-3">
          {alerts.map((msg, i) => (
            <div key={i} className="flex items-center gap-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-xl px-4 py-3 mb-1 text-sm font-semibold border border-red-300 dark:border-red-700 shadow-md">
              <svg className="w-5 h-5 text-red-500 dark:text-red-300 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
              </svg>
              {msg}
            </div>
          ))}
        </div>
      )}
      <table className="w-full table-auto text-left text-base font-medium text-gray-700 dark:text-gray-200 rounded-xl overflow-hidden">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="border-b pb-2 px-2">Monitor</th>
            <th className="border-b pb-2 px-2">Name</th>
            <th className="border-b pb-2 px-2">Image</th>
            <th className="border-b pb-2 px-2">Status</th>
            <th className="border-b pb-2 px-2">Ports</th>
            <th className="border-b pb-2 px-2">CPU %</th>
            <th className="border-b pb-2 px-2">Memory</th>
          </tr>
        </thead>
        <tbody>
          {containers.map((container, i) => (
            <tr key={container.id ?? i} className={`transition ${container.status.includes("running") ? "bg-green-50 dark:bg-green-900" : "bg-red-50 dark:bg-red-900"} hover:bg-blue-50 dark:hover:bg-blue-900`}>
              <td className="py-2 px-2">
                <input
                  type="checkbox"
                  checked={monitored.includes(container.name)}
                  onChange={e => handleMonitorChange(container.name, e.target.checked)}
                  aria-label={`Monitor ${container.name}`}
                />
              </td>
              <td className="py-2 px-2">{container.name}</td>
              <td className="py-2 px-2">{container.image}</td>
              <td className="py-2 px-2 font-semibold capitalize">{container.status}</td>
              <td className="py-2 px-2">{container.ports ?? "-"}</td>
              <td className="py-2 px-2">{container.cpu_percent !== undefined ? `${container.cpu_percent}%` : "-"}</td>
              <td className="py-2 px-2">
                {container.mem_usage !== undefined && container.mem_percent !== undefined
                  ? `${(container.mem_usage / 1024 / 1024).toFixed(2)} MB (${container.mem_percent}%)`
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
