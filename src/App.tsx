import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Editor from "./pages/canvas";
import ListingScreen from "./pages/listing";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ListingScreen />} />
        <Route path="/canvas" element={<Editor />} />
      </Routes>
    </Router>
  );
}

export default App;
