import { useEffect, useState } from "react";
import { fetchSystem, type SystemStatsData } from "../api/fetchStatus";
import Spinner from "./Spinner";

export default function SystemStats() {
  const [data, setData] = useState<SystemStatsData | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchSystem().then(setData).catch(console.error);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!data) return <Spinner />;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-6">
      <div className="flex items-center gap-2 mb-3">
        {/* CPU Icon */}
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M9 9h6v6H9z" />
        </svg>
        <h2 className="text-lg font-bold text-gray-800">System Stats</h2>
      </div>
      <ul className="space-y-1 text-sm text-gray-700">
        <li><span className="font-semibold text-blue-700">CPU:</span> {data.cpu_percent}%</li>
        <li><span className="font-semibold text-indigo-700">RAM:</span> {data.memory.percent}% used</li>
        <li><span className="font-semibold text-yellow-700">Disk:</span> {data.disk.percent}% used</li>
        {data.gpu.length > 0 && (
          <li>
            <span className="font-semibold text-purple-700">GPU:</span>
            <ul className="pl-4 list-disc">
              {data.gpu.map((gpu, i) => (
                <li key={i}>
                  {gpu.name} <span className="text-xs">({(gpu.load * 100).toFixed(1)}% load, {gpu.mem_used}/{gpu.mem_total} MB)</span>
                </li>
              ))}
            </ul>
          </li>
        )}
      </ul>
    </div>
  );
}
