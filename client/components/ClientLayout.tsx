"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

const ClientLayout = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const publicpages = [
      "/login",
      "/setup-password",
      "/reset-password",
    ];

    const ispublicpage = publicpages.includes(pathname);

    if (!isAuthenticated && !ispublicpage) {
      router.push("/login");
    } else if (isAuthenticated && pathname === "/login") {
      router.push("/");
    }

    setIsReady(true);
  }, [isAuthenticated, pathname, router]);

  if (!isReady) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <div className="text-sm text-slate-500">
          Loading...
        </div>
      </div>
    );
  }

  const isauthpage =
    pathname === "/login" || pathname === "/setup-password";

  return (
    <>
      {isauthpage ? (
        children
      ) : (
        <div className="min-h-screen bg-white">
          <Sidebar />

          <main className="ml-64 min-h-screen min-w-0 overflow-x-hidden bg-white">
            {children}
          </main>
        </div>
      )}
    </>
  );
};

export default ClientLayout;