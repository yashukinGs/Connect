import { useEffect, useState } from "react";
import api from "../lib/api";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#F43F5E", "#8B5CF6", "#06B6D4", "#EAB308", "#EC4899", "#94A3B8"];

export default function Analytics() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/stats/admin").then(({ data }) => setData(data)); }, []);

  if (!data) return <div className="max-w-7xl mx-auto p-10 text-muted">Loading…</div>;

  const tooltipStyle = { background: "#0B0E17", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10" data-testid="analytics-page">
      <div className="overline mb-2">Analytics</div>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight" style={{ fontFamily: "Outfit" }}>City Insights</h1>
      <p className="text-muted mt-1">Trends, categories, and resolution velocity.</p>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card-elevated p-6">
          <h3 className="text-lg font-semibold" style={{ fontFamily: "Outfit" }}>Complaints by Category</h3>
          <div className="h-72 mt-4">
            <ResponsiveContainer>
              <BarChart data={data.by_category}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="category" stroke="#94A3B8" fontSize={11} angle={-15} textAnchor="end" height={60} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {data.by_category.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-elevated p-6">
          <h3 className="text-lg font-semibold" style={{ fontFamily: "Outfit" }}>Complaints by Status</h3>
          <div className="h-72 mt-4">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data.by_status} dataKey="count" nameKey="status" innerRadius={55} outerRadius={95}>
                  {data.by_status.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-elevated p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold" style={{ fontFamily: "Outfit" }}>Last 7 Days</h3>
          <div className="h-72 mt-4">
            <ResponsiveContainer>
              <LineChart data={data.by_day}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} dot={{ fill: "#3B82F6", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
