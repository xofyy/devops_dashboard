export interface GpuInfo {
  name: string;
  load: number;
  mem_used: number;
  mem_total: number;
}

export interface SystemStatsData {
  cpu_percent: number;
  memory: {
    percent: number;
  };
  disk: {
    percent: number;
  };
  gpu: GpuInfo[];
}

export async function fetchSystem(): Promise<SystemStatsData> {
  const res = await fetch("http://localhost:8000/api/system");
  if (!res.ok) throw new Error("Failed to fetch system stats");
  return res.json();
}

export interface UptimeDataItem {
  url: string;
  status_code: number;
  response_time_ms: number;
  status: "up" | "down";
}

export async function fetchUptime(): Promise<UptimeDataItem[]> {
  const res = await fetch("http://localhost:8000/api/uptime");
  if (!res.ok) throw new Error("Failed to fetch uptime data");
  return res.json();
}

export interface DockerContainer {
  id: string;
  name: string;
  status: string; // e.g., "running", "exited"
  image: string;
  ports?: string | null;
  cpu_percent?: number;
  mem_usage?: number;
  mem_percent?: number;
}

export async function fetchDockerStatus(): Promise<DockerContainer[]> {
  const res = await fetch("http://localhost:8000/api/docker");
  if (!res.ok) throw new Error("Failed to fetch docker status");
  return res.json();
}
