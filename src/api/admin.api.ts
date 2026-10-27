import { api } from "../lib/api";

export type Role = "USER" | "ADMIN";

export interface CurrentAdminUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  avatarUrl?: string | null;
  isActive: boolean;
  twoFactorEnabled: boolean;
}

export interface OverviewKpis {
  totalUsers: number;
  adminCount: number;
  activeUsers: number;
  lockedUsers: number;
  twoFactorCount: number;
  twoFactorRate: number;
  totalChatSessions: number;
  totalChatMessages: number;
  totalActiveSessions: number;
}

export interface SystemHealth {
  database: {
    status: string;
    latencyMs: number;
  };
  aiEngine: {
    status: string;
    type: string;
  };
  system: {
    nodeVersion: string;
    platform: string;
    uptimeSeconds: number;
    memoryRssMb: number;
    memoryHeapUsedMb: number;
    freeMemMb: number;
    totalMemMb: number;
    environment: string;
    port: number | string;
  };
}

export interface TimeSeriesPoint {
  date: string;
  label: string;
  newUsers: number;
  activeSessions: number;
  chatMessages: number;
  visionScans: number;
}

export interface SpeciesShare {
  name: string;
  scientificName: string;
  count: number;
  percentage: number;
  color: string;
}

export interface AnalyticsData {
  timeSeries: TimeSeriesPoint[];
  speciesDistribution: SpeciesShare[];
  hourlyActivity: Array<{ hour: string; queries: number }>;
  radarMetrics: Array<{ subject: string; score: number; fullMark: number }>;
  summary: {
    weeklyGrowthRate: number;
    avgDailyActiveUsers: number;
    peakHour: string;
    dominantSpecies: string;
    successRate: number;
  };
}

export interface OverviewData {
  kpis: OverviewKpis;
  health: SystemHealth;
  analytics?: AnalyticsData;
  recentUsers: Array<{
    id: string;
    email: string;
    name: string | null;
    role: Role;
    isActive: boolean;
    createdAt: string;
  }>;
  recentSessions: Array<{
    id: string;
    deviceId: string;
    deviceName: string | null;
    ip: string | null;
    lastUsedAt: string;
    user: {
      id: string;
      email: string;
      name: string | null;
      role: Role;
    };
  }>;
}

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: Role;
  isActive: boolean;
  twoFactorEnabled: boolean;
  twoFactorMethod: string;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    sessions: number;
    chatSessions: number;
    oauthAccounts: number;
  };
}

export interface UserListResponse {
  items: UserRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SessionRow {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string | null;
  userAgent: string | null;
  ip: string | null;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  revokedAt: string | null;
  revokedReason: string | null;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: Role;
  };
}

export interface ChatSessionRow {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  _count: {
    messages: number;
  };
}

export interface ShrimpSpecies {
  id: string;
  name: string;
  scientificName: string;
  description: string;
  typicalSize: string;
}

export interface ShrimpTestResult {
  success: boolean;
  species: string;
  scientificName: string;
  confidence: number;
  sizeEstimate: string;
  commercialGrade: string;
  description: string;
  abnormalDetected: boolean;
  alerts: string[];
  modelStatus: string;
  processingTime: string;
  imageDimensions: string;
  analyzedAt: string;
  diagnostics: {
    serverExecutionMs: number;
    receivedFilename: string;
    fileSizeKb: number;
    mimeType: string;
  };
}

export const adminApi = {
  // Auth
  login: (data: { email: string; password: string }) =>
    api.post<{ user: CurrentAdminUser; accessToken: string }>("/auth/login", data).then((r) => r.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
  me: () => api.get<CurrentAdminUser>("/users/profile").then((r) => r.data),

  // Overview
  getOverview: () => api.get<OverviewData>("/admin/overview").then((r) => r.data),

  // Users
  getUsers: (params?: { q?: string; role?: string; status?: string; page?: number; limit?: number }) =>
    api.get<UserListResponse>("/admin/users", { params }).then((r) => r.data),
  getUserDetail: (id: string) => api.get<any>(`/admin/users/${id}`).then((r) => r.data),
  createUser: (data: { email: string; password: string; name?: string; role?: Role }) =>
    api.post<UserRow>("/admin/users", data).then((r) => r.data),
  setUserRole: (id: string, role: Role) =>
    api.patch(`/admin/users/${id}/role`, { role }).then((r) => r.data),
  setUserStatus: (id: string, isActive: boolean) =>
    api.patch(`/admin/users/${id}/status`, { isActive }).then((r) => r.data),
  resetUserPassword: (id: string, newPassword: string) =>
    api.post(`/admin/users/${id}/reset-password`, { newPassword }).then((r) => r.data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`).then((r) => r.data),
  revokeAllUserSessions: (id: string) =>
    api.post(`/admin/users/${id}/revoke-sessions`).then((r) => r.data),

  // Sessions
  getSessions: () => api.get<SessionRow[]>("/admin/sessions").then((r) => r.data),
  revokeSession: (id: string) => api.delete(`/admin/sessions/${id}`).then((r) => r.data),

  // Chat
  getChatSessions: () => api.get<ChatSessionRow[]>("/admin/chat/sessions").then((r) => r.data),
  deleteChatSession: (id: string) => api.delete(`/admin/chat/sessions/${id}`).then((r) => r.data),

  // Shrimp AI
  getShrimpSpecies: () => api.get<ShrimpSpecies[]>("/admin/shrimp/species").then((r) => r.data),
  testAnalyze: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<ShrimpTestResult>("/admin/shrimp/test-analyze", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },
};
