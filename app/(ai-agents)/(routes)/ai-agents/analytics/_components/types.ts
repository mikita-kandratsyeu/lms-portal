export type ModelUsage = {
  model: string;
  uses: number;
};

export type WeeklyUsage = {
  week: string;
  global: number;
  personal: number;
};

export type PersonalAgent = {
  name: string;
  users: number;
};
