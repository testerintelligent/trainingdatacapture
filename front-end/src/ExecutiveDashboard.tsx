import React, { useMemo } from "react";
import { Box, Paper, Typography, Avatar } from "@mui/material";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import type { Training } from "./App";

interface ExecutiveDashboardProps {
  trainings: Training[];
}

interface TrendPoint {
  date: string; // ISO yyyy-mm-dd
  count: number;
}

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
}> = ({ icon, label, value, accent }) => (
  <Paper
    elevation={0}
    sx={{
      flex: "1 1 240px",
      display: "flex",
      alignItems: "center",
      gap: 2.5,
      p: 3,
      borderRadius: 3,
      border: "1px solid #E5EEEF",
      boxShadow: "0 4px 24px rgba(0, 106, 113, 0.12)",
      background: "#ffffff",
    }}
  >
    <Avatar sx={{ bgcolor: accent, width: 56, height: 56 }}>{icon}</Avatar>
    <Box>
      <Typography
        variant="h3"
        sx={{ fontWeight: 800, color: "#2d2540", lineHeight: 1.1 }}
      >
        {value}
      </Typography>
      <Typography variant="body1" sx={{ color: "#6b7280", fontWeight: 600 }}>
        {label}
      </Typography>
    </Box>
  </Paper>
);

const CompletionTrendChart: React.FC<{ data: TrendPoint[] }> = ({ data }) => {
  const width = 900;
  const height = 340;
  const margin = { top: 24, right: 32, bottom: 64, left: 48 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  if (data.length === 0) {
    return (
      <Box sx={{ py: 8, textAlign: "center", color: "#94a3b8" }}>
        <Typography variant="body1">
          No completed training records yet.
        </Typography>
      </Box>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count));
  const yMax = Math.max(4, Math.ceil(maxCount * 1.2));
  const stepX = data.length > 1 ? innerWidth / (data.length - 1) : 0;

  const xOf = (i: number) => (data.length === 1 ? innerWidth / 2 : i * stepX);
  const yOf = (v: number) => innerHeight - (v / yMax) * innerHeight;

  const linePoints = data.map((d, i) => `${xOf(i)},${yOf(d.count)}`).join(" ");
  const areaPoints = `${xOf(0)},${innerHeight} ${linePoints} ${xOf(
    data.length - 1
  )},${innerHeight}`;

  const gridLines = 4;
  const yTicks = Array.from({ length: gridLines + 1 }, (_, i) =>
    Math.round((yMax / gridLines) * i)
  );

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label="Line chart of training completions over time"
      >
        <defs>
          <linearGradient id="execTrendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6846C6" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#6846C6" stopOpacity={0} />
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
                stroke="#E5EEEF"
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

          <polygon points={areaPoints} fill="url(#execTrendFill)" />
          <polyline
            points={linePoints}
            fill="none"
            stroke="#6846C6"
            strokeWidth={3}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {data.map((d, i) => (
            <g key={d.date}>
              <circle
                cx={xOf(i)}
                cy={yOf(d.count)}
                r={5}
                fill="#ffffff"
                stroke="#6846C6"
                strokeWidth={3}
              >
                <title>{`${formatDate(d.date)}: ${d.count} completed`}</title>
              </circle>
              <text
                x={xOf(i)}
                y={innerHeight + 24}
                textAnchor="end"
                fontSize={12}
                fill="#6b7280"
                transform={`rotate(-35 ${xOf(i)} ${innerHeight + 24})`}
              >
                {formatDate(d.date)}
              </text>
            </g>
          ))}

          <line
            x1={0}
            y1={innerHeight}
            x2={innerWidth}
            y2={innerHeight}
            stroke="#CBD5E0"
            strokeWidth={1}
          />
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={innerHeight}
            stroke="#CBD5E0"
            strokeWidth={1}
          />
        </g>
      </svg>
    </Box>
  );
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

  const trendData = useMemo<TrendPoint[]>(() => {
    const map = new Map<string, number>();
    trainings.forEach((t) => {
      if (t.status === "Completed" && t.endDate) {
        const key = t.endDate.slice(0, 10);
        map.set(key, (map.get(key) || 0) + 1);
      }
    });
    return Array.from(map.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [trainings]);

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ width: "100%", mt: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ color: "#6846C6", fontWeight: 700 }}>
          Executive Training Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: "#6b7280" }}>
          A high-level snapshot of training progress across the organization
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
        <StatCard
          icon={<HourglassBottomIcon />}
          label="Trainings In Progress"
          value={inProgressCount}
          accent="#887bab"
        />
        <StatCard
          icon={<CheckCircleIcon />}
          label="Trainings Completed"
          value={completedCount}
          accent="#6846C6"
        />
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: "1px solid #E5EEEF",
          boxShadow: "0 4px 24px rgba(0, 106, 113, 0.12)",
          background: "#ffffff",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <ShowChartIcon sx={{ color: "#6846C6" }} />
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: "#2d2540" }}
          >
            Course Completions Over Time
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "#6b7280", mb: 2 }}>
          Number of employees who completed a course, grouped by training end
          date
        </Typography>
        <CompletionTrendChart data={trendData} />
      </Paper>
    </Box>
  );
};

export default ExecutiveDashboard;
