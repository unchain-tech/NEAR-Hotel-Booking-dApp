import React, { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { utils } from "near-api-js";

import { get_hotel_rooms, set_room } from "../near/utils";
import AddRoom from "../components/hotelbooking/AddRoom";

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);

  const getRooms = async () => {
    try {
      setRooms(await get_hotel_rooms(window.accountId));
    } catch (error) {
      console.log("ERR_DISCONNECTED_WALLET");
    }
  };

  const addRoom = async (data) => {
    await set_room(data).then((is_success) => {
      if (!is_success) {
        console.log("addRoom: ", is_success);
        alert(
          'Error "Already exists."' +
            "\n owner: " +
            window.accountId +
            "\n room : " +
            data.name
        );
      }
      getRooms();
      console.log("SUCCESS_SET_ROOM");
    });
  };

  useEffect(() => {
    getRooms();
  }, []);

  if (!window.accountId) {
    return (
      <>
        <h2>Please connect NEAR wallet.</h2>
      </>
    );
  }
  return (
    <>
      <Row>
        <Col>
          <h2>ROOM LIST</h2>
        </Col>
        <Col xs={1} style={{ marginTop: "5px" }}>
          <div>
            <AddRoom save={addRoom} />
          </div>
        </Col>
      </Row>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th scope='col'>Room Name</th>
            <th scope='col'>Image</th>
            <th scope='col'>Beds</th>
            <th scope='col'>Description</th>
            <th scope='col'>Location</th>
            <th scope='col'>Price per night</th>
            <th scope='col'>Use Time</th>
            <th scope='col'>Status</th>
          </tr>
        </thead>
        {rooms.map((_room) => (
          <tbody key={`${_room.name}`}>
            {_room.status === "Available" && (
              <tr>
                <td>{_room.name}</td>
                <td>
                  <img src={_room.image} width='100' />
                </td>
                <td>{_room.beds}</td>
                <td>{_room.description}</td>
                <td>{_room.location}</td>
                <td>{utils.format.formatNearAmount(_room.price)} NEAR</td>
                <td>
                  {_room.use_time.check_in} - {_room.use_time.check_out}
                </td>

                <td>{_room.status}</td>
              </tr>
            )}
            {_room.status !== "Available" && (
              <tr style={{ backgroundColor: "#FFC0CB" }}>
                <td>{_room.name}</td>
                <td>
                  <img src={_room.image} width='100' />
                </td>
                <td>{_room.beds}</td>
                <td>{_room.description}</td>
                <td>{_room.location}</td>
                <td>{utils.format.formatNearAmount(_room.price)} NEAR</td>
                <td>
                  {_room.use_time.check_in} - {_room.use_time.check_out}
                </td>

                <td>Stay</td>
              </tr>
            )}
          </tbody>
        ))}
      </Table>
    </>
  );
};

export default ManageRooms;
