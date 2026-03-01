import PageLayout from "@/renderer/components/layout/page";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <PageLayout>
      <Outlet />
    </PageLayout>
  );
}
