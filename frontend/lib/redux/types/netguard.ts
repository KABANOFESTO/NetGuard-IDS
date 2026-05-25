export type UserRole = "Admin" | "Guest" | "Lecturer" | "Student";
export type UserStatus = "Active" | "Inactive";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  profile_picture: string | null;
  profile_picture_url: string | null;
  employee_id: string | null;
  telephone: string | null;
  location: string | null;
  bachelor_degree: string | null;
  is_active: boolean;
  can_delete?: boolean;
  can_toggle_active?: boolean;
}

export interface AuthResponse {
  refresh: string;
  access: string;
  user: AuthUser;
}

export interface Device {
  id: number;
  owner: number | null;
  owner_email: string | null;
  owner_name: string | null;
  device_name: string;
  device_type: "laptop" | "desktop" | "mobile" | "tablet" | "iot" | "other";
  ip_address: string;
  mac_address: string;
  operating_system: string | null;
  status: "active" | "blocked" | "suspicious" | "unknown";
  is_registered: boolean;
  registration_notes: string;
  blocked_at: string | null;
  last_seen: string;
  created_at: string;
}

export interface DeviceSummary {
  total_devices: number;
  active_devices: number;
  blocked_devices: number;
  suspicious_devices: number;
  unknown_devices: number;
  unregistered_devices: number;
}

export interface IntrusionAlert {
  id: number;
  user: number | null;
  user_email: string | null;
  device: number | null;
  device_name: string | null;
  source_activity: number | null;
  assigned_to: number | null;
  assigned_to_email: string | null;
  alert_type:
    | "unauthorized_access"
    | "multiple_login_attempts"
    | "unknown_device"
    | "abnormal_activity";
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "pending" | "investigating" | "resolved" | "ignored";
  detected_at: string;
  resolved_at: string | null;
  metadata: Record<string, unknown>;
}

export interface AlertSummary {
  total_alerts: number;
  pending_alerts: number;
  critical_alerts: number;
  unknown_device_alerts: number;
}

export interface NetworkActivity {
  id: number;
  user: number | null;
  user_email: string | null;
  device: number | null;
  device_name: string | null;
  activity_type:
    | "login"
    | "login_attempt"
    | "logout"
    | "session_start"
    | "session_end"
    | "file_access"
    | "restricted_access"
    | "download"
    | "upload"
    | "network_scan"
    | "configuration_change";
  description: string;
  ip_address: string;
  outcome: "success" | "failed" | "blocked" | "restricted";
  destination: string;
  metadata: Record<string, unknown>;
  data_usage_mb: number;
  is_suspicious: boolean;
  timestamp: string;
}

export interface DashboardMetric {
  total: number;
  suspicious?: number;
  failed_logins?: number;
  data_usage_mb?: number;
  critical?: number;
  pending?: number;
  investigating?: number;
  blocked?: number;
  unknown?: number;
}

export interface MonitoringDashboard {
  time_window: string;
  activities: DashboardMetric;
  alerts: DashboardMetric;
  devices: DashboardMetric;
  top_activity_types: Array<{
    activity_type: string;
    total: number;
  }>;
}

export interface MonitoringReport {
  period_days: number;
  activity_summary: {
    total_activities: number;
    suspicious_activities: number;
    total_data_usage_mb: number;
  };
  alert_summary: {
    total_alerts: number;
    resolved_alerts: number;
    unresolved_alerts: number;
  };
  top_users: Array<{
    user__id: number;
    user__email: string;
    total: number;
  }>;
  top_devices: Array<{
    device__id: number;
    device__device_name: string;
    total: number;
  }>;
}

export interface SecurityBlock {
  id: number;
  user: number | null;
  user_email: string | null;
  device: number | null;
  device_name: string | null;
  reason: "intrusion" | "suspicious_activity" | "manual_block";
  blocked_by: number | null;
  blocked_by_email: string | null;
  blocked_at: string;
  unblocked_at: string | null;
  expires_at: string | null;
  notes: string;
  is_active: boolean;
}

export interface AuditLog {
  id: number;
  user: string | null;
  action: string;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
  target_user: string | null;
  additional_data: Record<string, unknown> | null;
}
