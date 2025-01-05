import { createBroswerRouter, Route } from "react-router-dom";
import "./App.css";

// Pages
import Home from "./pages/Home";
import Settings from "./pages/Settings";

const router = createBroswerRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route index element={<Home />} />
      <Route index element={<Settings />} />
    </Route>
  )
);

function App() {
  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
