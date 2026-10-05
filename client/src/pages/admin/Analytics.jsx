import { useEffect, useState } from "react";
import {
  Loader2,
  CalendarDays,
  CalendarRange,
  Calendar,
  Globe2,
  TrendingUp,
  FileText,
  MapPin,
  Clock,
  Eye,
  Users,
  LineChart,
  MoreHorizontal,
  Github,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import Card from "../../components/ui/Card";
import { fetchAnalyticsStats } from "../../services/adminAnalyticsService";

/* ---------------------------------------------------------------------------
   OPTIONAL FIELDS (not returned by fetchAnalyticsStats yet)
   The cards below render real data as soon as the API starts sending these,
   and show a short "not available yet" note until then (no made-up numbers):

   stats.today / thisWeek / thisMonth   .changePercent   -> "▲ 12% vs yesterday"
   stats.devices    [{ type, count, percent? }]           -> Device Type donut
   stats.referrers  [{ source, count, percent? }]         -> Top Referrers
   stats.traffic    { totalPageViews, uniqueVisitors,
                      avgPagesPerVisit, bounceRate,
                      avgSessionSeconds }                 -> Traffic Overview
   --------------------------------------------------------------------------- */

const TONES = {
  blue: { card: "from-blue-50 to-white border-blue-100", icon: "bg-blue-100 text-blue-600" },
  green: { card: "from-green-50 to-white border-green-100", icon: "bg-green-100 text-green-600" },
  purple: { card: "from-purple-50 to-white border-purple-100", icon: "bg-purple-100 text-purple-600" },
  orange: { card: "from-orange-50 to-white border-orange-100", icon: "bg-orange-100 text-orange-500" },
};

const RANK_STYLES = [
  "bg-blue-500 text-white",
  "bg-blue-100 text-blue-600",
  "bg-green-100 text-green-600",
  "bg-purple-100 text-purple-600",
  "bg-orange-100 text-orange-500",
];
const BAR_STYLES = ["bg-blue-600", "bg-blue-500", "bg-cyan-400", "bg-blue-400", "bg-blue-500"];
const DONUT_COLORS = ["#2563EB", "#60A5FA", "#BFDBFE", "#93C5FD", "#DBEAFE"];

function plural(n, word) {
  return `${n.toLocaleString()} ${word}${n === 1 ? "" : "s"}`;
}

function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.round(Number(totalSeconds) || 0));
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function percentOf(part, total) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

/** Icon tile + title + subtitle used at the top of every card. */
function SectionHeader({ icon: Icon, title, subtitle, right }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 text-brand">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-bold text-navy">{title}</p>
          <p className="text-sm text-muted">{subtitle}</p>
        </div>
      </div>
      {right}
    </div>
  );
}

function EmptyNote({ children }) {
  return <p className="py-6 text-center text-sm text-muted">{children}</p>;
}

function StatCard({ icon: Icon, label, visits, uniqueVisitors, changePercent, changeLabel, tone }) {
  const t = TONES[tone];
  const hasChange = typeof changePercent === "number";
  const up = hasChange && changePercent >= 0;
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-5 shadow-sm ${t.card}`}>
      <div className="flex items-start gap-4">
        <span className={`inline-flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl ${t.icon}`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted">{label} · Visits</p>
          <p className="mt-1 text-3xl font-extrabold leading-none text-navy">{visits.toLocaleString()}</p>
          <p className="mt-2 text-sm font-medium text-navy">{plural(uniqueVisitors, "unique visitor")}</p>
        </div>
      </div>
      {hasChange && (
        <p className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold ${up ? "text-success" : "text-danger"}`}>
          {up ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
          {Math.abs(changePercent)}%
          <span className="font-normal text-muted">{changeLabel}</span>
        </p>
      )}
    </div>
  );
}

/** "Nice" y-axis maximum and tick step for a given data maximum. */
function niceScale(max) {
  const safe = Math.max(1, max);
  const pow = 10 ** Math.floor(Math.log10(safe));
  const step = [1, 2, 5, 10].map((m) => m * pow).find((s) => safe / s <= 4) || 10 * pow;
  const top = Math.ceil(safe / step) * step;
  const ticks = [];
  for (let v = 0; v <= top; v += step) ticks.push(v);
  return { top, ticks };
}

function smoothPath(points) {
  if (points.length === 0) return "";
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const mx = (x0 + x1) / 2;
    d += ` C${mx},${y0} ${mx},${y1} ${x1},${y1}`;
  }
  return d;
}

function TrendChart({ dailyTrend }) {
  const [hover, setHover] = useState(null);

  const W = 800;
  const H = 300;
  const padL = 44;
  const padR = 16;
  const padT = 16;
  const padB = 36;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const n = dailyTrend.length;

  const { top, ticks } = niceScale(Math.max(1, ...dailyTrend.map((d) => d.visits)));
  const x = (i) => padL + (n <= 1 ? innerW / 2 : (i * innerW) / (n - 1));
  const y = (v) => padT + innerH * (1 - v / top);

  const visitPts = dailyTrend.map((d, i) => [x(i), y(d.visits)]);
  const uniquePts = dailyTrend.map((d, i) => [x(i), y(d.uniqueVisitors)]);
  const baseY = padT + innerH;
  const areaPath =
    n > 0 ? `${smoothPath(visitPts)} L${visitPts[n - 1][0]},${baseY} L${visitPts[0][0]},${baseY} Z` : "";
  const colW = n > 1 ? innerW / (n - 1) : innerW;

  const legend = (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted">
      <span className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Total Visits
      </span>
      <span className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-blue-300" /> Unique Visitors
      </span>
    </div>
  );

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 text-brand">
            <LineChart className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-bold text-navy">Last 14 Days</p>
            <p className="text-sm text-muted">Daily visits and unique visitors.</p>
          </div>
        </div>
        {legend}
      </div>

      {n === 0 ? (
        <EmptyNote>No visits recorded yet.</EmptyNote>
      ) : (
        // Scrolls sideways on small screens so labels stay readable.
        <div className="-mx-1 overflow-x-auto pb-1">
          <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full min-w-[620px]" role="img" aria-label="Daily visits chart">
            <defs>
              <linearGradient id="visitsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* grid + y labels */}
            {ticks.map((t) => (
              <g key={t}>
                <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="#E2E8F0" strokeDasharray="3 4" />
                <text x={padL - 10} y={y(t) + 4} textAnchor="end" fontSize="12" fill="#64748B">
                  {t}
                </text>
              </g>
            ))}

            {/* x labels */}
            {dailyTrend.map((day, i) => (
              <text key={day.date} x={x(i)} y={H - 12} textAnchor="middle" fontSize="11" fill="#64748B">
                {new Date(day.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </text>
            ))}

            {/* area + lines */}
            <path d={areaPath} fill="url(#visitsFill)" />
            <path d={smoothPath(uniquePts)} fill="none" stroke="#93B4F5" strokeWidth="2.5" strokeLinecap="round" />
            <path d={smoothPath(visitPts)} fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />

            {/* dots */}
            {visitPts.map(([px, py], i) => (
              <circle key={`v${i}`} cx={px} cy={py} r={hover === i ? 6 : 4} fill="#2563EB" stroke="#fff" strokeWidth="2" />
            ))}
            {uniquePts.map(([px, py], i) => (
              <circle key={`u${i}`} cx={px} cy={py} r="3.5" fill="#93B4F5" stroke="#fff" strokeWidth="1.5" />
            ))}

            {/* hover columns + tooltip */}
            {dailyTrend.map((day, i) => (
              <rect
                key={`h${day.date}`}
                x={x(i) - colW / 2}
                y={padT}
                width={colW}
                height={innerH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onTouchStart={() => setHover(i)}
              />
            ))}
            {hover !== null && dailyTrend[hover] && (
              <g pointerEvents="none">
                <line x1={x(hover)} x2={x(hover)} y1={padT} y2={baseY} stroke="#2563EB" strokeOpacity="0.25" />
                <g
                  transform={`translate(${Math.min(Math.max(x(hover) - 66, padL), W - padR - 132)}, ${Math.max(
                    padT,
                    y(dailyTrend[hover].visits) - 56
                  )})`}
                >
                  <rect width="132" height="44" rx="8" fill="#0F172A" />
                  <text x="10" y="18" fontSize="12" fill="#fff">
                    {dailyTrend[hover].visits} visits
                  </text>
                  <text x="10" y="35" fontSize="12" fill="#CBD5E1">
                    {dailyTrend[hover].uniqueVisitors} unique
                  </text>
                </g>
              </g>
            )}
          </svg>
        </div>
      )}
    </Card>
  );
}

function TopPages({ topPages, monthTotal }) {
  return (
    <Card className="h-full p-5 sm:p-6">
      <SectionHeader icon={FileText} title="Top Pages" subtitle="Most visited pages this month." />

      {topPages.length === 0 ? (
        <EmptyNote>No visits recorded yet this month.</EmptyNote>
      ) : (
        <ul className="space-y-4">
          {topPages.map((page, i) => {
            const pct = percentOf(page.visits, monthTotal);
            return (
              <li key={page.path} className="flex items-center gap-3">
                <span
                  className={`inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                    RANK_STYLES[i % RANK_STYLES.length]
                  }`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-navy">{page.path}</p>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${BAR_STYLES[i % BAR_STYLES.length]}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
                <span className="w-10 flex-shrink-0 text-right text-sm font-bold text-navy">
                  {page.visits.toLocaleString()}
                </span>
                <span className="w-10 flex-shrink-0 text-right text-sm text-muted">{pct}%</span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function DeviceType({ devices }) {
  const list = Array.isArray(devices) ? devices : null;
  const total = list ? list.reduce((sum, d) => sum + d.count, 0) : 0;
  const r = 54;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <Card className="h-full p-5 sm:p-6">
      <SectionHeader icon={Globe2} title="Device Type" subtitle="Visitors by device category." />
      {!list || list.length === 0 ? (
        <EmptyNote>Device data isn&apos;t tracked yet.</EmptyNote>
      ) : (
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
          <div className="relative h-40 w-40 flex-shrink-0">
            <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
              <circle cx="70" cy="70" r={r} fill="none" stroke="#EEF2FF" strokeWidth="18" />
              {list.map((d, i) => {
                const len = total > 0 ? (d.count / total) * c : 0;
                const seg = (
                  <circle
                    key={d.type}
                    cx="70"
                    cy="70"
                    r={r}
                    fill="none"
                    stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
                    strokeWidth="18"
                    strokeDasharray={`${len} ${c - len}`}
                    strokeDashoffset={-offset}
                  />
                );
                offset += len;
                return seg;
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-navy">{total.toLocaleString()}</span>
              <span className="text-xs text-muted">Total Visits</span>
            </div>
          </div>
          <ul className="w-full max-w-[14rem] space-y-3">
            {list.map((d, i) => (
              <li key={d.type} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2.5 text-navy">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
                  />
                  {d.type}
                </span>
                <span className="font-semibold text-navy">{d.percent ?? percentOf(d.count, total)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

/** Small brand mark for a referrer source. */
function ReferrerIcon({ source }) {
  const key = source.toLowerCase();
  if (key.includes("direct") || key.includes("none")) return <Globe2 className="h-5 w-5 text-slate-500" />;
  if (key.includes("google")) {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 text-[11px] font-bold text-[#4285F4]">
        G
      </span>
    );
  }
  if (key.includes("linkedin")) {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#0A66C2] text-[10px] font-bold text-white">
        in
      </span>
    );
  }
  if (key.includes("github")) return <Github className="h-5 w-5 text-navy" />;
  return <MoreHorizontal className="h-5 w-5 text-slate-400" />;
}

function TopReferrers({ referrers }) {
  const list = Array.isArray(referrers) ? referrers : null;
  const total = list ? list.reduce((sum, r) => sum + r.count, 0) : 0;
  return (
    <Card className="h-full p-5 sm:p-6">
      <SectionHeader icon={MapPin} title="Top Referrers" subtitle="Where your visitors are coming from." />
      {!list || list.length === 0 ? (
        <EmptyNote>Referrer data isn&apos;t tracked yet.</EmptyNote>
      ) : (
        <ul className="space-y-4">
          {list.map((ref) => (
            <li key={ref.source} className="flex items-center gap-3 text-sm">
              <ReferrerIcon source={ref.source} />
              <span className="min-w-0 flex-1 truncate text-navy">{ref.source}</span>
              <span className="w-10 text-right font-semibold text-navy">{ref.count.toLocaleString()}</span>
              <span className="w-10 text-right text-muted">{ref.percent ?? percentOf(ref.count, total)}%</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function TrafficOverview({ traffic }) {
  const rows = traffic
    ? [
        { icon: Eye, label: "Total Page Views", value: Number(traffic.totalPageViews).toLocaleString() },
        { icon: Users, label: "Unique Visitors", value: Number(traffic.uniqueVisitors).toLocaleString() },
        { icon: FileText, label: "Avg. Pages per Visit", value: traffic.avgPagesPerVisit },
        { icon: TrendingUp, label: "Bounce Rate", value: `${traffic.bounceRate}%` },
        { icon: Clock, label: "Avg. Session Duration", value: formatDuration(traffic.avgSessionSeconds) },
      ]
    : null;

  return (
    <Card className="h-full p-5 sm:p-6">
      <SectionHeader icon={Clock} title="Traffic Overview" subtitle="Quick insights about your website traffic." />
      {!rows ? (
        <EmptyNote>Traffic insights aren&apos;t tracked yet.</EmptyNote>
      ) : (
        <ul className="space-y-4">
          {rows.map((row) => (
            <li key={row.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-3 text-navy">
                <row.icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
                {row.label}
              </span>
              <span className="font-bold text-navy">{row.value}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function Analytics() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsStats()
      .then(setStats)
      .catch(() => setError("Couldn't load analytics."));
  }, []);

  if (error) return <p className="text-danger">{error}</p>;
  if (!stats) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">Website Visitor Analytics</h1>
      <p className="mb-6 text-muted sm:mb-8">
        Visits are counted from the public site only (not the student or admin areas), using an anonymous
        browser cookie to identify unique visitors.
      </p>

      <div className="mb-6 grid gap-4 xs:grid-cols-2 xl:grid-cols-4 sm:gap-6">
        <StatCard icon={CalendarDays} label="Today" tone="blue" changeLabel="vs yesterday" {...stats.today} />
        <StatCard icon={CalendarRange} label="This Week" tone="green" changeLabel="vs last week" {...stats.thisWeek} />
        <StatCard icon={Calendar} label="This Month" tone="purple" changeLabel="vs last month" {...stats.thisMonth} />
        <StatCard icon={Globe2} label="All Time" tone="orange" {...stats.allTime} />
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-[1.7fr,1fr]">
        <div className="min-w-0">
          <TrendChart dailyTrend={stats.dailyTrend} />
        </div>
        <div className="min-w-0">
          <TopPages topPages={stats.topPages} monthTotal={stats.thisMonth.visits} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <DeviceType devices={stats.devices} />
        <TopReferrers referrers={stats.referrers} />
        <div className="lg:col-span-2 xl:col-span-1">
          <TrafficOverview traffic={stats.traffic} />
        </div>
      </div>
    </div>
  );
}

export default Analytics;
