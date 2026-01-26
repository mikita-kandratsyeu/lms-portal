export type Promotion = {
  id: string;
  code: string;
  description: string;
  restrictions: string;
  active: boolean;
  isPersonal: boolean;
  maxRedemptions: number;
  timesRedeemed: number;
  applied: boolean;
};
