export function formatDateTime(value?: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatCompactDate(value?: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function formatNumber(value?: number | null) {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

export function formatDataUsage(value?: number | null) {
  const usage = value ?? 0;

  if (usage >= 1024) {
    return `${(usage / 1024).toFixed(2)} GB`;
  }

  return `${usage.toFixed(0)} MB`;
}

export function statusTone(value?: string | null) {
  switch (value) {
    case "critical":
    case "blocked":
    case "Inactive":
    case "unknown":
      return "rose" as const;
    case "high":
    case "pending":
    case "suspicious":
      return "amber" as const;
    case "resolved":
    case "success":
    case "Active":
    case "active":
      return "emerald" as const;
    case "investigating":
    case "restricted":
      return "violet" as const;
    default:
      return "sky" as const;
  }
}
