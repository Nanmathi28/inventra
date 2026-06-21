const API_BASE_URL = 'http://127.0.0.1:8000';

function getToken() {
  return localStorage.getItem('inventra_token');
}

async function parseResponse(response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = data?.detail || data?.error || response.statusText || 'API request failed';
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    console.error('API Error:', { status: response.status, message, data });
    throw error;
  }
  console.log('API Success:', data);
  return data;
}

function createHeaders(custom = {}) {
  const headers = {
    Accept: 'application/json',
    ...custom,
  };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const init = {
    method,
    headers: createHeaders(headers),
  };

  if (body !== undefined && body !== null) {
    if (body instanceof FormData) {
      init.body = body;
      delete init.headers['Content-Type'];
    } else if (typeof body === 'string') {
      init.body = body;
    } else {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }
  }

  console.log(`API Request: ${method} ${API_BASE_URL}${path}`, body);
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  return parseResponse(response);
}

export async function loginRequest(email, password) {
  const body = new URLSearchParams({ username: email, password });
  console.log(`Login Request: ${API_BASE_URL}/auth/login`, { email });
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  return parseResponse(response);
}

export async function registerRequest(payload) {
  console.log(`Register Request: ${API_BASE_URL}/auth/register`, payload);
  return request('/auth/register', { method: 'POST', body: payload });
}

export const api = {
  get: path => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: path => request(path, { method: 'DELETE' }),
};
