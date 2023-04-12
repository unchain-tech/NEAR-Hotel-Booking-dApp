import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';

import {
  change_status_to_available,
  change_status_to_stay,
  get_booking_info_for_owner,
  is_available,
} from '../near/utils';

const ManageBookings = () => {
  // 予約データを設定する
  const [bookedRooms, setBookedRooms] = useState([]);

  const getBookedRooms = async () => {
    try {
      setBookedRooms(await get_booking_info_for_owner(window.accountId));
    } catch (error) {
      console.log(error);
    }
  };

  const handleCheckIn = async (room_id, check_in_date) => {
    const isAvailable = await is_available(room_id);
    if (isAvailable === false) {
      // 誰かが滞在中の部屋に対して`Check In`ボタンを押すとアラートを発生させる
      alert('Error: Someone already stay.');
      return;
    }
    try {
      change_status_to_stay(room_id, check_in_date).then((resp) => {
        getBookedRooms();
      });
    } catch (error) {
      console.log(error);
    }
  };
  const handleCheckOut = async (room_id, check_in_date, guest_id) => {
    try {
      change_status_to_available(room_id, check_in_date, guest_id).then(
        (resp) => {
          getBookedRooms();
        },
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getBookedRooms();
  }, []);

  // NEAR Walletに接続されていない時
  if (!window.accountId) {
    return (
      <>
        <h2>Please connect NEAR wallet.</h2>
      </>
    );
  }
  // NEAR Walletに接続されている時
  // // ｀Check In/Check Out`ボタンを持つ予約データをテーブルで表示
  return (
    <>
      <h2>BOOKED LIST</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th scope="col">Room Name</th>
            <th scope="col">Check In</th>
            <th scope="col">GuestID</th>
            <th scope="col">Manage Status</th>
          </tr>
        </thead>
        {bookedRooms.map((_room) => (
          <tbody key={_room.room_id + _room.check_in_date}>
            <tr>
              <td>{_room.name}</td>
              <td>{_room.check_in_date}</td>
              <td>{_room.guest_id}</td>
              <td>
                {/* ステータスが`Available`の時 */}
                {_room.status === 'Available' && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={(e) =>
                      handleCheckIn(_room.room_id, _room.check_in_date, e)
                    }
                  >
                    Check In
                  </Button>
                )}
                {/* ステータスが`Stay`の時 */}
                {_room.status !== 'Available' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(e) =>
                      handleCheckOut(
                        _room.room_id,
                        _room.check_in_date,
                        _room.guest_id,
                        e,
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
