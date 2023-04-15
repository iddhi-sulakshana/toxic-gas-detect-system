import React, { useEffect, useState } from "react";
import NavBar from "./NavBar";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import {
  BrowserRouter as Router,
  Route,
  Navigate,
  Routes,
} from "react-router-dom";
import Home from "./pages/Home";
import Container from "react-bootstrap/esm/Container";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);
  }, []);
  return (
    <Router>
      <div>
        <NavBar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
        <Container>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route
              path="/l"
              element={isLoggedIn ? <Admin /> : <Navigate to="/login" />}
            />
            <Route
              exact
              path="/login"
              element={
                !isLoggedIn ? (
                  <Login setIsLoggedIn={setIsLoggedIn} />
                ) : (
                  <Navigate to="/admin" />
                )
              }
            />
            <Route
              exact
              path="/admin"
              element={isLoggedIn ? <Admin /> : <Navigate to="/login" />}
            />
          </Routes>
        </Container>
      </div>
    </Router>
  );
};

export default App;
