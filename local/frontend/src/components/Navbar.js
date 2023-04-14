import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import img1 from "../images/smart-tech-2.png";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "./Navbar.css";

export const Navbar1 = (props) => {
  const [smShow, setSmShow] = useState(false);
  const [message, setMessage] = useState("");
  async function uploadToCloud(element) {
    element.target.disabled = true;
    const response = await fetch("http://localhost:3001/upload");
    if (response.status === 200)
      setMessage("Successfully Uploaded to the cloud");
    else setMessage("Failed uplaod check your internet connection");
    setSmShow(true);
    element.target.disabled = false;
  }
  return (
    <div>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="#home">
            <img
              alt=""
              src={img1}
              width="30"
              height="30"
              className="d-inline-block align-top"
              style={{ borderRadius: "50px" }}
            />{" "}
            <span style={{ fontWeight: "bold", fontSize: "30px" }}>
              APE StartUp EKApuliye
            </span>
          </Navbar.Brand>
          <Button
            className="fade-in-out"
            variant={props.isConnected ? "success" : "danger"}
          >
            {props.isConnected ? "Live" : "Offline"}
          </Button>
          <Button variant="warning" onClick={uploadToCloud}>
            Upload To Cloud
          </Button>
          <Modal
            size="md"
            show={smShow}
            onHide={() => setSmShow(false)}
            aria-labelledby="example-modal-sizes-title-sm"
          >
            <Modal.Header closeButton>
              <Modal.Title id="example-modal-sizes-title-sm">
                {message}
              </Modal.Title>
            </Modal.Header>
          </Modal>
        </Container>
      </Navbar>
    </div>
  );
};
