import { usePage, Link } from "@inertiajs/react";
import {
  BriefcaseBusiness,
  LayoutDashboard,
  Mail,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/job", label: "Job Listings", icon: BriefcaseBusiness },
  { href: "/emails", label: "Recruitment Emails", icon: Mail },
  { href: "/profile", label: "Profile Settings", icon: Settings },
];

const Sidebar = ({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) => {
  const { url } = usePage();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-newhite border-r border-outline-variant
    flex flex-col p-stack-md z-50 transition-all duration-300 overflow-visible
    transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
    ${collapsed ? "lg:w-16 lg:px-2" : "lg:w-[220px] 2xl:w-[240px]"} w-[240px]`}
    >
      <button
        onClick={onToggleCollapse}
        className="hidden lg:flex items-center justify-center absolute -right-3 top-8
          w-6 h-6 rounded-full bg-newhite border border-outline-variant shadow-sm
          text-on-surface-variant hover:text-white hover:bg-primary transition-colors cursor-pointer z-10"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Header / Logo */}
      <div
        className={`flex items-center mb-6 ${collapsed ? "justify-center gap-0" : "gap-stack-sm"
          }`}
      >
        <div className="shrink-0 rounded-2xl bg-primary flex items-center justify-center text-white font-bold w-8 h-8">
          <BriefcaseBusiness size={16} />
        </div>
        {!collapsed && (
          <div className="overflow-hidden whitespace-nowrap transition-opacity duration-200">
            <h1 className="text-xl font-semibold text-primary">JobHub</h1>
            <p className="label text-on-surface-variant">Productivity Workspace</p>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden ml-auto text-on-surface-variant cursor-pointer"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Menu */}
      <ul className="flex-1 flex flex-col gap-base">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = url === item.href;

          return (
            <li key={item.href} className="w-full">
              <Link
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center rounded-sm text-sm transition-colors duration-200 w-full ${collapsed
                  ? "justify-center py-2.5 px-0"
                  : "gap-stack-sm px-3 py-2"
                  } ${isActive
                    ? "bg-primary text-white font-semibold"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-body cursor-pointer active:scale-95"
                  }`}
              >
                <Icon
                  size={20}
                  className={`shrink-0 ${isActive ? "text-on-primary-container" : ""}`}
                />
                {!collapsed && (
                  <span
                    className={`font-body-md text-body-md overflow-hidden whitespace-nowrap ${isActive ? "text-on-primary-container" : ""
                      }`}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default Sidebar;