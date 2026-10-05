import api from "./api";

export async function submitTask(taskId, payload) {
  const { data } = await api.post(`/submissions/${taskId}`, payload);
  return data;
}

export async function fetchMySubmissions() {
  const { data } = await api.get("/submissions/my");
  return data;
}
