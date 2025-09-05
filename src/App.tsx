import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routes } from "./routes";

function App() {
  return (
    <Router>
      <Routes>
        {Object.entries(routes).map(([path, Component]) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
      </Routes>
    </Router>
  );
}

export default App;
