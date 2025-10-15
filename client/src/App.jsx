import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Ai from "./pages/Ai";

function App() {
    return (
    <BrowserRouter>
      <Toaster position="top-center"/>
        <Routes>
          <Route>
            <Route path="/" element={<Home/>}/>
            <Route path="/dashboard" element={<Dashboard/>}/>
            <Route path="/ai" element={<Ai/>}/>
          </Route>
        </Routes>
    </BrowserRouter>
  )
}

export default App
