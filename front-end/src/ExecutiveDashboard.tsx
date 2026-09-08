import React, { useId, useMemo, useRef, useState, useLayoutEffect } from "react";
import { Box, Paper, Typography, Avatar, Divider } from "@mui/material";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import type { Training } from "./App";

interface ExecutiveDashboardProps {
  trainings: Training[];
}

interface ChartSeries {
  name: string;
  color: string;
  values: number[];
}

interface CardTrend {
  data: number[];
  deltaPct: number | null;
  periodLabel: string;
}

const Sparkline: React.FC<{ data: number[]; color?: string }> = ({
  data,
  color = "#6846C6",
}) => {
  const gradientId = useId();
  const width = 120;
  const height = 40;
  const padding = 4;

  if (data.length === 0) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const stepX = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;
  const lastIndex = data.length - 1;

  const xOf = (i: number) => padding + i * stepX;
  const yOf = (v: number) =>
    height - padding - ((v - min) / range) * (height - padding * 2);

  const linePoints = data.map((v, i) => `${xOf(i)},${yOf(v)}`).join(" ");
  const areaPoints = `${xOf(0)},${height - padding} ${linePoints} ${xOf(
    lastIndex
  )},${height - padding}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Trend of completions over recent months"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradientId})`} />
      <polyline
        points={linePoints}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={xOf(lastIndex)} cy={yOf(data[lastIndex])} r={3} fill={color} />
    </svg>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
  trend?: CardTrend;
}> = ({ icon, label, value, accent, trend }) => (
  <Paper
    elevation={0}
    sx={{
      flex: "1 1 240px",
      p: 1.75,
      borderRadius: 3,
      border: "1px solid #E7E3F1",
      boxShadow: "0 4px 24px rgba(0, 106, 113, 0.12)",
      background: "#ffffff",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Avatar sx={{ bgcolor: accent, width: 40, height: 40 }}>{icon}</Avatar>
      <Box>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, color: "#2d2540", lineHeight: 1.1 }}
        >
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: "#6b7280", fontWeight: 600 }}>
          {label}
        </Typography>
      </Box>
    </Box>

    {trend && trend.data.length > 0 && (
      <>
        <Divider sx={{ my: 1 }} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {trend.deltaPct === null || trend.deltaPct === 0 ? (
                <TrendingFlatIcon sx={{ fontSize: 16, color: "#6b7280" }} />
              ) : trend.deltaPct > 0 ? (
                <ArrowUpwardIcon sx={{ fontSize: 16, color: "#2e7d32" }} />
              ) : (
                <ArrowDownwardIcon sx={{ fontSize: 16, color: "#c62828" }} />
              )}
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color:
                    trend.deltaPct === null || trend.deltaPct === 0
                      ? "#6b7280"
                      : trend.deltaPct > 0
                      ? "#2e7d32"
                      : "#c62828",
                }}
              >
                {trend.deltaPct === null
                  ? "No prior data"
                  : `${trend.deltaPct > 0 ? "+" : ""}${trend.deltaPct}%`}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: "#94a3b8" }}>
              {trend.periodLabel}
            </Typography>
          </Box>
          <Sparkline data={trend.data} color={accent} />
        </Box>
      </>
    )}
  </Paper>
);

const MultiSeriesTrendChart: React.FC<{
  categories: string[];
  series: ChartSeries[];
}> = ({ categories, series }) => {
  // Measure the wrapper so the chart always renders at 100% of the space
  // its container gives it, instead of a fixed pixel size.
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [{ width, height }, setSize] = useState({ width: 900, height: 220 });
  // Clicking a legend entry isolates that series and switches the others
  // off; clicking it again (or when nothing is isolated) shows all series.
  const [soloSeries, setSoloSeries] = useState<string | null>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSize({ width: rect.width, height: rect.height });
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const margin = { top: 16, right: 32, bottom: 72, left: 48 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const formatDate = (iso: string) => {
    // categories are "YYYY-MM" month buckets
    const d = new Date(`${iso}-01`);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
  };

  if (categories.length === 0) {
    return (
      <Box sx={{ py: 3, textAlign: "center", color: "#94a3b8" }}>
        <Typography variant="body1">
          No training records with an end date yet.
        </Typography>
      </Box>
    );
  }

  const visibleSeries = soloSeries
    ? series.filter((s) => s.name === soloSeries)
    : series;
  const primaryName = series[0]?.name;

  const maxCount = Math.max(1, ...visibleSeries.flatMap((s) => s.values));
  const yMax = Math.max(4, Math.ceil(maxCount * 1.2));
  const stepX =
    categories.length > 1 ? innerWidth / (categories.length - 1) : 0;

  const xOf = (i: number) =>
    categories.length === 1 ? innerWidth / 2 : i * stepX;
  const yOf = (v: number) => innerHeight - (v / yMax) * innerHeight;

  // Turns a list of points into a smooth, wave-like SVG path (Catmull-Rom
  // style curve through each point) instead of straight line segments.
  const buildWavePath = (points: [number, number][]) => {
    if (points.length === 0) return "";
    if (points.length === 1) return `M ${points[0][0]},${points[0][1]}`;
    const smoothing = 0.2;
    let d = `M ${points[0][0]},${points[0][1]}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];
      const cp1x = p1[0] + (p2[0] - p0[0]) * smoothing;
      const cp1y = p1[1] + (p2[1] - p0[1]) * smoothing;
      const cp2x = p2[0] - (p3[0] - p1[0]) * smoothing;
      const cp2y = p2[1] - (p3[1] - p1[1]) * smoothing;
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
    }
    return d;
  };

  const gridLines = 2;
  const yTicks = Array.from({ length: gridLines + 1 }, (_, i) =>
    Math.round((yMax / gridLines) * i)
  );

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <Box sx={{ display: "flex", gap: 3, mb: 1.5, flexWrap: "wrap", flex: "0 0 auto" }}>
        {series.map((s) => {
          const isActive = !soloSeries || soloSeries === s.name;
          return (
            <Box
              key={s.name}
              onClick={() =>
                setSoloSeries((prev) => (prev === s.name ? null : s.name))
              }
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                userSelect: "none",
                opacity: isActive ? 1 : 0.35,
                transition: "opacity 0.15s ease",
              }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: s.color,
                }}
              />
              <Typography variant="body2" sx={{ color: "#4A5568", fontWeight: 600 }}>
                {s.name}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Box
        ref={containerRef}
        sx={{ width: "100%", flex: "1 1 auto", minHeight: 0 }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          role="img"
          aria-label="Line chart of training completions and in-progress trainings over time"
        >
          <defs>
            <linearGradient id="execTrendFill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={
                  (soloSeries
                    ? series.find((s) => s.name === soloSeries)?.color
                    : series[0]?.color) ?? "#6846C6"
                }
                stopOpacity={0.3}
              />
              <stop
                offset="100%"
                stopColor={
                  (soloSeries
                    ? series.find((s) => s.name === soloSeries)?.color
                    : series[0]?.color) ?? "#6846C6"
                }
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <g transform={`translate(${margin.left},${margin.top})`}>
            {yTicks.map((t) => (
              <g key={t}>
                <line
                  x1={0}
                  x2={innerWidth}
                  y1={yOf(t)}
                  y2={yOf(t)}
                  stroke="#E7E3F1"
                  strokeWidth={1}
                />
                <text
                  x={-10}
                  y={yOf(t)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={12}
                  fill="#6b7280"
                >
                  {t}
                </text>
              </g>
            ))}

            {visibleSeries.map((s) => {
              const isPrimary = s.name === primaryName;
              const points: [number, number][] = s.values.map((v, i) => [
                xOf(i),
                yOf(v),
              ]);
              const linePath = buildWavePath(points);
              // Isolating a series via the legend always fills it in, since
              // it's the only line on the chart; otherwise only the primary
              // ("Completed") series gets the area fill.
              const showArea = soloSeries ? s.name === soloSeries : isPrimary;
              const areaPath =
                showArea && points.length > 1
                  ? `M ${points[0][0]},${innerHeight} L ${points[0][0]},${
                      points[0][1]
                    } ${linePath.slice(linePath.indexOf("C"))} L ${
                      points[points.length - 1][0]
                    },${innerHeight} Z`
                  : null;
              return (
                <g key={s.name}>
                  {areaPath && (
                    <path d={areaPath} fill="url(#execTrendFill)" stroke="none" />
                  )}
                  <path
                    d={linePath}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={3}
                    strokeDasharray={isPrimary ? undefined : "6 4"}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {s.values.map((v, i) => (
                    <circle
                      key={`${s.name}-${categories[i]}`}
                      cx={xOf(i)}
                      cy={yOf(v)}
                      r={5}
                      fill="#ffffff"
                      stroke={s.color}
                      strokeWidth={3}
                    >
                      <title>{`${s.name} • ${formatDate(categories[i])}: ${v}`}</title>
                    </circle>
                  ))}
                </g>
              );
            })}

            {categories.map((c, i) => (
              <text
                key={c}
                x={xOf(i)}
                y={innerHeight + 18}
                textAnchor="end"
                fontSize={12}
                fill="#6b7280"
                transform={`rotate(-35 ${xOf(i)} ${innerHeight + 18})`}
              >
                {formatDate(c)}
              </text>
            ))}

            <line
              x1={0}
              y1={innerHeight}
              x2={innerWidth}
              y2={innerHeight}
              stroke="#D9D2EC"
              strokeWidth={1}
            />
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={innerHeight}
              stroke="#D9D2EC"
              strokeWidth={1}
            />
          </g>
        </svg>
      </Box>
    </Box>
  );
};

// Counts trainings of a given status by their end-date month, oldest first.
const buildMonthlyCounts = (trainings: Training[], status: string) => {
  const map = new Map<string, number>();
  trainings.forEach((t) => {
    if (t.status === status && t.endDate) {
      const d = new Date(t.endDate);
      if (!Number.isNaN(d.getTime())) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
        map.set(key, (map.get(key) || 0) + 1);
      }
    }
  });
  return Array.from(map.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

// Turns monthly counts into the sparkline data + month-over-month delta
// shown on a StatCard.
const buildCardTrend = (
  monthly: { month: string; count: number }[]
): CardTrend => {
  const recent = monthly.slice(-6);
  const formatMonth = (key: string) => {
    const [y, m] = key.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    });
  };

  if (recent.length < 2) {
    return {
      data: recent.map((m) => m.count),
      deltaPct: null,
      periodLabel: "Not enough history yet",
    };
  }

  const prev = recent[recent.length - 2].count;
  const curr = recent[recent.length - 1].count;
  const deltaPct =
    prev > 0 ? Math.round(((curr - prev) / prev) * 100) : curr > 0 ? 100 : 0;

  return {
    data: recent.map((m) => m.count),
    deltaPct,
    periodLabel: `${formatMonth(
      recent[recent.length - 2].month
    )} vs ${formatMonth(recent[recent.length - 1].month)}`,
  };
};

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  trainings,
}) => {
  const inProgressCount = useMemo(
    () => trainings.filter((t) => t.status === "In Progress").length,
    [trainings]
  );
  const completedCount = useMemo(
    () => trainings.filter((t) => t.status === "Completed").length,
    [trainings]
  );
  const notStartedCount = useMemo(
    () => trainings.filter((t) => t.status === "Not Started").length,
    [trainings]
  );

  // Completed vs. In Progress vs. Not Started counts, grouped by training end
  // month, so all three statuses can be compared on the same timeline.
  const trendSeries = useMemo(() => {
    const completedMap = new Map<string, number>();
    const inProgressMap = new Map<string, number>();
    const notStartedMap = new Map<string, number>();
    trainings.forEach((t) => {
      if (!t.endDate) return;
      const key = t.endDate.slice(0, 7); // YYYY-MM
      if (t.status === "Completed") {
        completedMap.set(key, (completedMap.get(key) || 0) + 1);
      } else if (t.status === "In Progress") {
        inProgressMap.set(key, (inProgressMap.get(key) || 0) + 1);
      } else if (t.status === "Not Started") {
        notStartedMap.set(key, (notStartedMap.get(key) || 0) + 1);
      }
    });

    const categories = Array.from(
      new Set(
        Array.from(completedMap.keys())
          .concat(Array.from(inProgressMap.keys()))
          .concat(Array.from(notStartedMap.keys()))
      )
    ).sort((a, b) => a.localeCompare(b));

    const series: ChartSeries[] = [
      {
        name: "Completed",
        color: "#6846C6",
        values: categories.map((d) => completedMap.get(d) || 0),
      },
      {
        name: "In Progress",
        color: "#887bab",
        values: categories.map((d) => inProgressMap.get(d) || 0),
      },
      {
        name: "Not Started",
        color: "#4299e1",
        values: categories.map((d) => notStartedMap.get(d) || 0),
      },
    ];

    return { categories, series };
  }, [trainings]);

  // Per-status counts grouped by (end date) month, used to show how each
  // status this month compares with the past few months on its card.
  const notStartedTrend = useMemo<CardTrend>(
    () => buildCardTrend(buildMonthlyCounts(trainings, "Not Started")),
    [trainings]
  );
  const inProgressTrend = useMemo<CardTrend>(
    () => buildCardTrend(buildMonthlyCounts(trainings, "In Progress")),
    [trainings]
  );
  const completedTrend = useMemo<CardTrend>(
    () => buildCardTrend(buildMonthlyCounts(trainings, "Completed")),
    [trainings]
  );

  return (
    <Box
      sx={{
        pb: 1,
        height: "100%",
        maxHeight: "calc(100vh - 200px)",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
      }}
    >
      <Box sx={{ width: "100%", mt: 0, mb: 1.5, flex: "0 0 auto" }}>
        <Typography variant="h6" sx={{ color: "#6846C6", fontWeight: 700 }}>
          Executive Training Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: "#6b7280" }}>
          A high-level snapshot of training progress across the organization
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mb: 1.5,
          flex: "0 0 auto",
        }}
      >
        <StatCard
          icon={<PendingActionsIcon />}
          label="Trainings Not Started"
          value={notStartedCount}
          accent="#4299e1"
          trend={notStartedTrend}
        />
        <StatCard
          icon={<HourglassBottomIcon />}
          label="Trainings In Progress"
          value={inProgressCount}
          accent="#887bab"
          trend={inProgressTrend}
        />
        <StatCard
          icon={<CheckCircleIcon />}
          label="Trainings Completed"
          value={completedCount}
          accent="#6846C6"
          trend={completedTrend}
        />
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          border: "1px solid #E7E3F1",
          boxShadow: "0 4px 24px rgba(0, 106, 113, 0.12)",
          background: "#ffffff",
          flex: "1 1 auto",
          minHeight: 360,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, flex: "0 0 auto" }}>
          <ShowChartIcon sx={{ color: "#6846C6" }} />
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: "#2d2540" }}
          >
            Course Progress Over Time
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "#6b7280", mb: 1, flex: "0 0 auto" }}>
          Number of employees completed vs. still in progress, grouped by
          training end month
        </Typography>
        <Box sx={{ flex: "1 1 auto", minHeight: 240 }}>
          <MultiSeriesTrendChart
            categories={trendSeries.categories}
            series={trendSeries.series}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default ExecutiveDashboard;
