import { useState, useRef, useEffect } from "react";
import { Search, Menu, User, Settings, LogOut } from "lucide-react";
import { router, usePage } from "@inertiajs/react";


const Navbar = ({ title, onMenuClick }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const wrapperRef = useRef(null);
  const { auth } = usePage().props;
  const user = auth.user;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const logout = () => {
    router.post('/logout');
  };

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <header
      ref={wrapperRef}
      className="h-16 bg-newhite border-b border-outline-variant flex items-center gap-stack-md px-stack-md sticky top-0 z-30"
    >
      <div className="flex items-center gap-stack-sm flex-1 min-w-0">
        <button onClick={onMenuClick} className="lg:hidden text-on-surface-variant cursor-pointer">
          <Menu size={22} />
        </button>
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-headline truncate">{title}</h1>
          <p className="text-xs text-on-surface-variant">{today}</p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-stack-sm bg-surface-container-high rounded-lg px-3 py-1.5 w-56">
        <Search size={16} className="text-on-surface-variant shrink-0" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none text-sm text-body w-full placeholder:text-on-surface-variant"
        />
      </div>

      <div className="flex items-center">
        <div className="relative">
          <div className="flex items-center">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white uppercase">
                {user?.name
                  ?.split(" ")
                  .map((word) => word[0])
                  .join("")
                  .substring(0, 2) ?? "U"}
              </div>

              <span className="text-sm font-medium text-headline">
                {user?.name ?? "User"}
              </span>
            </button>
          </div>
          {profileOpen && (
            <div className="absolute right-0 top-11 z-50 w-56 rounded-xl border border-outline-variant bg-white shadow-xl overflow-hidden">
              <div className="border-b border-surface-container-high px-4 py-3">
                <p className="text-sm font-semibold text-headline">{user?.name}</p>
                <p className="text-xs text-on-surface-variant">{user?.email}</p>
              </div>
              <div className="border-t border-surface-container-high py-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left cursor-pointer"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;