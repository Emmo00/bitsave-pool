import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routes } from "./routes";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <Router>
      <Routes>
        {Object.entries(routes).map(([path, Component]) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
