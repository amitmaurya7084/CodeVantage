import api from "./api";

export async function fetchProgramsAdmin() {
  const { data } = await api.get("/admin/programs");
  return data.programs;
}

export async function createProgram(payload) {
  const { data } = await api.post("/admin/programs", payload);
  return data;
}

export async function updateProgram(id, payload) {
  const { data } = await api.put(`/admin/programs/${id}`, payload);
  return data;
}

export async function deleteProgram(id) {
  const { data } = await api.delete(`/admin/programs/${id}`);
  return data;
}
