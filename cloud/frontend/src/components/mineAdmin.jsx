import React from "react";
import Button from "react-bootstrap/Button";
import { Form } from "react-bootstrap";

export default function MineAdmin(props) {
  const { token, decoded } = props;
  return (
    <React.Fragment>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Email address</Form.Label>
        <Form.Control type="email" value={decoded.email} disabled />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Location</Form.Label>
        <Form.Control type="text" value={decoded.location} disabled />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Mine Id</Form.Label>
        <Form.Control type="text" value={decoded.mine} disabled />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Token</Form.Label>
        <Form.Control as="textarea" value={token} rows={5} disabled />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Button
          variant="primary"
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(token);
            alert("Token Copied to Clipboard");
          }}
        >
          Copy Token
        </Button>
      </Form.Group>
    </React.Fragment>
  );
}
