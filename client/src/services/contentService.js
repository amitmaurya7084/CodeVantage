import api from "./api";

/** Pass an array of keys to fetch just those blocks, or omit for everything. */
export async function fetchContent(keys) {
  const params = keys ? { keys: keys.join(",") } : {};
  const { data } = await api.get("/content", { params });
  return data.content; // { "home.hero": {...}, "home.techTools": {...} }
}
