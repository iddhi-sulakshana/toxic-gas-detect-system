import React from 'react'
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import img1 from '../images/smart-tech-2.png'
import Button from 'react-bootstrap/Button';

export const Navbar1 = () => {
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
              style={{borderRadius:"50px"}}
            />{' '}
            <span style={{fontWeight:'bold', fontSize:'30px'}} >APE StartUp EKApuliye</span>
          </Navbar.Brand>
          <Button variant="warning">Upload To Cloud</Button>
        </Container>
      </Navbar>
    </div>
  )
}
