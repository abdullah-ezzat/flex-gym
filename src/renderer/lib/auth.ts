import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  id: string;
  role: string;
  iat: number;
}

export function decodeToken(token: string): DecodedToken {
  return jwtDecode(token);
}

export function isAdmin(role: string | null) {
  return role === "admin";
}

export function isTrainer(role: string | null) {
  return role === "trainer";
}

export function isMember(role: string | null) {
  return role === "member";
}
