import React from "react";
import { Bell, User } from "lucide-react";
import useAuthStore from "../store/authStore";
import useHeaderStore from "../store/headerStore";

interface HeaderProps {
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => {
  const { user } = useAuthStore();
  const { title } = useHeaderStore();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm relative z-10">
      <div className="flex justify-between items-center px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          {children}
          
           {/* Mobile Title / Dynamic Title */}
           <div>
              <h1 className="text-xl font-bold text-gray-800">
                {title || (
                  <>
                    Document & Subscription <span className="text-orange-400">Manager</span>
                  </>
                )}
              </h1>
           </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Bell
              size={20}
              className="text-gray-500"
            />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-100">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-gray-700">{user?.id || "Guest"}</p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role || "User"}
              </p>
            </div>
             <div className="flex justify-center items-center w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-full shadow-sm">
              <User size={20} className="text-indigo-600" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;