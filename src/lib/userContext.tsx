import React, { createContext, useContext, useState } from "react";
import { Role } from "./constants";
import { useNavigate, useLocation } from "react-router-dom";
import { visibleMenuItems } from "./constants";

export const ROLE_USER_NAMES: Record<Role, string> = {
  ADMIN: "赖礼尊", // 管理员
  DEP_SURGERY: "江昊", // 外科专管员
  DEP_INTERNAL: "王芳", // 内科专管员
};

export function getCurrentUserName(): string {
  try {
    const savedName = localStorage.getItem("currentUserName");
    if (savedName) return savedName;
    const currentRole = (localStorage.getItem("currentRole") as Role) || "ADMIN";
    return ROLE_USER_NAMES[currentRole] || "赖礼尊";
  } catch (e) {
    return "赖礼尊";
  }
}

interface UserContextType {
  role: Role;
  userName: string;
  setRole: (role: Role) => void;
  setUserName: (name: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRoleState] = useState<Role>(() => {
    return (localStorage.getItem("currentRole") as Role) || "ADMIN";
  });
  const [userName, setUserNameState] = useState<string>(() => {
    return getCurrentUserName();
  });

  const setUserName = (name: string) => {
    setUserNameState(name);
    localStorage.setItem("currentUserName", name);
  };

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    localStorage.setItem("currentRole", newRole);
    // If not customized, switch to default name for that role
    if (!localStorage.getItem("currentUserName")) {
      setUserNameState(ROLE_USER_NAMES[newRole] || "赖礼尊");
    }
    
    // Redirect if current page is not accessible by the new role
    const currentMenu = visibleMenuItems.find(m => location.pathname.startsWith(m.path.replace("/index", "")));
    if (currentMenu && !currentMenu.roles.includes(newRole)) {
      navigate("/task-fill-report/departments/index");
    } else if (location.pathname === "/task-management/task-list/index" && newRole !== "ADMIN") {
      navigate("/task-fill-report/departments/index");
    }
  };

  return (
    <UserContext.Provider value={{ role, userName, setRole, setUserName }}>
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
