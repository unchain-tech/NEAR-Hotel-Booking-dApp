import React, { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import {
  get_booked_rooms,
  is_available,
  change_status_to_available,
  change_status_to_stay,
} from "../near/utils";

const ManageBookings = () => {
  const [bookedRooms, setBookedRooms] = useState([]);

  const getBookedRooms = async () => {
    try {
      setBookedRooms(await get_booked_rooms(window.accountId));
    } catch (error) {
      console.log("ERR_DISCONNECTED_WALLET");
    }
  };

  const triggerCheckIn = async (name, check_in_date) => {
    let isAvailable = await is_available(window.accountId, name);
    if (isAvailable == false) {
      alert('Error "Someone already stay."');
      return;
    }
    try {
      change_status_to_stay(name, check_in_date).then((resp) => {
        getBookedRooms();
      });
    } catch (error) {
      console.log({ error });
    }
  };
  const triggerCheckOut = async (name, check_in_date, guest_id) => {
    try {
      change_status_to_available(name, check_in_date, guest_id).then((resp) => {
        getBookedRooms();
      });
    } catch (error) {
      console.log({ error });
    }
  };

  useEffect(() => {
    getBookedRooms();
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
            <th scope='col'>Room Name</th>
            <th scope='col'>Check In</th>
            <th scope='col'>GuestID</th>
            <th scope='col'>Manage Status</th>
          </tr>
        </thead>
        {bookedRooms.map((_room) => (
          <tbody key={_room.name + _room.check_in_date}>
            <tr>
              <td>{_room.name}</td>
              <td>{_room.check_in_date}</td>
              <td>{_room.guest_id}</td>
              <td>
                {_room.status === "Available" && (
                  <Button
                    variant='success'
                    size='sm'
                    onClick={(e) =>
                      triggerCheckIn(_room.name, _room.check_in_date, e)
                    }
                  >
                    Check In
                  </Button>
                )}
                {_room.status !== "Available" && (
                  <Button
                    variant='danger'
                    size='sm'
                    onClick={(e) =>
                      triggerCheckOut(
                        _room.name,
                        _room.check_in_date,
                        _room.guest_id,
                        e
                      )
                    }
                  >
                    Check Out
                  </Button>
                )}
              </td>
            </tr>
          </tbody>
        ))}
      </Table>
    </>
  );
};

export default ManageBookings;
