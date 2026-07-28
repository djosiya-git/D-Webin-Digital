const USERS_KEY = "portfolio-users";
const SESSION_KEY = "portfolio-session";
const PROJECTS_KEY = "portfolio-projects";
const MESSAGES_KEY = "portfolio-messages";

const defaultUsers = [
  {
    id: 1,
    name: "Djosiya Admin",
    username: "admin",
    password: "admin123",
    role: "admin",
  },
];

export function getUsers() {
  const storedUsers = localStorage.getItem(USERS_KEY);

  if (storedUsers) {
    return JSON.parse(storedUsers);
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  return defaultUsers;
}

export function loginUser(username, password) {
  return getUsers().find(
    (user) => user.username === username && user.password === password,
  );
}

export function getSessionUser() {
  const storedSession = localStorage.getItem(SESSION_KEY);
  return storedSession ? JSON.parse(storedSession) : null;
}

export function saveSessionUser(user) {
  const sessionUser = {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  return sessionUser;
}

export function clearSessionUser() {
  localStorage.removeItem(SESSION_KEY);
}

export function getStoredProjects(defaultProjects) {
  const storedProjects = localStorage.getItem(PROJECTS_KEY);

  if (storedProjects) {
    return JSON.parse(storedProjects);
  }

  localStorage.setItem(PROJECTS_KEY, JSON.stringify(defaultProjects));
  return defaultProjects;
}

export function saveStoredProjects(projects) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function getStoredMessages() {
  const storedMessages = localStorage.getItem(MESSAGES_KEY);

  if (storedMessages) {
    return JSON.parse(storedMessages);
  }

  const defaultMessages = [
    {
      id: 1,
      name: "Recruiter",
      email: "recruiter@example.com",
      message: "Halo, kami tertarik melihat portfolio dan proyek Anda.",
    },
  ];

  localStorage.setItem(MESSAGES_KEY, JSON.stringify(defaultMessages));
  return defaultMessages;
}

export function saveStoredMessages(messages) {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}
