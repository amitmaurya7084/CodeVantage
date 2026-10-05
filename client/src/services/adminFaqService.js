import api from "./api";

export async function fetchFaqsAdmin() {
  const { data } = await api.get("/admin/faqs");
  return data.faqs;
}

export async function createFaq(payload) {
  const { data } = await api.post("/admin/faqs", payload);
  return data;
}

export async function updateFaq(id, payload) {
  const { data } = await api.put(`/admin/faqs/${id}`, payload);
  return data;
}

export async function deleteFaq(id) {
  const { data } = await api.delete(`/admin/faqs/${id}`);
  return data;
}
