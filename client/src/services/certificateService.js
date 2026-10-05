import api from "./api";

/**
 * Public certificate template text content (heading, description, footer,
 * tech badges, etc.) — powers the sample-certificate preview on the public
 * Certificates page, kept in sync with whatever the admin has configured.
 * Backend route: GET /api/certificates/template/public (public, no auth)
 */
export async function fetchPublicCertificateTemplateContent() {
  const { data } = await api.get("/certificates/template/public");
  return data.content;
}

/**
 * Looks up a certificate by its public ID.
 * Backend route: GET /api/certificates/verify/:certificateId (public, no auth)
 */
export async function verifyCertificate(certificateId) {
  const { data } = await api.get(`/certificates/verify/${encodeURIComponent(certificateId)}`);
  return data;
}

export async function fetchMyCertificate() {
  const { data } = await api.get("/certificates/my");
  return data;
}

export async function retryGenerateCertificate() {
  const { data } = await api.post("/certificates/generate");
  return data;
}

/** Triggers a browser download of the logged-in student's certificate PDF. */
export function downloadMyCertificateUrl() {
  return `${api.defaults.baseURL}/certificates/my/download`;
}
