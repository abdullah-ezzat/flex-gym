import { Navigate } from "react-router-dom";

import LoginScreen from "@/renderer/features/auth/login";
import DashboardLayout from "@/renderer/features/dashboard/layout";
import AdminDashboard from "@/renderer/features/dashboard/admin";
import TrainerDashboard from "@/renderer/features/dashboard/trainer";
import MemberDashboard from "@/renderer/features/dashboard/member";

import AttendancePage from "@/renderer/features/attendance/page";

import { ProtectedRoute } from "@/renderer/lib/guards";
import { useAuthStore } from "@/renderer/features/auth/store";
import MembersList from "./features/members/list";
import MemberDetailsPage from "./features/members/details";
import MemberCreatePage from "./features/members/create";
import MembersLayout from "./features/members/layout";
import MemberEditPage from "./features/members/edit";
import UpdateAdminScreen from "./features/auth/update-admin";

function RoleBasedDashboard() {
  const role = useAuthStore((s) => s.role);

  if (role === "admin") return <AdminDashboard />;
  if (role === "trainer") return <TrainerDashboard />;
  if (role === "member") return <MemberDashboard />;

  return <Navigate replace to="/" />;
}

export function AppRoutes() {
  return [
    // Public
    {
      path: "/",
      element: <LoginScreen />,
    },
    {
      path: "/update-admin",
      element: <UpdateAdminScreen />,
    },

    // Protected dashboard wrapper
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: <RoleBasedDashboard />,
        },
        {
          path: "members",
          element: <MembersLayout />,
          children: [
            { index: true, element: <MembersList /> },
            { path: "new", element: <MemberCreatePage /> },
            { path: ":id", element: <MemberDetailsPage /> },
            { path: ":id/edit", element: <MemberEditPage /> },
          ],
        },
        {
          path: "attendance",
          element: <AttendancePage />,
        },
      ],
    },

    // Fallback
    {
      path: "*",
      element: <Navigate replace to="/" />,
    },
  ];
}
