const electronAPI = (globalThis as any).api;

export const api = {
  // AUTH
  login: electronAPI.auth.login,
  updateAdmin: electronAPI.auth.updateAdmin,

  // FILES
  getImage: electronAPI.files.getImage,

  // MEMBERS
  createMember: electronAPI.members.create,
  getMemberById: electronAPI.members.getById,
  searchMembers: electronAPI.members.search,
  findMemberByQR: electronAPI.members.byQR,
  updateMember: electronAPI.members.update,
  deleteMember: electronAPI.members.delete,

  // ATTENDANCE
  logAttendance: electronAPI.attendance.log,
  getMemberAttendanceStats: electronAPI.attendance.memberStats,

  // DASHBOARD
  getDashboardStats: electronAPI.dashboard.stats,
  getWeeklyAttendance: electronAPI.dashboard.weeklyAttendance,
  getPeakHour: electronAPI.dashboard.peakHour,
  getTopActiveMember: electronAPI.dashboard.topMember,
  getRecentActivity: electronAPI.dashboard.recentActivity,
  getRevenueByMonth: electronAPI.dashboard.revenue,
};