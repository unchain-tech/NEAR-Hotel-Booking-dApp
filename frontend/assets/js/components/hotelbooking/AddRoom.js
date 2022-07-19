import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";

const AddRoom = ({ save }) => {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState(0);
  // 全ての項目が入力されたか確認する
  const isFormFilled = () => name && image && description && location && price;

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  //...
  //...
  return (
    <>
      <Button
        onClick={handleShow}
        variant='dark'
        className='rounded-pill px-0'
        style={{ width: "38px" }}
      >
        <i className='bi bi-plus'></i>
      </Button>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>New Room</Modal.Title>
        </Modal.Header>
        <Form>
          <Modal.Body>
            <Form.Group className='mb-3' controlId='inputName'>
              {/* <Form.Label>Room name</Form.Label> */}
              <Form.Control
                type='text'
                onChange={(e) => {
                  setName(e.target.value);
                }}
                placeholder='Enter name of Room'
              />
            </Form.Group>
            <Form.Group className='mb-3' controlId='inputUrl'>
              {/* <Form.Label>Image URL</Form.Label> */}
              <Form.Control
                type='text'
                placeholder='Image URL'
                onChange={(e) => {
                  setImage(e.target.value);
                }}
              />
            </Form.Group>
            <Form.Group className='mb-3' controlId='inputDescription'>
              {/* <Form.Label>Description</Form.Label> */}
              <Form.Control
                as='textarea'
                placeholder='description'
                style={{ height: "80px" }}
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
              />
            </Form.Group>
            <Form.Group className='mb-3' controlId='inputLocation'>
              {/* <Form.Label>Location</Form.Label> */}
              <Form.Control
                type='text'
                placeholder='Location'
                onChange={(e) => {
                  setLocation(e.target.value);
                }}
              />
            </Form.Group>
            <Form.Group className='mb-3' controlId='inputPrice'>
              {/* <Form.Label>Price</Form.Label> */}
              <Form.Control
                type='text'
                placeholder='Price'
                onChange={(e) => {
                  setPrice(e.target.value);
                }}
              />
            </Form.Group>
          </Modal.Body>
        </Form>
        <Modal.Footer>
          <Button variant='outline-secondary' onClick={handleClose}>
            Close
          </Button>
          <Button
            variant='dark'
            disabled={!isFormFilled()}
            onClick={() => {
              save({
                name,
                image,
                description,
                location,
                price,
              });
              handleClose();
            }}
          >
            Save room
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

AddRoom.propTypes = {
  save: PropTypes.func.isRequired,
};

export default AddRoom;