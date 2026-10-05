import api from "./api";

export async function fetchAnalyticsStats() {
  const { data } = await api.get("/admin/analytics");
  return data.stats;
}
