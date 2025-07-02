import { useEffect, useState } from "react";
import { fetchUptime, type UptimeDataItem } from "../api/fetchStatus";
import Spinner from "./Spinner";

export default function UptimeStatus() {
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
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-auto max-h-96 mb-6">
      <div className="flex items-center gap-2 mb-3">
        {/* Uptime Icon */}
        <svg className="w-6 h-6 text-yellow-500 dark:text-yellow-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Uptime Status</h2>
      </div>
      <table className="w-full table-auto text-left text-sm text-gray-700 dark:text-gray-200 rounded-xl overflow-hidden">
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
