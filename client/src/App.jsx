import { BrowserRouter, Routes, Route } from "react-router-dom" 

function App() {
    return (
    <BrowserRouter>
      <Routes>
        <Route>
          <Route path="/" />
          <Route path="/information" />
          <Route path="/ai" />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
