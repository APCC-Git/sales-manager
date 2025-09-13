'use client';

import { TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export const description = 'An area chart with axes';

const chartData = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 214, mobile: 140 },
];

const predictionData = [
  {
    time: '10:00',
    predicted: 1,
    actual: 1,
  },
  {
    time: '11:00',
    predicted: 2,
    actual: 2,
  },
  {
    time: '12:00',
    predicted: 3,
    actual: 3,
  },
  {
    time: '13:00',
    predicted: 4,
    actual: 4,
  },
  {
    time: '13:17',
    predicted: 6,
    actual: 6,
  },
  {
    time: '14:00',
    predicted: 7,
    actual: 7,
  },
  {
    time: '15:00',
    predicted: 9,
  },
  {
    time: '16:00',
    predicted: 11,
  },
  {
    time: '17:00',
    predicted: 13,
  },
  {
    time: '18:00',
    predicted: 15,
  },
  {
    time: '19:00',
    predicted: 16,
  },
  {
    time: '20:00',
    predicted: 18,
  },
  {
    time: '21:00',
    predicted: 20,
  },
  {
    time: '22:00',
    predicted: 22,
  },
  {
    time: '23:00',
    predicted: 24,
  },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'var(--chart-1)',
  },
  mobile: {
    label: 'Mobile',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export function SalesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Area Chart - Axes</CardTitle>
        <CardDescription>Showing total visitors for the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: -20,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={value => value.slice(0, 3)}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} tickCount={3} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              dataKey="mobile"
              type="natural"
              fill="var(--color-mobile)"
              fillOpacity={0.4}
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="var(--color-desktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
