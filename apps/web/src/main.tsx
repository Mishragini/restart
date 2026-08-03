import { createRoot } from "react-dom/client";
import "./style.css";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router";
import { Login } from "./components/login";
import { Signup } from "./components/signup";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/sonner";
import LandingPage from "./components/landing";
import { Navbar } from "./components/navabar";
import Dashboard from "./components/dashboard";
import MarketPage from "./components/market";

const queryClient = new QueryClient();

const App = () => <LandingPage />;

const Root = () => (
  <QueryClientProvider client={queryClient}>
    <Outlet />
    <Toaster />
  </QueryClientProvider>
);

const LayoutWithNavbar = () => {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
};

export const router = createBrowserRouter([
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
      {
        element: <LayoutWithNavbar />,
        children: [
          {
            path: "/dashboard",
            element: <Dashboard />,
          },
          {
            path: "/market/:marketId",
            element: <MarketPage />,
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("app")!).render(
  <RouterProvider router={router} />,
);
