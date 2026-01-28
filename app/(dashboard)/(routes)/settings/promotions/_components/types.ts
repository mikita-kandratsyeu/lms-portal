export type Promotion = {
  id: string;
  code: string;
  name: string | null;
  description: string;
  restrictions: string;
  active: boolean;
  isPersonal: boolean;
  maxRedemptions: number;
  timesRedeemed: number;
};
