
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { router } from './Routes/Routes.jsx'
import { RouterProvider } from "react-router-dom";
import AuthProvider from './providers/AuthProvider.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ThemeProvider from './providers/ThemeProvider.jsx';


const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider> 
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)