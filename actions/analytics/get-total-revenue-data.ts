'use server';

type MonthlyRevenueData = {
  totalRevenue: number;
  transactionCount: number;
};

type TotalRevenueData = {
  average: number;
  diff: number | null;
  month: string;
  revenue: number;
  transactionCount: number;
}[];

export const getTotalRevenueData = async (transactions: any[]) => {
  const monthlyData: Record<string, MonthlyRevenueData> = {};

  transactions.forEach((transaction) => {
    const date = new Date(transaction.created * 1000);
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData[yearMonth]) {
      monthlyData[yearMonth] = { totalRevenue: 0, transactionCount: 0 };
    }

    monthlyData[yearMonth].totalRevenue += transaction.net;
    monthlyData[yearMonth].transactionCount += 1;
  });

  let previousRevenue: number | null = null;

  const sortedMonths = Object.keys(monthlyData).sort();

  const totalRevenueData: TotalRevenueData = sortedMonths.map((month) => {
    const data = monthlyData[month];

    const revenue = data.totalRevenue;
    const transactionCount = data.transactionCount;

    const average = parseFloat((revenue / transactionCount).toFixed(0));
    const diff = previousRevenue
      ? parseFloat((((revenue - previousRevenue) / previousRevenue) * 100).toFixed(2))
      : null;

    previousRevenue = revenue;

    return {
      average,
      diff,
      month,
      revenue,
      transactionCount,
    };
  });

  return totalRevenueData;
};
