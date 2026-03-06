// src/components/monitor/SafetyMeter.tsx
'use client';

import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { useSafety } from '@/lib/hooks/useSafety';

export function SafetyMeter() {
  const { config } = useSafety();
  const dailyLimit = config?.dailyLimit || 80;
  const todaySends = config?.todaySends || 0;
  const pct = Math.min((todaySends / dailyLimit) * 100, 100);

  const color = pct < 70 ? '#10b981' : pct < 90 ? '#f59e0b' : '#ef4444';
  const data = [{ name: 'usage', value: pct, fill: color }];

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col items-center">
      <h3 className="text-sm font-semibold text-foreground mb-2">Daily Send Limit</h3>
      <div className="relative w-40 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="75%"
            outerRadius="100%"
            startAngle={180}
            endAngle={0}
            data={data}
            barSize={10}
          >
            <RadialBar
              background={{ fill: 'rgba(255,255,255,0.04)' }}
              dataKey="value"
              cornerRadius={5}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-mono text-foreground">{todaySends}</span>
          <span className="text-xs text-muted-foreground">/ {dailyLimit}</span>
        </div>
      </div>
    </div>
  );
}
