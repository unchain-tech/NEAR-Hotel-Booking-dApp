import { connect, Contract, keyStores, WalletConnection } from "near-api-js";
import {
  formatNearAmount,
  parseNearAmount,
} from "near-api-js/lib/utils/format";
import getConfig from "./config";

// トランザクション実行時に使用するGASの上限を設定
const GAS = 100000000000000;

const nearConfig = getConfig(process.env.NODE_ENV || "development");

// コントラクトの初期化とグローバル変数を設定
export async function initContract() {
  // NEARテストネットへの接続を初期化する
  const near = await connect(
    Object.assign(
      { deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } },
      nearConfig
    )
  );

  // ウォレットベースのアカウントを初期化
  // // `https://wallet.testnet.near.org`でホストされている NEAR testnet ウォレットで動作させることができる
  window.walletConnection = new WalletConnection(near);

  // アカウントIDを取得する
  // // まだ未承認の場合は、空文字列が設定される
  window.accountId = window.walletConnection.getAccountId();

  // コントラクトAPIの初期化
  window.contract = await new Contract(
    window.walletConnection.account(),
    nearConfig.contractName,
    {
      viewMethods: [
        "get_available_rooms",
        "get_rooms_registered_by_owner",
        "get_booking_info_for_owner",
        "get_booking_info_for_guest",
        "exists",
        "is_available",
      ],
      changeMethods: [
        "add_room_to_owner",
        "book_room",
        "change_status_to_available",
        "change_status_to_stay",
      ],
    }
  );
}

export function logout() {
  window.walletConnection.signOut();
  // ページをリロード
  window.location.replace(window.location.origin + window.location.pathname);
}

export function login() {
  window.walletConnection.requestSignIn(nearConfig.contractName);
}

export async function accountBalance() {
  return formatNearAmount(
    (await window.walletConnection.account().getAccountBalance()).total,
    2
  );
}

// コールするメソッドの処理を定義
// // 実際に引数を渡す処理は全てここに実装
export async function get_available_rooms(searchDate) {
  let availableRooms = await window.contract.get_available_rooms({
    check_in_date: searchDate,
  });
  return availableRooms;
}

export async function get_rooms_registered_by_owner(owner_id) {
  let registeredRooms = await window.contract.get_rooms_registered_by_owner({
    owner_id: owner_id,
  });
  return registeredRooms;
}

export async function get_booking_info_for_owner(owner_id) {
  let bookedRooms = await window.contract.get_booking_info_for_owner({
    owner_id: owner_id,
  });
  return bookedRooms;
}

export async function get_booking_info_for_guest(guest_id) {
  let guestBookedRooms = await window.contract.get_booking_info_for_guest({
    guest_id: guest_id,
  });
  return guestBookedRooms;
}

export async function exists(owner_id, room_name) {
  let ret = await window.contract.exists({
    owner_id: owner_id,
    room_name: room_name,
  });
  return ret;
}

export async function is_available(room_id) {
  let ret = await window.contract.is_available({
    room_id: room_id,
  });
  return ret;
}

export async function add_room_to_owner(room) {
  // NEAR -> yoctoNEARに変換
  room.price = parseNearAmount(room.price);

  await window.contract.add_room_to_owner({
    name: room.name,
    image: room.image,
    beds: Number(room.beds),
    description: room.description,
    location: room.location,
    price: room.price,
  });
}

export async function book_room({ room_id, date, price }) {
  await window.contract.book_room(
    {
      room_id: room_id,
      check_in_date: date,
    },
    GAS,
    price
  );
}

export async function change_status_to_available(
  room_id,
  check_in_date,
  guest_id
) {
  await window.contract.change_status_to_available({
    room_id: room_id,
    check_in_date: check_in_date,
    guest_id: guest_id,
  });
}

export async function change_status_to_stay(room_id, check_in_date) {
  await window.contract.change_status_to_stay({
    room_id: room_id,
    check_in_date: check_in_date,
  });
}
