// Use Vite's import.meta.env for environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * @typedef {Object} LoginResponse
 * @property {string} token
 * @property {import("../types").User} user
 */

/**
 * @typedef {Object} SignupInput
 * @property {string} name
 * @property {string} email
 * @property {string} password
 * @property {string} dob
 * @property {import("../types").Sex} sex
 * @property {string} phone
 */

function mapUser(account) {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    patientId: account.patientId
  };
}

export async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || 'Invalid email or password');
    }

    const data = await response.json();
    return {
      token: data.token,
      user: mapUser(data.user || data.account)
    };
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
}

export async function signup(input) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: input.name,
        email: input.email,
        password: input.password,
        dob: input.dob,
        sex: input.sex,
        phone: input.phone
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || 'Could not create account');
    }

    const data = await response.json();
    return {
      token: data.token,
      user: mapUser(data.user || data.account)
    };
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
}

export async function fetchCurrentUser(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Session expired');
    }

    const data = await response.json();
    return mapUser(data);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
}

export async function updateProfile(token, input) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || 'Could not update profile');
    }

    const data = await response.json();
    return mapUser(data);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
}

export async function changePassword(token, currentPassword, newPassword) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me/password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || 'Could not change password');
    }

    return true;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
}