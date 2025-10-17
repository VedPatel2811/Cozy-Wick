import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router"
import './index.css'
import App from './App.tsx'
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>        
      <App />
    </AuthProvider>
  </BrowserRouter>,
)
