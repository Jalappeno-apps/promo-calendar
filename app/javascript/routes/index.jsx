import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "../components/Homepage/Homepage";

export default (
  <Router>
    <Routes>
      <Route path="/" element={<Homepage />} />
    </Routes>
  </Router>
);
