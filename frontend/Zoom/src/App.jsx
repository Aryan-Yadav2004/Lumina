import React from 'react'
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Landing from './pages/landing';
import Authentication from './pages/Authentication';
import { AuthProvider } from './contexts/AuthContext';
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<Landing/>} />

          <Route path='/auth' element={<Authentication/>} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App