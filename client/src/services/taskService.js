import api from "./api";

export async function fetchMyTasks() {
  const { data } = await api.get("/tasks/my");
  return data;
}

export async function fetchTaskById(id) {
  const { data } = await api.get(`/tasks/${id}`);
  return data;
}
