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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function fetchSystem(): Promise<SystemStatsData> {
  const res = await fetch(`${API_BASE_URL}/api/system`);
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
  const res = await fetch(`${API_BASE_URL}/api/uptime`);
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
  net_rx?: number;
  net_tx?: number;
  blk_read?: number;
  blk_write?: number;
}

export async function fetchDockerStatus(): Promise<DockerContainer[]> {
  const res = await fetch(`${API_BASE_URL}/api/docker`);
  if (!res.ok) throw new Error("Failed to fetch docker status");
  return res.json();
}

export interface ContainerLogsResponse {
  logs: string;
}

export async function fetchContainerLogs(containerId: string, tail = 100): Promise<ContainerLogsResponse> {
  const res = await fetch(`${API_BASE_URL}/api/docker/${containerId}/logs?tail=${tail}`);
  if (!res.ok) throw new Error("Failed to fetch container logs");
  return res.json();
}

export async function startContainer(containerId: string): Promise<{success: boolean; message: string}> {
  const res = await fetch(`${API_BASE_URL}/api/docker/${containerId}/start`, { method: "POST" });
  return res.json();
}

export async function stopContainer(containerId: string): Promise<{success: boolean; message: string}> {
  const res = await fetch(`${API_BASE_URL}/api/docker/${containerId}/stop`, { method: "POST" });
  return res.json();
}

export async function restartContainer(containerId: string): Promise<{success: boolean; message: string}> {
  const res = await fetch(`${API_BASE_URL}/api/docker/${containerId}/restart`, { method: "POST" });
  return res.json();
}

export interface ContainerDetails {
  id: string;
  name: string;
  image: string;
  created: string;
  status: string;
  command?: string[];
  env?: string[];
  labels?: Record<string, string>;
  working_dir?: string;
  entrypoint?: string[];
  restart_policy?: Record<string, unknown>;
  network_mode?: string;
  mounts?: Record<string, unknown>[];
  error?: string;
}

export async function fetchContainerDetails(containerId: string): Promise<ContainerDetails> {
  const res = await fetch(`${API_BASE_URL}/api/docker/${containerId}/details`);
  if (!res.ok) throw new Error("Failed to fetch container details");
  return res.json();
}
