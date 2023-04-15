import React from "react";
import { Button } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import { Link } from "react-router-dom";

export default function NavBar({ isLoggedIn, handleLogout }) {
  return (
    <Navbar bg="light" expand="sm" className="mb-3">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          Navbar Offcanvas
        </Navbar.Brand>
        <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-sm`} />
        <Navbar.Offcanvas
          id={`offcanvasNavbar-expand-sm`}
          aria-labelledby={`offcanvasNavbarLabel-expand-sm`}
          placement="end"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id={`offcanvasNavbarLabel-expand-sm`}>
              Offcanvas
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="justify-content-end flex-grow-1 pe-3">
              <Nav.Link as={Link} to="/">
                Home
              </Nav.Link>
              {!isLoggedIn ? (
                <Button
                  as={Link}
                  to="/login"
                  variant="outline-primary"
                  className="btn-sm"
                >
                  Login
                </Button>
              ) : null}
              {isLoggedIn ? (
                <React.Fragment>
                  <Nav.Link as={Link} to="/admin">
                    Admin
                  </Nav.Link>
                  <Button
                    variant="outline-danger"
                    className="btn-sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </React.Fragment>
              ) : null}
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}
