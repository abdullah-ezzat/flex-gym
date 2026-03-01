import { getDB } from "../database/db";

export function startExpiryWatcher() {
  setInterval(
    () => {
      const db = getDB();
      const now = new Date().toISOString();

      db.prepare(
        `
      UPDATE members
      SET isActive = 0
      WHERE expiryDate < ?
    `,
      ).run(now);
    },
    60 * 60 * 1000,
  );
}
