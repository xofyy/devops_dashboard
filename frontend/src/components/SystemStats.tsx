import { useState, useEffect } from "react";
import { fetchSystem, type SystemStatsData } from "../api/fetchStatus";
import Spinner from "./Spinner";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import Toast from "./Toast";

interface SystemStatsProps {
  attributes?: React.HTMLAttributes<Element>;
  listeners?: Record<string, (...args: unknown[]) => void>;
  isDragging?: boolean;
  setNodeRef?: (node: HTMLElement | null) => void;
  style?: React.CSSProperties;
}

export default function SystemStats({ attributes = {}, listeners = {}, isDragging = false, setNodeRef, style }: SystemStatsProps) {
  const [data, setData] = useState<SystemStatsData | null>(null);
  const [toast, setToast] = useState<{message: string, type?: "error" | "success" | "info"} | null>(null);

  useEffect(() => {
    const update = () => {
      fetchSystem()
        .then(setData)
        .catch((err) => {
          setToast({ message: err.message || "Sistem bilgileri alınamadı", type: "error" });
        });
    };
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <Spinner />;

  return (
    <div ref={setNodeRef} style={style} className="bg-gradient-to-br from-white/90 via-indigo-50 to-indigo-100 dark:from-gray-800 dark:via-indigo-900 dark:to-gray-900 p-6 rounded-2xl shadow-xl hover:shadow-2xl border-0 ring-1 ring-indigo-100 dark:ring-indigo-900 mb-6 transition-all">
      <div
        {...attributes}
        {...listeners}
        className={`cursor-grab active:cursor-grabbing select-none flex items-center gap-3 mb-3 px-2 py-1 rounded-t-xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100 text-2xl border-b border-gray-100 dark:border-gray-700 transition-all ${isDragging ? 'bg-indigo-100 dark:bg-indigo-900 opacity-80 scale-105' : 'bg-gray-50 dark:bg-gray-900'}`}
        style={{ userSelect: 'none' }}
      >
        {/* CPU Icon */}
        <svg className="w-7 h-7 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M9 9h6v6H9z" />
        </svg>
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100">System Stats</h2>
      </div>
      {/* Grafik */}
      <div className="w-full h-48 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={[]} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
      <ul className="space-y-1 text-base font-medium text-gray-700 dark:text-gray-200">
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
