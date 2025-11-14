"use client";
import Image from "next/image";
import React, { useEffect, useState, useCallback } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { parseCookies, destroyCookie } from "nookies";
import { useRouter } from "next/navigation";
import { User, Settings, LogOut } from "lucide-react";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ✅ Handle dropdown toggle
  const toggleDropdown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  // ✅ Close dropdown
  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  // ✅ Handle logout
  const handleLogout = async () => {
    const cookies = parseCookies();
    const token = cookies.adminToken;
    setLoading(true);

    try {
      const res = await fetch(
        "https://ecommerce.sidhwanitechnologies.com/api/v1/admin/logout",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            apiKey: "ecommerceapp",
          },
        }
      );

      const data = await res.json();
      if (data.success) {
        destroyCookie(null, "adminToken", { path: "/" });
        destroyCookie(null, "adminData", { path: "/" });
        router.push("/signin");
      }
    } catch (err) {
      console.error("Error logging out:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load admin data from cookies
  useEffect(() => {
    const cookies = parseCookies();
    const token = cookies.adminToken;
    const adminData = cookies.adminData ? JSON.parse(cookies.adminData) : null;

    if (!token || !adminData) {
      destroyCookie(null, "adminToken");
      destroyCookie(null, "adminData");
      router.push("/signin");
      return;
    }

    setAdmin({
      name: adminData.name || "Admin",
      email: adminData.email || "admin@example.com",
    });
    setLoading(false);
  }, [router]); // ✅ router added to dependency array

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
          <Image
            width={44}
            height={44}
            src="/images/user/owner.jpg"
            alt="User"
          />
        </span>

        <span className="block mr-1 font-medium text-theme-sm">
          {loading ? "Loading..." : admin?.name || "Admin"}
        </span>

        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {admin?.name || "Admin"}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {admin?.email || "admin@example.com"}
          </span>
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
             <User size={18} className="text-gray-500 group-hover:text-gray-700 dark:text-gray-400" />
              Edit profile
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
             <Settings size={18} className="text-gray-500 group-hover:text-gray-700 dark:text-gray-400" />
              Account settings
            </DropdownItem>
          </li>
        </ul>

        <button
          onClick={handleLogout}
          disabled={loading}
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
        <LogOut size={18} className="text-gray-500 group-hover:text-gray-700 dark:text-gray-400" />
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}
