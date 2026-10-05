import { createContext, useContext, useEffect, useState } from "react";
import {
  loginAdmin as apiLogin,
  logoutAdmin as apiLogout,
  fetchCurrentAdmin,
} from "../services/adminAuthService";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCurrentAdmin()
      .then((data) => setAdmin(data.admin))
      .catch(() => setAdmin(null))
      .finally(() => setIsLoading(false));
  }, []);

  async function login(payload) {
    const data = await apiLogin(payload);
    setAdmin(data.admin);
    return data;
  }

  async function logout() {
    await apiLogout();
    setAdmin(null);
  }

  return (
    <AdminAuthContext.Provider value={{ admin, isLoading, isAuthenticated: !!admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  return ctx;
}
