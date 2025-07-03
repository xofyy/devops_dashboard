import { useEffect, useState } from "react";
import { fetchUptime, type UptimeDataItem } from "../api/fetchStatus";
import Spinner from "./Spinner";

interface UptimeStatusProps {
  attributes?: React.HTMLAttributes<Element>;
  listeners?: Record<string, (...args: unknown[]) => void>;
  isDragging?: boolean;
  setNodeRef?: (node: HTMLElement | null) => void;
  style?: React.CSSProperties;
}

export default function UptimeStatus({ attributes = {}, listeners = {}, isDragging = false, setNodeRef, style }: UptimeStatusProps) {
  const [data, setData] = useState<UptimeDataItem[] | null>(null);

  useEffect(() => {
    const load = () => {
      fetchUptime().then(setData).catch(console.error);
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <Spinner />;

  return (
    <div ref={setNodeRef} style={style} className="bg-gradient-to-br from-white/90 via-indigo-50 to-indigo-100 dark:from-gray-800 dark:via-indigo-900 dark:to-gray-900 p-6 rounded-2xl shadow-xl hover:shadow-2xl border-0 ring-1 ring-indigo-100 dark:ring-indigo-900 overflow-auto max-h-96 mb-6 transition-all">
      <div
        {...attributes}
        {...listeners}
        className={`cursor-grab active:cursor-grabbing select-none flex items-center gap-3 mb-3 px-2 py-1 rounded-t-xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100 text-2xl border-b border-gray-100 dark:border-gray-700 transition-all ${isDragging ? 'bg-indigo-100 dark:bg-indigo-900 opacity-80 scale-105' : 'bg-gray-50 dark:bg-gray-900'}`}
        style={{ userSelect: 'none' }}
      >
        {/* Uptime Icon */}
        <svg className="w-7 h-7 text-yellow-500 dark:text-yellow-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100">Uptime Status</h2>
      </div>
      <table className="w-full table-auto text-left text-base font-medium text-gray-700 dark:text-gray-200 rounded-xl overflow-hidden">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="border-b pb-2 px-2">URL</th>
            <th className="border-b pb-2 px-2">Status</th>
            <th className="border-b pb-2 px-2">HTTP Code</th>
            <th className="border-b pb-2 px-2">Response Time (ms)</th>
          </tr>
        </thead>
        <tbody>
        {data.map((item, i) => (
            <tr
            key={i}
            className={`transition ${
                i % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"
            } ${item.status === "up" ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"} hover:bg-blue-50 dark:hover:bg-blue-900`}
            >
            <td className="py-2 px-2">{item.url}</td>
            <td className="py-2 px-2 font-semibold text-sm capitalize">{item.status}</td>
            <td className="py-2 px-2">{item.status_code}</td>
            <td className="py-2 px-2">{item.response_time_ms}</td>
            </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}
