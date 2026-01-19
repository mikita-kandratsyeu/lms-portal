'use client';

import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
} from '@/components/ui';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

type ModelUsage = {
  model: string;
  uses: number;
};

type WeeklyUsage = {
  week: string;
  global: number;
  personal: number;
};

const periodOptions = [
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
  { id: '90d', label: '90 days' },
] as const;

type PeriodId = (typeof periodOptions)[number]['id'];

const scopeOptions = [
  { id: 'all', label: 'All' },
  { id: 'global', label: 'Global' },
  { id: 'personal', label: 'Personal' },
] as const;

type ScopeId = (typeof scopeOptions)[number]['id'];

const analyticsByPeriod: Record<
  PeriodId,
  {
    globalModelUsage: ModelUsage[];
    personalModelUsage: ModelUsage[];
    weeklyUsage: WeeklyUsage[];
    globalUsers: number;
    personalUsers: number;
  }
> = {
  '7d': {
    globalModelUsage: [
      { model: 'GPT-4o', uses: 2850 },
      { model: 'Claude 3.5 Sonnet', uses: 2430 },
      { model: 'Gemini 1.5 Pro', uses: 1900 },
      { model: 'DeepSeek R1', uses: 1600 },
      { model: 'Llama 3.1 70B', uses: 1120 },
    ],
    personalModelUsage: [
      { model: 'GPT-4o', uses: 410 },
      { model: 'Claude 3.5 Sonnet', uses: 360 },
      { model: 'Gemini 1.5 Pro', uses: 240 },
      { model: 'Llama 3.1 70B', uses: 190 },
      { model: 'DeepSeek R1', uses: 160 },
    ],
    weeklyUsage: [
      { week: 'W1', global: 1200, personal: 140 },
      { week: 'W2', global: 1350, personal: 170 },
      { week: 'W3', global: 1480, personal: 190 },
      { week: 'W4', global: 1650, personal: 220 },
      { week: 'W5', global: 1780, personal: 240 },
      { week: 'W6', global: 1950, personal: 260 },
    ],
    globalUsers: 520,
    personalUsers: 38,
  },
  '30d': {
    globalModelUsage: [
      { model: 'GPT-4o', uses: 12450 },
      { model: 'Claude 3.5 Sonnet', uses: 10320 },
      { model: 'Gemini 1.5 Pro', uses: 8420 },
      { model: 'DeepSeek R1', uses: 6240 },
      { model: 'Llama 3.1 70B', uses: 4180 },
    ],
    personalModelUsage: [
      { model: 'GPT-4o', uses: 1680 },
      { model: 'Claude 3.5 Sonnet', uses: 1420 },
      { model: 'Gemini 1.5 Pro', uses: 980 },
      { model: 'Llama 3.1 70B', uses: 620 },
      { model: 'DeepSeek R1', uses: 540 },
    ],
    weeklyUsage: [
      { week: 'W1', global: 4200, personal: 520 },
      { week: 'W2', global: 5100, personal: 680 },
      { week: 'W3', global: 6000, personal: 720 },
      { week: 'W4', global: 7100, personal: 860 },
      { week: 'W5', global: 8200, personal: 920 },
      { week: 'W6', global: 9400, personal: 1100 },
    ],
    globalUsers: 1840,
    personalUsers: 128,
  },
  '90d': {
    globalModelUsage: [
      { model: 'GPT-4o', uses: 29800 },
      { model: 'Claude 3.5 Sonnet', uses: 25500 },
      { model: 'Gemini 1.5 Pro', uses: 20600 },
      { model: 'DeepSeek R1', uses: 15800 },
      { model: 'Llama 3.1 70B', uses: 11100 },
    ],
    personalModelUsage: [
      { model: 'GPT-4o', uses: 3820 },
      { model: 'Claude 3.5 Sonnet', uses: 3180 },
      { model: 'Gemini 1.5 Pro', uses: 2350 },
      { model: 'Llama 3.1 70B', uses: 1320 },
      { model: 'DeepSeek R1', uses: 980 },
    ],
    weeklyUsage: [
      { week: 'W1', global: 8200, personal: 980 },
      { week: 'W2', global: 9100, personal: 1100 },
      { week: 'W3', global: 10200, personal: 1240 },
      { week: 'W4', global: 11200, personal: 1320 },
      { week: 'W5', global: 12600, personal: 1480 },
      { week: 'W6', global: 13900, personal: 1620 },
    ],
    globalUsers: 5020,
    personalUsers: 276,
  },
};

const personalAgents = [
  { name: 'Personal Tutor', users: 64 },
  { name: 'Code Reviewer', users: 41 },
  { name: 'Marketing Copy', users: 27 },
  { name: 'Private Coach', users: 18 },
];

const getTopModel = (models: ModelUsage[]) =>
  models.reduce((top, current) => (current.uses > top.uses ? current : top), models[0]);

const sumUses = (models: ModelUsage[]) => models.reduce((total, model) => total + model.uses, 0);

const usageTrendConfig = {
  global: { label: 'Global', color: 'hsl(var(--primary))' },
  personal: { label: 'Personal', color: 'hsl(var(--muted-foreground))' },
} satisfies ChartConfig;

const globalModelConfig = {
  uses: { label: 'Uses', color: 'hsl(var(--primary))' },
} satisfies ChartConfig;

const personalPieColors = ['#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#ef4444'];

const AnalyticPage = () => {
  const [period, setPeriod] = useState<PeriodId>('30d');
  const [scope, setScope] = useState<ScopeId>('all');

  const { globalModelUsage, personalModelUsage, weeklyUsage, globalUsers, personalUsers } =
    analyticsByPeriod[period];
  const globalTop = getTopModel(globalModelUsage);
  const personalTop = getTopModel(personalModelUsage);
  const showGlobal = scope === 'all' || scope === 'global';
  const showPersonal = scope === 'all' || scope === 'personal';

  return (
    <div className="w-full p-6 space-y-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">AI Agents Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Mock analytics overview for global public agents and your private agents.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ButtonGroup>
              {scopeOptions.map((option) => (
                <Button
                  key={option.id}
                  type="button"
                  variant={scope === option.id ? 'default' : 'outline'}
                  onClick={() => setScope(option.id)}
                >
                  {option.label}
                </Button>
              ))}
            </ButtonGroup>
            <ButtonGroup>
              {periodOptions.map((option) => (
                <Button
                  key={option.id}
                  type="button"
                  variant={period === option.id ? 'default' : 'outline'}
                  onClick={() => setPeriod(option.id)}
                >
                  {option.label}
                </Button>
              ))}
            </ButtonGroup>
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {showGlobal && (
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Global uses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {sumUses(globalModelUsage).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Public agents only</p>
            </CardContent>
          </Card>
        )}
        {showGlobal && (
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Active users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{globalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        )}
        {showPersonal && (
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Users using my agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{personalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Including private agents</p>
            </CardContent>
          </Card>
        )}
        {showGlobal && (
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Top model (global)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{globalTop.model}</div>
              <p className="text-xs text-muted-foreground">
                {globalTop.uses.toLocaleString()} total uses
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {(showGlobal || showPersonal) && (
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Usage trend</CardTitle>
              <p className="text-xs text-muted-foreground">
                {showGlobal && showPersonal
                  ? 'Global vs your agents'
                  : showGlobal
                    ? 'Global public agents'
                    : 'Your agents only'}
              </p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={usageTrendConfig} className="h-[280px] w-full">
                <LineChart data={weeklyUsage} margin={{ left: 8, right: 8, top: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  {showGlobal && (
                    <Line
                      type="monotone"
                      dataKey="global"
                      stroke="var(--color-global)"
                      strokeWidth={2}
                      dot={false}
                    />
                  )}
                  {showPersonal && (
                    <Line
                      type="monotone"
                      dataKey="personal"
                      stroke="var(--color-personal)"
                      strokeWidth={2}
                      strokeDasharray="6 4"
                      dot={false}
                    />
                  )}
                  <ChartTooltip content={<ChartTooltipContent />} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {showGlobal && (
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Most popular models (global)</CardTitle>
              <p className="text-xs text-muted-foreground">Public agents only</p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={globalModelConfig} className="h-[280px] w-full">
                <BarChart data={globalModelUsage} margin={{ left: 8, right: 8, top: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="model"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <Bar dataKey="uses" fill="var(--color-uses)" radius={[6, 6, 0, 0]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
      {showPersonal && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>My agent users</CardTitle>
              <p className="text-xs text-muted-foreground">Top agents by active users</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {personalAgents.map((agent) => (
                <div key={agent.name} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{agent.users} active users</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round((agent.users / personalUsers) * 100)}%
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Most popular model (my agents)</CardTitle>
              <p className="text-xs text-muted-foreground">
                {personalTop.uses.toLocaleString()} uses on your agents
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-lg font-semibold">{personalTop.model}</p>
                  <p className="text-xs text-muted-foreground">Most used across your agents</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={personalModelUsage} dataKey="uses" nameKey="model" innerRadius={50}>
                    {personalModelUsage.map((entry, index) => (
                      <Cell
                        key={entry.model}
                        fill={personalPieColors[index % personalPieColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AnalyticPage;
