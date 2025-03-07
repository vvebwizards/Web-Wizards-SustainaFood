import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // Import AuthProvider
import { SocketProvider } from './context/SocketContext.tsx';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter> 
      <AuthProvider>
      <SocketProvider> 
          <App />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);

