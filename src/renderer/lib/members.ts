import { isExpired } from "./date";

export function getMemberStatus(member: any) {
  if (!member.expiryDate) return "unknown";
  return isExpired(member.expiryDate) ? "expired" : "active";
}

export function filterActiveMembers(members: any[]) {
  return members.filter((m) => !isExpired(m.expiryDate));
}

export function filterExpiredMembers(members: any[]) {
  return members.filter((m) => isExpired(m.expiryDate));
}

export function calculateTotalRevenue(members: any[]) {
  return members.reduce((sum, m) => sum + (m.price || 0), 0);
}
