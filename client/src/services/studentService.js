import api from "./api";

export async function fetchDashboard() {
  const { data } = await api.get("/students/dashboard");
  return data;
}
