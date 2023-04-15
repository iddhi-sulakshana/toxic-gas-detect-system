import React, { useState } from "react";
import { Form } from "react-bootstrap";
import Button from "react-bootstrap/Button";

export default function SuperAdmin() {
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [mine, setMine] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.target.querySelector("button:last-of-type").disabled = true;
    const response = await fetch("http://localhost:4001/mine", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        location,
        mine,
        password,
      }),
    });
    if (response.ok) {
      const { message } = await response.json();
      e.target.querySelectorAll("input").forEach((input) => (input.value = ""));
      setEmail("");
      setLocation("");
      setMine("");
      setPassword("");
      alert(message);
    } else {
      const { message } = await response.json();
      alert(message);
    }
    e.target.querySelector("button:last-of-type").disabled = false;
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="email">
        <Form.Label>Email address</Form.Label>
        <Form.Control type="email" onChange={(e) => setEmail(e.target.value)} />
      </Form.Group>
      <Form.Group className="mb-3" controlId="location">
        <Form.Label>Location</Form.Label>
        <Form.Control
          type="text"
          onChange={(e) => setLocation(e.target.value)}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="mine">
        <Form.Label>Mine Id</Form.Label>
        <Form.Control type="text" onChange={(e) => setMine(e.target.value)} />
      </Form.Group>
      <Form.Group className="mb-3" controlId="password">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form.Group>
    </Form>
  );
}
