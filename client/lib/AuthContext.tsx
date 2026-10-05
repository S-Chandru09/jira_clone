"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  group?: string;
  createdAt?: any;
};

export type Project = {
  id: string;
  name: string;
  key?: string;
  ownerId?: string;
  memberIds?: string[];
  description?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  // =========================
  // LOAD USER
  // =========================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  // =========================
  // LOGIN
  // =========================
  const login = (userData: User) => {
    // Clear any project belonging to a previous account
    setSelectedProject(null);
    localStorage.removeItem("selectedProject");

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {
    setUser(null);
    setSelectedProject(null);

    localStorage.removeItem("user");
    localStorage.removeItem("selectedProject");
  };

  // =========================
  // SELECT PROJECT
  // =========================
  const handleSelectProject = (project: Project | null) => {
    setSelectedProject(project);

    if (project) {
      localStorage.setItem(
        "selectedProject",
        JSON.stringify(project)
      );
    } else {
      localStorage.removeItem("selectedProject");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        selectedProject,
        setSelectedProject: handleSelectProject,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return ctx;
};