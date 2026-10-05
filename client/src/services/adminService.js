import api from "./api";

export async function fetchAdminDashboard() {
  const { data } = await api.get("/admin/dashboard");
  return data;
}

export async function fetchStudents(params) {
  const { data } = await api.get("/admin/students", { params });
  return data;
}

export async function fetchStudentById(id) {
  const { data } = await api.get(`/admin/students/${id}`);
  return data;
}

export async function fetchReviewQueue(params) {
  const { data } = await api.get("/admin/reviews", { params });
  return data;
}

export async function fetchSubmissionDetail(id) {
  const { data } = await api.get(`/admin/reviews/${id}`);
  return data;
}

export async function decideSubmission(id, payload) {
  const { data } = await api.post(`/admin/reviews/${id}/decision`, payload);
  return data;
}

export async function fetchAllPayments(params) {
  const { data } = await api.get("/admin/payments", { params });
  return data;
}

export async function approvePayment(id) {
  const { data } = await api.post(`/admin/payments/${id}/approve`);
  return data;
}

export async function rejectPayment(id, reason) {
  const { data } = await api.post(`/admin/payments/${id}/reject`, { reason });
  return data;
}

export async function fetchAllCertificates() {
  const { data } = await api.get("/admin/certificates");
  return data;
}
