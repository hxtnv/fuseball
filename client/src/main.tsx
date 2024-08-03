import ReactDOM from "react-dom/client";
import App from "./App";
import AuthCallback from "@/views/auth/callback";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import "./reset.css";

const router = createBrowserRouter([
  { path: "/auth/callback/:token", element: <AuthCallback /> },
  {
    path: "/*",
    element: <App />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
