import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true // important so browser sends cookies (refresh_token)
});

export default api;
