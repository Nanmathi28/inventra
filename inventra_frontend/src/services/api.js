const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function getToken() {
  return localStorage.getItem('inventra_token');
}

async function parseResponse(response, requestUrl, requestPayload) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = data?.detail || data?.error || response.statusText || 'API request failed';
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    console.error('API Error:', {
      url: requestUrl,
      status: response.status,
      message,
      requestPayload,
      responseData: data
    });
    throw error;
  }
  console.log('API Success:', {
    url: requestUrl,
    status: response.status,
    response: data
  });
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
  const url = `${API_BASE_URL}${path}`;
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

  console.log('API Request:', {
    method,
    url,
    payload: body
  });
  const response = await fetch(url, init);
  return parseResponse(response, url, body);
}

export async function loginRequest(email, password) {
  const url = `${API_BASE_URL}/auth/login`;
  const body = new URLSearchParams({ username: email, password });
  console.log('API Request:', {
    method: 'POST',
    url,
    payload: { email }
  });
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  return parseResponse(response, url, { email });
}

export async function registerRequest(payload) {
  return request('/auth/register', { method: 'POST', body: payload });
}

export const api = {
  get: path => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  delete: path => request(path, { method: 'DELETE' }),
  del: path => request(path, { method: 'DELETE' }),
};

export async function uploadPrescription(file) {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem("inventra_token");

  const response = await fetch(
    `${API_BASE_URL}/prescriptions/upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  return parseResponse(
    response,
    `${API_BASE_URL}/prescriptions/upload`,
    "Upload Prescription"
  );
}

export async function getPrescriptions() {
  return api.get("/prescriptions");
}

export const changePassword = (data) =>
  api.put("/auth/change-password", data);

