import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PublicSidebar from "../components/PublicSidebar";
import { BackToTop } from "../components/BackToTop";

const PublicLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <PublicSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1"><Outlet /></main>
        <Footer />
        <BackToTop />
    </div>
  );
};

export default PublicLayout;