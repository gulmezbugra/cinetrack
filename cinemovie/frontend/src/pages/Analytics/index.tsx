import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import {
  useTopGenres, useTopDirectors, useDroppedRate, useMonthlyTrend
} from '../../hooks/useApi';
import { Spinner } from '../../components/ui';

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function Analytics() {
  const { data: genres, isLoading: g1 } = useTopGenres();
  const { data: directors, isLoading: g2 } = useTopDirectors();
  const { data: dropped, isLoading: g3 } = useDroppedRate();
  const { data: monthly, isLoading: g4 } = useMonthlyTrend();

  if (g1 || g2 || g3 || g4) return <Spinner className="h-64" />;

  const genreData = genres?.map(g => ({ name: g.genre, count: Number(g.count) })) ?? [];
  const directorData = directors?.map(d => ({ name: d.director, puan: Number(d.avg_rating), yapım: Number(d.works) })) ?? [];
  const droppedData = dropped?.map(d => ({ name: d.genre, oran: Number(d.drop_rate) })) ?? [];
  const monthlyData = monthly?.map(m => ({ ay: m.month, yorum: Number(m.count), puan: Number(m.avg_rating) })) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📊 Platform Analitiği</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Q1 - Top genres */}
        <ChartCard title="En Çok İzlenen Türler">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={genreData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" name="İzleme" fill="#a855f7" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Q2 - Top directors */}
        <ChartCard title="En Yüksek Puanlı Yönetmenler">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={directorData} layout="vertical">
              <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="puan" name="Ort. Puan" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Q3 - Dropped rate */}
        <ChartCard title="Türe Göre Bırakma Oranı (%)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={droppedData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} unit="%" />
              <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="oran" name="Bırakma %" fill="#ef4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Q6 - Monthly trend */}
        <ChartCard title="Aylık Yorum Trendi">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="ay" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 10]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="yorum" name="Yorum Sayısı" stroke="#a855f7" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="puan" name="Ort. Puan" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Veriler gerçek zamanlı hesaplanmaktadır · Materialized View optimizasyonu için <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">REFRESH MATERIALIZED VIEW</code> çalıştırın
      </p>
    </div>
  );
}
