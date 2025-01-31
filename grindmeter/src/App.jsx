import { createBrowserRouter, RouterProvider, Route } from "react-router-dom";
import { createRoutesFromElements } from "react-router-dom";
import { PresetProvider } from "./components/PresetContext";

import "./App.css";

// Pages
import Home from "./pages/Home";
import RootLayout from "./layouts/RootLayout";
import Login from "./pages/Login";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path="/"
      element={
        <PresetProvider>
          <RootLayout />
        </PresetProvider>
      }
    >
      <Route index element={<Home />} />
      <Route path="login" element={<Login />} />
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
