const baseUrl = process.env.REACT_APP_API;

// Login
export const LOGIN_URL = baseUrl + "/auth/login";
export const SIGNUP_URL = baseUrl + "/auth/register";
export const FORGET_PASSWORD_URL = baseUrl + "/auth/forgot-password";
export const CURRENT_USER_URL = baseUrl + "/user/me";
export const ALL_USERS_URL = baseUrl + "/user/users";

// Personal chat
export const PERSONAL_CHAT_URL = baseUrl + "/personal-chat";

// Group chat
export const GROUP_URL = baseUrl + "/group";