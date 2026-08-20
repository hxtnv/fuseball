import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Game from "./views/game";
import Navbar from "@/components/domain/navbar";
import Sidebar from "@/components/domain/sidebar";
import Home from "@/views/home";
import "./index.css";
import "./reset.css";

const router = createBrowserRouter([
  // { path: "/auth/callback/:token", element: <AuthCallback /> },
  {
    path: "/game",
    element: (
      <App>
        <Game />
      </App>
    ),
  },
  {
    path: "/*",
    element: (
      <App>
        <Navbar />
        <Sidebar />
        <Home />
      </App>
    ),
  },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
