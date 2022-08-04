import React from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Image from "react-bootstrap/Image";

import PropTypes from "prop-types";

import { formatNearAmount } from "near-api-js/lib/utils/format";

const Room = ({ room, booking }) => {
  // roomオブジェクトからデータを取得
  const { room_id, owner_id, name, image, beds, description, location, price } =
    room;

  const handleBooking = () => {
    // `Search.js`のbookingに引数を渡す
    booking(room_id, price);
  };

  return (
    <Row style={{ padding: "20px" }}>
      <Col xs={1}></Col>
      <Col xs={2}>
        <Image src={image} alt={name} width='300' fluid />
      </Col>
      <Col xs={4}>
        <h4>{owner_id}</h4>
        <h4>{name}</h4>
        <p>{description}</p>
        <h5>{location}</h5>
      </Col>
      <Col xs={2}>
        <p>Beds</p>
        <h6>{beds}</h6>
      </Col>
      <Col xs={3}>
        <h6>1 night</h6>
        <Button
          variant='outline-dark'
          disabled={!window.accountId}
          onClick={handleBooking}
        >
          Book for {formatNearAmount(price)} NEAR
        </Button>
      </Col>
    </Row>
  );
};

// 引数の型を定義
Room.PrpoTypes = {
  room: PropTypes.instanceOf(Object).isRequired,
  booking: PropTypes.func.isRequired,
};

export default Room;
