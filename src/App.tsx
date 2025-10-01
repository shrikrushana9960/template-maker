import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ListingScreen from "./pages/listing";
import Editor from "./pages/canvas";

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
