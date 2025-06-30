import { useEffect, useState } from "react";
import { fetchDockerStatus, type DockerContainer } from "../api/fetchStatus";

export default function DockerStatus() {
  const [containers, setContainers] = useState<DockerContainer[] | null>(null);

  useEffect(() => {
    const load = () => {
      fetchDockerStatus().then(setContainers).catch(console.error);
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

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
      <table className="w-full table-auto text-left text-sm text-gray-700 rounded-xl overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="border-b pb-2 px-2">Name</th>
            <th className="border-b pb-2 px-2">Image</th>
            <th className="border-b pb-2 px-2">Status</th>
            <th className="border-b pb-2 px-2">Ports</th>
          </tr>
        </thead>
        <tbody>
          {containers.map((container, i) => (
            <tr key={container.id ?? i} className={`transition ${container.status.includes("running") ? "bg-green-50" : "bg-red-50"} hover:bg-blue-50`}>
              <td className="py-2 px-2">{container.name}</td>
              <td className="py-2 px-2">{container.image}</td>
              <td className="py-2 px-2 font-semibold capitalize">{container.status}</td>
              <td className="py-2 px-2">{container.ports ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
