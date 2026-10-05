import { createContext, useContext, useEffect, useState } from "react";
import {
  registerStudent as apiRegister,
  loginStudent as apiLogin,
  logoutStudent as apiLogout,
  fetchCurrentStudent,
  updateStudentProfile,
  uploadStudentProfilePicture,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On app load, check if a valid session cookie already exists.
    fetchCurrentStudent()
      .then((data) => setStudent(data.student))
      .catch(() => setStudent(null))
      .finally(() => setIsLoading(false));
  }, []);

  async function register(payload) {
    const data = await apiRegister(payload);
    setStudent(data.student);
    return data;
  }

  async function login(payload) {
    const data = await apiLogin(payload);
    setStudent(data.student);
    return data;
  }

  async function logout() {
    await apiLogout();
    setStudent(null);
  }

  // Both resolve to { student }, so the context's `student` reflects the save
  // immediately — Profile.jsx never needs to re-fetch /auth/me after an edit.
  async function updateProfile(payload) {
    const data = await updateStudentProfile(payload);
    setStudent(data.student);
    return data;
  }

  async function uploadProfilePicture(file) {
    const data = await uploadStudentProfilePicture(file);
    setStudent(data.student);
    return data;
  }

  return (
    <AuthContext.Provider
      value={{
        student,
        isLoading,
        isAuthenticated: !!student,
        register,
        login,
        logout,
        updateProfile,
        uploadProfilePicture,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
