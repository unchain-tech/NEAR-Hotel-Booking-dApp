import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Row from "react-bootstrap/Row";

import Room from "../components/Room";
import FormDate from "../components/FormDate";

import { get_available_rooms, book_room } from "../near/utils";

const Search = () => {
  // URLから検索する日付を取得する
  const { date } = useParams();
  // 予約できる部屋のデータを設定する
  const [availableRooms, setAvailableRooms] = useState([]);

  const getAvailableRooms = async () => {
    setAvailableRooms(await get_available_rooms(date));
  };

  const booking = async (room_id, price) => {
    book_room({
      room_id,
      date,
      price,
    });
    getAvailableRooms();
  };

  // 検索する日付が更新されるたびに`getAvailableRooms`を実行する
  useEffect(() => {
    getAvailableRooms();
  }, [date]);

  return (
    <>
      {/* 日付を入力するフォームを表示 */}
      <FormDate />
      <div className='text-center' style={{ margin: "20px" }}>
        <h2>{date}</h2>
        {availableRooms.length === 0 ? (
          <h3>Sorry, no rooms found.</h3>
        ) : (
          <>
            {/* NEAR Walletに接続されている時 */}
            {(window, accountId && <h3>{availableRooms.length} found.</h3>)}
            {/* NEAR Walletに接続していない時 */}
            {!window.accountId && (
              <h3>
                {availableRooms.length} found. To book, you must be connected to
                the NEAR Wallet.
              </h3>
            )}
          </>
        )}
      </div>
      {/* 予約可能な部屋を表示する */}
      <Row>
        {availableRooms.map((_room) => (
          <Room room={{ ..._room }} key={_room.room_id} booking={booking} />
        ))}
      </Row>
    </>
  );
};

export default Search;
