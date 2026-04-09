const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '');

function getSessionToken() {
  return localStorage.getItem('sessionToken') || sessionStorage.getItem('sessionToken') || null;
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof body === 'object' && body?.message
        ? body.message
        : typeof body === 'string' && body
          ? body
          : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return body;
}

export async function apiRequest(path, options = {}) {
  const sessionToken = getSessionToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken ? { 'X-Session-Token': sessionToken } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  return parseResponse(response);
}

export async function apiGet(path, headers) {
  return apiRequest(path, { method: 'GET', headers });
}

export async function apiPost(path, body, headers) {
  return apiRequest(path, {
    method: 'POST',
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function apiPut(path, body, headers) {
  return apiRequest(path, {
    method: 'PUT',
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function apiPatch(path, body, headers) {
  return apiRequest(path, {
    method: 'PATCH',
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function apiDelete(path, headers) {
  return apiRequest(path, {
    method: 'DELETE',
    headers,
  });
}

export { API_BASE_URL };
