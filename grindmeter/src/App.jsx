import { createBrowserRouter, RouterProvider, Route } from "react-router-dom";
import { createRoutesFromElements } from "react-router-dom";

import "./App.css";

// Pages
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import RootLayout from "./layouts/RootLayout";
import Login from "./pages/Login";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<Home />} />
      <Route path="settings" element={<Settings />} />
      <Route path="login" element={<Login />} />
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
