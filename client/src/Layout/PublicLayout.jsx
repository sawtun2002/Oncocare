import { Outlet } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PublicSidebar from "../components/PublicSidebar";
import { BackToTop } from "../components/BackToTop";

const PublicLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-serenity-100/20">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <PublicSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1"><Outlet /></main>
        <Footer />
        <BackToTop />
    </div>
  );
};

export default PublicLayout;