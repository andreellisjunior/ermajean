import axios from "axios";
import { router } from "expo-router";
import { supabase } from "./supabase";
const configured =
  process.env.EXPO_PUBLIC_API_URL || "https://ermajean.com/api";
if (
  !/^https:\/\//.test(configured) &&
  !(
    __DEV__ &&
    /^http:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2)(:\d+)?\//.test(configured)
  )
) {
  throw new Error(
    "EXPO_PUBLIC_API_URL must use HTTPS (localhost HTTP is allowed only in development).",
  );
}
const apiClient = axios.create({
  baseURL: configured.replace(/\/$/, ""),
  timeout: 60000,
});
apiClient.interceptors.request.use(async (request) => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) throw error;
  if (session?.access_token)
    request.headers.set("Authorization", `Bearer ${session.access_token}`);
  return request;
});
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      error.message = "Your session has ended. Please sign in again.";
      router.replace("/(auth)/sign-in");
    } else if (error.code === "ECONNABORTED") {
      error.message =
        "Dinner is taking a little longer. Try again; the same request will not count twice.";
    } else {
      error.message =
        error.response?.data?.error ||
        error.message ||
        "Could not reach your kitchen. Check your connection and try again.";
    }
    return Promise.reject(error);
  },
);
export default apiClient;
