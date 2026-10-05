import api from "./api";

export async function fetchPrograms(params) {
  const { data } = await api.get("/programs", { params });
  return data.programs;
}

export async function searchPrograms(query) {
  const { data } = await api.get("/programs", { params: { search: query } });
  return data.programs;
}

export async function fetchProgramBySlug(slug) {
  const { data } = await api.get(`/programs/${slug}`);
  return data.program;
}

export async function fetchProgramTasks(slug) {
  const { data } = await api.get(`/programs/${slug}/tasks`);
  return data.tasks;
}
