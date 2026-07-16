import { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";

const DESKTOP_BREAKPOINT = 1024;

const AppLayout = ({ children, title }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width >= DESKTOP_BREAKPOINT) {
        setOverlayOpen(false);
      } else {
        setOverlayOpen(false);
        setCollapsed(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleToggle = () => {
    if (window.innerWidth >= DESKTOP_BREAKPOINT) {
      setCollapsed((prev) => !prev);
    } else {
      setOverlayOpen((prev) => !prev);
    }
  };

  const closeOverlay = () => setOverlayOpen(false);

  return (
    <>
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={handleToggle}
        mobileOpen={overlayOpen}
        onCloseMobile={closeOverlay}
      />

      {overlayOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={closeOverlay}
        />
      )}

      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${collapsed ? "lg:ml-16" : "lg:ml-[220px] 2xl:ml-[240px]"
          }`}
      >
        <Navbar onMenuClick={handleToggle} title={title} />
        <main className="p-gutter md:p-margin-page">{children}</main>
      </div>
    </>
  );
};

export default AppLayout;