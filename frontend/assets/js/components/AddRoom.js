import PropTypes from 'prop-types';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

const AddRoom = ({ save }) => {
  // フォームで入力されたデータを取得・設定する
  const [name, setName] = useState('');
  const [beds, setBeds] = useState(0);
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState(0);
  // 全ての項目が入力されたか確認する
  const isFormFilled = () =>
    name && beds && image && description && location && price;

  // 入力フォームの表示・非表示を管理する
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button onClick={handleShow}>POST</Button>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>New Room</Modal.Title>
        </Modal.Header>
        <Form>
          <Modal.Body>
            {/* 部屋の名前 */}
            <Form.Group className="mb-3" controlId="inputName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                onChange={(e) => {
                  setName(e.target.value);
                }}
                placeholder="Enter name of Room"
              />
            </Form.Group>
            {/* 部屋の画像 */}
            <Form.Group className="mb-3" controlId="inputUrl">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="text"
                placeholder="Image URL"
                onChange={(e) => {
                  setImage(e.target.value);
                }}
              />
            </Form.Group>
            {/* ベッドの数 */}
            <Form.Group className="mb-3" controlId="inputBeds">
              <Form.Label>Beds</Form.Label>
              <Form.Control
                type="number"
                min={1}
                onChange={(e) => {
                  setBeds(e.target.value);
                }}
                placeholder="Number of Beds"
              />
            </Form.Group>
            {/* 部屋の説明 */}
            <Form.Group className="mb-3" controlId="inputDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                placeholder="Description"
                style={{ height: '80px' }}
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
              />
            </Form.Group>
            {/* ホテルの場所 */}
            <Form.Group className="mb-3" controlId="inputLocation">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                placeholder="Location"
                onChange={(e) => {
                  setLocation(e.target.value);
                }}
              />
            </Form.Group>
            {/* 一泊の価格（NEAR） */}
            <Form.Group className="mb-3" controlId="inputPrice">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                min={0}
                placeholder="Price"
                onChange={(e) => {
                  setPrice(e.target.value);
                }}
              />
            </Form.Group>
          </Modal.Body>
        </Form>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="dark"
            disabled={!isFormFilled()}
            onClick={() => {
              save({
                name,
                image,
                beds,
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
