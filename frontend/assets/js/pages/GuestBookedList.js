import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { get_guest_booked_info } from "../near/utils";

const GuestBookedList = () => {
  const [bookedRooms, setBookedRooms] = useState([]);

  const getGuestBookedRooms = async () => {
    try {
      setBookedRooms(await get_guest_booked_info(window.accountId));
    } catch (error) {
      console.log("ERR_DISCONNECTED_WALLET");
    }
  };

  useEffect(() => {
    getGuestBookedRooms();
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
      <h2>BOOKED LIST</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th scope='col'>Owner</th>
            <th scope='col'>Room Name</th>
            <th scope='col'>Check In</th>
          </tr>
        </thead>
        {bookedRooms.map((_room) => (
          <tbody key={_room.name + _room.check_in_date}>
            <tr>
              <td>{_room.owner_id}</td>
              <td>{_room.room_name}</td>
              <td>{_room.check_in_date}</td>
              <td>{_room.check_in_time}</td>
            </tr>
          </tbody>
        ))}
      </Table>
    </>
  );
};

export default GuestBookedList;
