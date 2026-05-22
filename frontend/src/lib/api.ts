const DJANGO_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const FASTAPI_URL = "http://localhost:8001";

interface RequestOptions extends RequestInit {
  useFastApi?: boolean;
  token?: string | null;
}

// Low-level fetch wrapper
async function apiRequest(endpoint: string, options: RequestOptions = {}) {
  const isFastApi = options.useFastApi || false;
  const baseUrl = isFastApi ? FASTAPI_URL : DJANGO_URL;
  const url = `${baseUrl}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Inject token
  let token = options.token;
  if (token === undefined && typeof window !== "undefined") {
    token = localStorage.getItem("access_token");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = "API request failed";
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.error || JSON.stringify(errJson);
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  // Authentication
  login: (credentials: any) => apiRequest("/api/auth/login/", { method: "POST", body: JSON.stringify(credentials) }),
  register: (userData: any) => apiRequest("/api/auth/register/", { method: "POST", body: JSON.stringify(userData) }),
  getProfile: () => apiRequest("/api/auth/me/"),

  // Dashboard
  getDashboard: () => apiRequest("/api/dashboard/"),

  // Roadmaps
  getRoadmaps: () => apiRequest("/api/roadmaps/"),
  getRoadmapDetail: (id: number) => apiRequest(`/api/roadmaps/${id}/`),
  generateRoadmap: (payload: { goal: string; skill_level: string; hours_per_week: number }) =>
    apiRequest("/api/roadmaps/generate/", { method: "POST", body: JSON.stringify(payload) }),

  // Courses & Lessons
  getCourses: () => apiRequest("/api/courses/"),
  getCourseDetail: (id: number) => apiRequest(`/api/courses/${id}/`),
  getCourseLessons: (courseId: number) => apiRequest(`/api/courses/${courseId}/lessons/`),
  getLessonDetail: (lessonId: string) => apiRequest(`/api/lessons/${lessonId}/`),
  completeLesson: (lessonId: string) => apiRequest(`/api/lessons/${lessonId}/complete/`, { method: "POST" }),

  // AI Service Helpers (FastAPI microservice endpoints accessed via frontend directly)
  generateAINotes: (topic: string) => apiRequest("/api/ai/generate-notes", { useFastApi: true, method: "POST", body: JSON.stringify({ topic }) }),
  generateAIQuiz: (topic: string) => apiRequest("/api/ai/generate-quiz", { useFastApi: true, method: "POST", body: JSON.stringify({ topic }) }),
  submitQuiz: (payload: { topic: string; score: number; total_questions: number }) =>
    apiRequest("/api/assessments/submit/", { method: "POST", body: JSON.stringify(payload) }),

  // Progress Graphs & Leaderboard
  getWeeklyProgress: () => apiRequest("/api/progress/weekly/"),
  getConceptsProgress: () => apiRequest("/api/progress/concepts/"),
  getLeaderboard: () => apiRequest("/api/progress/leaderboard/"),
  getTrendingTopics: () => apiRequest("/api/progress/trends/"),

  // Mentors
  getMentors: () => apiRequest("/api/mentors/"),
  getMentorDetail: (id: number) => apiRequest(`/api/mentors/${id}/`),
  connectMentor: (id: number) => apiRequest(`/api/mentors/${id}/connect/`, { method: "POST" }),
  bookMentor: (id: number, bookingData: any) =>
    apiRequest(`/api/mentors/${id}/book/`, { method: "POST", body: JSON.stringify(bookingData) }),
  getTrendingMentors: () => apiRequest("/api/mentors/trending/"),

  // AI Study Room
  startStudySession: (goalMinutes: number) =>
    apiRequest("/api/study-sessions/start/", { method: "POST", body: JSON.stringify({ goal_minutes: goalMinutes }) }).catch(() => ({ id: 1 })), // Fallback for MVP
  endStudySession: (sessionId: number, payload: { focus_score: number; distraction_count: number; duration_minutes: number }) =>
    apiRequest(`/api/study-sessions/${sessionId}/end/`, { method: "POST", body: JSON.stringify(payload) }).catch(() => ({ status: "success", xp_earned: 50 })),

  // Mock Interviews
  startMockInterview: (topic: string, difficulty: string) =>
    apiRequest("/api/interviews/start/", { method: "POST", body: JSON.stringify({ topic, difficulty }) }),
  submitInterviewAnswer: (interviewId: number, questionId: number, answer: string) =>
    apiRequest(`/api/interviews/${interviewId}/submit-answer/`, { method: "POST", body: JSON.stringify({ question_id: questionId, answer }) }),
  getInterviewReport: (interviewId: number) => apiRequest(`/api/interviews/${interviewId}/report/`),

  // Certificates
  getCertificates: () => apiRequest("/api/certificates/"),
  getCertificateDownloadUrl: (id: number) => `${DJANGO_URL}/api/certificates/${id}/download/`,
  verifyCertificate: (certId: string) => apiRequest(`/api/certificates/verify/${certId}/`),
};
