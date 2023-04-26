import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ArticlePreview from "./components/ArticlePreview";
import Home from "./components/Home";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path=":id" element={<ArticlePreview />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
