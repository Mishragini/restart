import { createRoot } from "react-dom/client";
import "./style.css";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router";
import { Login } from "./components/login";
import { Signup } from "./components/signup";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/sonner";
import LandingPage from "./components/landing";

const queryClient = new QueryClient();

const App = () => <LandingPage />;

const Root = () => (
  <QueryClientProvider client={queryClient}>
    <Outlet />
    <Toaster />
  </QueryClientProvider>
);

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      {
        path: "/",
        element: <App />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
    ],
  },
]);

createRoot(document.getElementById("app")!).render(
  <RouterProvider router={router} />,
);
