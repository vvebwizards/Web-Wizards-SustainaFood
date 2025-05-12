import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

export interface MetricConfig<Stats> {
  key: keyof Stats;
  label: string;
  render: (stats: Stats) => React.ReactNode;
}

interface MetricPanelProps<Stats> {
  config: MetricConfig<Stats>;
  stats: Stats;
}

export function MetricPanel<Stats>({ config, stats }: MetricPanelProps<Stats>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{config.label}</CardTitle>
      </CardHeader>
      <CardContent>{config.render(stats)}</CardContent>
    </Card>
  );
}
