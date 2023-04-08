import { formatNearAmount } from 'near-api-js/lib/utils/format';
import { useEffect, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';

import AddRoom from '../components/AddRoom';
import {
  add_room_to_owner,
  exists,
  get_rooms_registered_by_owner,
} from '../near/utils';

const ManageRooms = () => {
  const [registeredRooms, setRegisteredRooms] = useState([]);

  const getRooms = async () => {
    try {
      setRegisteredRooms(await get_rooms_registered_by_owner(window.accountId));
    } catch (error) {
      console.log(error);
    }
  };

  const addRoom = async (data) => {
    // 同じ名前の部屋を登録しないかチェック
    const exist = await exists(window.accountId, data.name);
    if (exist === true) {
      alert('Error: ' + data.name + ' is already registered.');
      return;
    }
    await add_room_to_owner(data);
    getRooms();
  };

  useEffect(() => {
    getRooms();
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
  // // 登録した部屋を表示
  return (
    <>
      <Row>
        <Col>
          <h2>ROOM LIST</h2>
        </Col>
        <Col xs={1} style={{ marginTop: '5px' }}>
          <div>
            <AddRoom save={addRoom} />
          </div>
        </Col>
      </Row>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th scope="col">Room Name</th>
            <th scope="col">Image</th>
            <th scope="col">Beds</th>
            <th scope="col">Description</th>
            <th scope="col">Location</th>
            <th scope="col">Price per night</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        {registeredRooms.map((_room) => (
          <tbody key={`${_room.name}`}>
            {/* 部屋が空室の時 */}
            {_room.status === 'Available' && (
              <tr>
                <td>{_room.name}</td>
                <td>
                  <img src={_room.image} width="100" />
                </td>
                <td>{_room.beds}</td>
                <td>{_room.description}</td>
                <td>{_room.location}</td>
                <td>{formatNearAmount(_room.price)} NEAR</td>
                <td>{_room.status}</td>
              </tr>
            )}
            {/* 部屋が滞在中の時、背景を赤で表示 */}
            {_room.status !== 'Available' && (
              <tr style={{ backgroundColor: '#FFC0CB' }}>
                <td>{_room.name}</td>
                <td>
                  <img src={_room.image} width="100" />
                </td>
                <td>{_room.beds}</td>
                <td>{_room.description}</td>
                <td>{_room.location}</td>
                <td>{formatNearAmount(_room.price)} NEAR</td>
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
