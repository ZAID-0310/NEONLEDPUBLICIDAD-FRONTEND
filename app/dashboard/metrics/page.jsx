"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import RouteGuard from "@/app/dashboard/components/RouteGuard";
import { getCookie } from "cookies-next";
import url from "../../../api/url";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from "recharts";

/* 🎨 Colores */
const CHART_COLORS = ["#6366f1", "#06b6d4", "#8b5cf6", "#10b981", "#f59e0b"];

/* 🗓️ Meses */
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function MetricsPage() {
  const now = new Date();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [filterMode, setFilterMode] = useState("monthly"); // monthly | yearly
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [cardsByPlantilla, setCardsByPlantilla] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [totalCards, setTotalCards] = useState(0);

  useEffect(() => {
    fetchMetrics();
  }, [month, year, filterMode]);

  const fetchMetrics = async () => {
    try {
      setRefreshing(true);
      const token = getCookie("token");
      const headers = { Authorization: `Bearer ${token}` };

      const params =
        filterMode === "monthly"
          ? { month, year }
          : { year };

      const [resPlantillas, resEmpleados] = await Promise.all([
        axios.get(`${url}/api/metrics/count_total_cards`, { headers, params }),
        axios.get(`${url}/api/metrics/count_total_cards_by_empleado`, {
          headers,
          params,
        }),
      ]);

      const plantillas = (resPlantillas.data.data || []).map((p) => ({
        name: `Plantilla ${p.id_plantilla}`,
        value: p.count_cards,
      }));

      const total = plantillas.reduce((acc, i) => acc + i.value, 0);

      setCardsByPlantilla(plantillas);
      setEmpleados(resEmpleados.data.data || []);
      setTotalCards(total);
    } catch (e) {
      console.error("Error métricas:", e);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const top5Empleados = [...empleados]
    .sort((a, b) => b.count_cards - a.count_cards)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <span className="text-xl font-bold animate-pulse text-blue-600">
          Cargando métricas del dashboard…
        </span>
      </div>
    );
  }

  return (
    <RouteGuard>
    <div className="w-full p-6 lg:p-10 space-y-12">

      {/* 🧭 HEADER + FILTROS */}
      <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700 pb-6 md:flex-row md:items-center md:justify-between">

        {/* TÍTULO */}
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            Dashboard de Métricas
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filterMode === "monthly"
              ? `Resumen mensual · ${MONTHS[month - 1]} ${year}`
              : `Resumen anual · ${year}`}
          </p>
        </div>

        {/* FILTROS */}
        <div className="flex flex-wrap items-center gap-3">

          {/* MODO */}
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="monthly">Mensual</option>
            <option value="yearly">Anual</option>
          </select>

          {/* MES */}
          {filterMode === "monthly" && (
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm text-sm focus:ring-2 focus:ring-blue-500"
            >
              {MONTHS.map((name, i) => (
                <option key={i} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          )}

          {/* AÑO */}
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm text-sm focus:ring-2 focus:ring-blue-500"
          >
            {[2023, 2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {refreshing && (
            <span className="text-xs text-gray-400 dark:text-gray-500 animate-pulse">
              Actualizando…
            </span>
          )}
        </div>
      </div>

      {/* 📌 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <SummaryCard title="Total de Cards" value={totalCards} emoji="📄" />
        <SummaryCard title="Plantillas Activas" value={cardsByPlantilla.length} emoji="🎨" />
        <SummaryCard title="Colaboradores" value={empleados.length} emoji="👥" />
        <SummaryCard
          title="Promedio por Empleado"
          value={empleados.length ? (totalCards / empleados.length).toFixed(1) : 0}
          emoji="📈"
        />
      </div>

      {/* 📊 GRÁFICOS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card title="Cards por Plantilla">
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={cardsByPlantilla}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Distribución de Cards (%)">
          <ResponsiveContainer width="100%" height={360}>
            <PieChart>
              <Pie
                data={cardsByPlantilla}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={120}
                label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
              >
                {cardsByPlantilla.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v} cards`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* 👥 PRODUCTIVIDAD */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card title="Productividad por Empleado">
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
            {empleados.map((e, i) => (
              <div
                key={i}
                className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <span className="font-medium text-gray-800 dark:text-gray-200">{e.nombre_empleado}</span>
                <span className="bg-blue-600 text-white px-3 py-1 text-sm rounded-full">
                  {e.count_cards} cards
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="🏆 Top 5 Empleados">
          <div className="space-y-4">
            {top5Empleados.map((e, i) => (
              <div key={i} className="flex justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  #{i + 1} {e.nombre_empleado}
                </span>
                <span className="bg-blue-600 text-white px-3 py-1 rounded-lg">
                  {e.count_cards} cards
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
    </RouteGuard>
  );
}

/* 🔹 COMPONENTES */

function SummaryCard({ title, value, emoji }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between">
        <div>
          <p className="text-xs uppercase text-gray-400 dark:text-gray-500">{title}</p>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className="text-3xl">{emoji}</div>
      </div>
    </div>
  );
}


function Card({ title, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">{title}</h2>
      {children}
    </div>
  );
}