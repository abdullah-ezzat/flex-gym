export const APP_NAME = "FLEX GYM";

export const ROLES = {
  ADMIN: "admin",
  TRAINER: "trainer",
  MEMBER: "member",
} as const;

export const PLANS = [
  { name: "1 Month", price: 1000, duration: 30 },
  { name: "3 Months", price: 2000, duration: 90 },
  { name: "6 Months", price: 3000, duration: 180 },
  { name: "1 Year", price: 4200, duration: 365 },
];

export const PRIVATE_COACH_PLANS = [
  { name: "10 Sessions", price: 1000 },
  { name: "15 Sessions", price: 1300 },
  { name: "20 Sessions", price: 1600 },
  { name: "30 Sessions", price: 2300 },
  { name: "60 Sessions", price: 4200 },
];
