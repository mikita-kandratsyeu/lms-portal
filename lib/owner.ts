export const isBusinessOwner = (userId?: string | null) =>
  userId === process.env.NEXT_PUBLIC_OWNER_ID;
