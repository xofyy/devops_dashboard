import { useEffect, useState } from "react";
import { fetchDockerStatus, type DockerContainer } from "../api/fetchStatus";

const MONITORED_KEY = "monitoredContainers";

export default function DockerStatus() {
  const [containers, setContainers] = useState<DockerContainer[] | null>(null);
  const [monitored, setMonitored] = useState<string[]>(() => {
    const saved = localStorage.getItem(MONITORED_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    const load = () => {
      fetchDockerStatus().then(setContainers).catch(console.error);
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

  if (!containers) return <p>Loading Docker containers...</p>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 overflow-x-auto mb-6">
      <div className="flex items-center gap-2 mb-3">
        {/* Docker Icon */}
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="7" rx="2" />
          <path d="M7 11V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
        </svg>
        <h2 className="text-lg font-bold text-gray-800">Docker Containers</h2>
      </div>
      {/* Monitored containers list */}
      {monitored.length > 0 && (
        <div className="mb-3">
          <span className="font-semibold text-sm text-gray-700">Monitored: </span>
          {monitored.map((name) => (
            <span key={name} className="inline-block bg-blue-100 text-blue-800 rounded px-2 py-0.5 mr-1 text-xs">{name}</span>
          ))}
        </div>
      )}
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-3">
          {alerts.map((msg, i) => (
            <div key={i} className="bg-red-100 text-red-800 rounded px-3 py-2 mb-1 text-sm font-semibold border border-red-300">
              {msg}
            </div>
          ))}
        </div>
      )}
      <table className="w-full table-auto text-left text-sm text-gray-700 rounded-xl overflow-hidden">
        <thead className="bg-gray-100">
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
            <tr key={container.id ?? i} className={`transition ${container.status.includes("running") ? "bg-green-50" : "bg-red-50"} hover:bg-blue-50`}>
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
    </div>
  );
}
