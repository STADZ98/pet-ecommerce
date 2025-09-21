import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import SidebarAdmin from "../components/admin/SidebarAdmin";
import HeaderAdmin from "../components/admin/HeaderAdmin";
import useEcomStore from "../store/ecom-store";

const LayoutAdmin = () => {
  const profile = useEcomStore((state) => state.profile);
  const loading = useEcomStore((state) => state.loadingProfile);
  const fetchProfile = useEcomStore((state) => state.fetchProfile);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <div className="flex h-screen">
      <SidebarAdmin profile={profile} loading={loading} />
      <div className="flex flex-col flex-1">
        <HeaderAdmin />
        <main className="flex-1 p-4 md:p-8 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LayoutAdmin;
