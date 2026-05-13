import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#ffffff,#f8fbff)] p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-900 lg:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            {description}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  tone?: "sky" | "emerald" | "amber" | "rose" | "violet";
};

const toneMap: Record<NonNullable<StatCardProps["tone"]>, string> = {
  sky: "bg-sky-50 text-sky-700 border-sky-100",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
  amber: "bg-amber-50 text-amber-700 border-amber-100",
  rose: "bg-rose-50 text-rose-700 border-rose-100",
  violet: "bg-violet-50 text-violet-700 border-violet-100",
};

export function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = "sky",
}: StatCardProps) {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-sm text-slate-600">{detail}</p>
        </div>
        <div
          className={`rounded-2xl border p-3 ${toneMap[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

type PanelProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Panel({
  title,
  description,
  action,
  children,
  className = "",
}: PanelProps) {
  return (
    <section className={`rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

type BadgeProps = {
  children: ReactNode;
  tone?: "sky" | "emerald" | "amber" | "rose" | "slate" | "violet";
};

export function Badge({ children, tone = "slate" }: BadgeProps) {
  const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
    sky: "bg-sky-50 text-sky-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    slate: "bg-slate-100 text-slate-700",
    violet: "bg-violet-50 text-violet-700",
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

type SimpleRow = {
  label: string;
  value: string;
  detail?: string;
  badge?: ReactNode;
};

export function InfoList({ rows }: { rows: SimpleRow[] }) {
  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div
          key={`${row.label}-${row.value}-${index}`}
          className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {row.label}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">{row.value}</p>
              {row.detail ? (
                <p className="mt-1 text-sm text-slate-500">{row.detail}</p>
              ) : null}
            </div>
            {row.badge}
          </div>
        </div>
      ))}
    </div>
  );
}

type DataTableColumn = {
  key: string;
  label: string;
};

type DataTableProps = {
  columns: DataTableColumn[];
  rows: Record<string, ReactNode>[];
};

export function DataTable({ columns, rows }: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((row, index) => (
              <tr key={`row-${index}`}>
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-4 text-sm text-slate-700">
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ActionButton({
  children,
  tone = "dark",
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  tone?: "dark" | "light";
  onClick?: () => void;
  disabled?: boolean;
}) {
  const styles =
    tone === "dark"
      ? "bg-slate-900 text-white hover:bg-slate-800"
      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${styles}`}
    >
      {children}
    </button>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
    </div>
  );
}
