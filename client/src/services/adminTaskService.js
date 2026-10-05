import api from "./api";

export async function fetchProgramTasksAdmin(programId) {
  const { data } = await api.get(`/admin/programs/${programId}/tasks`);
  return data.tasks;
}

export async function createTask(programId, payload) {
  const { data } = await api.post(`/admin/programs/${programId}/tasks`, payload);
  return data;
}

export async function updateTask(id, payload) {
  const { data } = await api.put(`/admin/tasks/${id}`, payload);
  return data;
}

export async function deleteTask(id) {
  const { data } = await api.delete(`/admin/tasks/${id}`);
  return data;
}
