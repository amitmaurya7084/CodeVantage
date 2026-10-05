import api from "./api";

export async function fetchAllContentAdmin() {
  const { data } = await api.get("/admin/content");
  return data.content;
}

export async function updateContentBlock(key, contentData) {
  const { data } = await api.put(`/admin/content/${key}`, { data: contentData });
  return data;
}
