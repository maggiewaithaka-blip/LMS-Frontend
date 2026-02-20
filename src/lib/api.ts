const API_BASE_URL = "https://lms.careerguidancecollege.com";

// --- Interface Definitions ---

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Attachment {
  id: number;
  type: string;
  file: string | null;
  url: string | null;
  text: string | null;
  created_at: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  instructor?: string;
  duration?: string;
  progress?: number;
}

export interface ScormPackage {
  id: number;
  name: string;
  launch_url: string;
}

export interface Sections {
  id: number;
  course: number;
  title: string;
  summary: string;
  position: number;

  assignments: {
    id: number;
    title: string;
    description: string;
    attachments: Attachment[];
  }[];

  quizzes: {
    id: number;
    title: string;
    description: string;
    attachments: Attachment[];
  }[];

  resources: {
    id: number;
    title: string;
    description: string;
    text?: string;
    attachments: Attachment[];
  }[];

  scorm_packages?: ScormPackage[];
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

// --- API Service Class ---

class ApiService {
  constructor() {}

  private getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private saveTokens(access: string, refresh: string) {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }

  public clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    let currentAccessToken = this.getAccessToken();
    let currentRefreshToken = this.getRefreshToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (currentAccessToken) {
      headers['Authorization'] = `Bearer ${currentAccessToken}`;
    }

    const makeFetch = (url: string, opts: RequestInit) =>
      fetch(url, { ...opts, headers });

    let response = await makeFetch(url, options);

    if (!response.ok) {
      if (response.status === 401 && currentRefreshToken) {
        const newAccessToken = await this.refreshAccessToken();

        if (newAccessToken) {
          currentAccessToken = newAccessToken;
          headers['Authorization'] = `Bearer ${currentAccessToken}`;

          response = await makeFetch(url, options);

          if (response.ok) return response.json();
        }

        this.clearTokens();
        throw new Error('Session expired or authentication failed.');
      }

      const error = await response
        .json()
        .catch(() => ({ detail: 'An error occurred' }));
      throw new Error(
        error.detail || `Request failed with status ${response.status}`
      );
    }

    return response.json();
  }

  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/token/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    this.saveTokens(response.access, response.refresh);
    return response;
  }

  public async refreshAccessToken(): Promise<string | null> {
    const token = this.getRefreshToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: token }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      return data.access;
    } catch {
      return null;
    }
  }

  public async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/users/me/');
  }

  public async getEnrolledCourses(): Promise<Course[]> {
    return this.request<Course[]>('/api/courses/enrolled/');
  }

  public async getCourseDetail(courseId: number): Promise<Course> {
    return this.request<Course>(`/api/courses/${courseId}/`);
  }

  public async getCourseSections(courseId: number): Promise<Sections[]> {
    return this.request<Sections[]>(`/api/courses/${courseId}/sections/`);
  }

  public async getAttachments(params?: {
    assignment?: number;
    quiz?: number;
    resource?: number;
  }): Promise<Attachment[]> {
    const query = new URLSearchParams();

    if (params?.assignment)
      query.append('assignment', String(params.assignment));
    if (params?.quiz)
      query.append('quiz', String(params.quiz));
    if (params?.resource)
      query.append('resource', String(params.resource));

    return this.request<Attachment[]>(
      `/api/attachments/?${query.toString()}`
    );
  }

  // ✅ ADD CHANGE PASSWORD
  public async changePassword(old_password: string, new_password: string): Promise<any> {
    return this.request('/api/users/change-password/', {
      method: 'POST',
      body: JSON.stringify({
        old_password,
        new_password
      }),
    });
  }

  public logout() {
    this.clearTokens();
  }

  public isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }
}

export const api = new ApiService();
