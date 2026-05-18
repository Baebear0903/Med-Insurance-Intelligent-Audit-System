import React, { createContext, useContext, useState, useEffect } from "react";
import { Role } from "./constants";
import { useNavigate, useLocation } from "react-router-dom";
import { visibleMenuItems } from "./constants";

interface UserContextType {
  role: Role;
  setRole: (role: Role) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRoleState] = useState<Role>(() => {
    return (localStorage.getItem("currentRole") as Role) || "ADMIN";
  });

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    localStorage.setItem("currentRole", newRole);
    
    // Redirect if current page is not accessible by the new role
    const currentMenu = visibleMenuItems.find(m => location.pathname.startsWith(m.path.replace("/index", "")));
    if (currentMenu && !currentMenu.roles.includes(newRole)) {
      navigate("/task-fill-report/departments/index");
    } else if (location.pathname === "/task-management/task-list/index" && newRole !== "ADMIN") {
      navigate("/task-fill-report/departments/index");
    }
  };

  return (
    <UserContext.Provider value={{ role, setRole }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
