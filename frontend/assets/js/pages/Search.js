import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Row from "react-bootstrap/Row";

import { get_available_rooms, book_room } from "../near/utils";
import Room from "../components/hotelbooking/Room";
import FormDate from "../components/FormDate";

const Search = () => {
  const { date } = useParams();
  const [availableRooms, setAvailableRooms] = useState([]);

  const getAvailableRooms = async () => {
    console.log("Call getAvailableRooms");
    console.log("date(URL): ", date);

    setAvailableRooms(await get_available_rooms(date));
    console.log("availableRoom: ", availableRooms);
  };

  //...
  const booking = async (room_id, price) => {
    book_room({
      room_id,
      date,
      price,
    });
    getAvailableRooms();
  };

  //...

  useEffect(() => {
    getAvailableRooms();
  }, [date]);

  return (
    <>
      <FormDate />
      <div className='text-center' style={{ margin: "20px" }}>
        <h2>{date}</h2>
        {availableRooms.length === 0 ? (
          <h3>Sorry, no rooms found.</h3>
        ) : (
          <>
            {(window, accountId && <h3>{availableRooms.length} found.</h3>)}
            {!window.accountId && (
              <h3>
                {availableRooms.length} found. To book, you must be connected to
                the NEAR Wallet.
              </h3>
            )}
          </>
        )}
      </div>
      <Row>
        {availableRooms.map((_room) => (
          <Room room={{ ..._room }} key={_room.room_id} booking={booking} />
        ))}
      </Row>
    </>
  );
};

export default Search;
