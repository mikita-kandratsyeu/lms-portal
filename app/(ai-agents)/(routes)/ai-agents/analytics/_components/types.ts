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
  id: string;
  name: string;
  pictureUrl: string | null;
  users: number;
};
