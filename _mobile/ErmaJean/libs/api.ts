import axios from "axios";
import { router } from "expo-router";

const apiClient = axios.create({
  baseURL: "https://ermajean.com/api",
});

apiClient.interceptors.response.use(
  function (response) {
    return response.data;
  },
  function (error) {
    let message = "";

    if (error.response?.status === 401) {
      message = "Your session has ended. Please sign in again.";
      // Navigate to sign-in page
      router.replace("/(auth)/sign-in");
    } else if (error.response?.status === 403) {
      message = "Pick a plan to use this feature";
    } else {
      message =
        error?.response?.data?.error || error.message || error.toString();
    }

    error.message =
      typeof message === "string" ? message : JSON.stringify(message);

    return Promise.reject(error);
  },
);

export default apiClient;
