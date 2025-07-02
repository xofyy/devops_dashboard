import { useEffect, useState, useRef } from "react";
import { fetchSystem, type SystemStatsData } from "../api/fetchStatus";
import Spinner from "./Spinner";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

interface HistoryItem {
  id: number;
  time: string;
  cpu: number;
  ram: number;
  disk: number;
}

export default function SystemStats() {
  const [data, setData] = useState<SystemStatsData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const update = () => {
      fetchSystem().then((d) => {
        setData(d);
        setHistory((prev) => {
          idRef.current += 1;
          const now = new Date();
          const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const next = [
            ...prev,
            {
              id: idRef.current,
              time,
              cpu: d.cpu_percent,
              ram: d.memory.percent,
              disk: d.disk.percent,
            },
          ];
          // Sadece son 20 veriyi tut
          return next.slice(-20);
        });
      }).catch(console.error);
    };
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <Spinner />;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
      <div className="flex items-center gap-2 mb-3">
        {/* CPU Icon */}
        <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M9 9h6v6H9z" />
        </svg>
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">System Stats</h2>
      </div>
      {/* Grafik */}
      <div className="w-full h-48 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="id" tick={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
            {/* eslint-disable-next-line */}
            <Tooltip 
              contentStyle={{ background: '#fff', color: '#111' }} 
              wrapperStyle={{ zIndex: 50 }} 
              labelFormatter={(_label, payload) => payload && payload.length > 0 ? payload[0].payload.time : ''} 
            />
            <Legend />
            <Line type="monotone" dataKey="cpu" stroke="#2563eb" dot={false} name="CPU (%)" strokeWidth={2} isAnimationActive={false} />
            <Line type="monotone" dataKey="ram" stroke="#6366f1" dot={false} name="RAM (%)" strokeWidth={2} isAnimationActive={false} />
            <Line type="monotone" dataKey="disk" stroke="#eab308" dot={false} name="Disk (%)" strokeWidth={2} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-200">
        <li><span className="font-semibold text-blue-700 dark:text-blue-300">CPU:</span> {data.cpu_percent}%</li>
        <li><span className="font-semibold text-indigo-700 dark:text-indigo-300">RAM:</span> {data.memory.percent}% used</li>
        <li><span className="font-semibold text-yellow-700 dark:text-yellow-300">Disk:</span> {data.disk.percent}% used</li>
        {data.gpu.length > 0 && (
          <li>
            <span className="font-semibold text-purple-700 dark:text-purple-300">GPU:</span>
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
