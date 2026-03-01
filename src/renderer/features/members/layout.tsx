import { NavLink, Outlet } from "react-router-dom";

export default function MembersLayout() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-(--gym-light)">Members</h1>
        <p className="text-neutral-400 text-sm mt-2">
          Manage gym members and subscriptions
        </p>
      </div>

      {/* Route Badges */}
      <div className="flex gap-4">
        <NavLink
          to="/dashboard/members"
          end
          className={({ isActive }) =>
            `
            px-4 py-2 rounded-xl text-sm font-medium transition-all
            ${
              isActive
                ? "bg-[#D72323] text-[#F5EDED]"
                : "bg-[#3E3636] text-neutral-400 hover:text-[#F5EDED]"
            }
          `
          }
        >
          All Members
        </NavLink>

        <NavLink
          to="/dashboard/members/new"
          className={({ isActive }) =>
            `
            px-4 py-2 rounded-xl text-sm font-medium transition-all
            ${
              isActive
                ? "bg-[#D72323] text-[#F5EDED]"
                : "bg-[#3E3636] text-neutral-400 hover:text-[#F5EDED]"
            }
          `
          }
        >
          + New Member
        </NavLink>
      </div>

      <Outlet />
    </div>
  );
}
