import { connect, Contract, keyStores, WalletConnection } from "near-api-js";
import {
  formatNearAmount,
  parseNearAmount,
} from "near-api-js/lib/utils/format";
import getConfig from "./config";

const GAS = 100000000000000;

const nearConfig = getConfig(process.env.NODE_ENV || "development");
//...

//...
// Initialize contract & set global variables
export async function initContract() {
  // Initialize connection to the NEAR testnet
  const near = await connect(
    Object.assign(
      { deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } },
      nearConfig
    )
  );

  // Initializing Wallet based Account. It can work with NEAR testnet wallet that
  // is hosted at https://wallet.testnet.near.org
  window.walletConnection = new WalletConnection(near);

  // Getting the Account ID. If still unauthorized, it's just empty string
  window.accountId = window.walletConnection.getAccountId();

  // Initializing our contract APIs by contract name and configuration
  window.contract = await new Contract(
    window.walletConnection.account(),
    nearConfig.contractName,
    {
      viewMethods: [
        "get_available_rooms",
        "get_hotel_rooms",
        "get_room",
        "get_booked_rooms",
        "get_guest_booked_info",
        "is_available",
      ],
      changeMethods: [
        "set_room",
        "book_room",
        "change_status_to_available",
        "change_status_to_stay",
      ],
    }
  );
}
//...
//...
export function logout() {
  window.walletConnection.signOut();
  // reload page
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

export async function getAccountId() {
  return window.walletConnection.getAccountId();
}

// export async function get_all_rooms() {
//   let all_rooms = await window.contract.get_all_rooms();
//   return all_rooms;
// }

export async function get_available_rooms(searchDate) {
  let available_rooms = await window.contract.get_available_rooms({
    check_in_date: searchDate,
  });
  return available_rooms;
}

export async function get_hotel_rooms(owner_id) {
  let hotel_rooms = await window.contract.get_hotel_rooms({
    owner_id: owner_id,
  });
  return hotel_rooms;
}

export async function get_room(owner_id, name) {
  let room = await window.contract.get_room({
    owner_id: owner_id,
    name: name,
  });
  return room;
}

export async function get_booked_rooms(owner_id) {
  let room = await window.contract.get_booked_rooms({
    owner_id: owner_id,
  });
  return room;
}

export async function get_guest_booked_info(guest_id) {
  let room = await window.contract.get_guest_booked_info({
    guest_id: guest_id,
  });
  return room;
}

export async function is_available(owner_id, name) {
  let ret = await window.contract.is_available({
    owner_id: owner_id,
    name: name,
  });
  return ret;
}

export function set_room(room) {
  room.price = parseNearAmount(room.price + "");
  let is_success = window.contract.set_room({
    name: room.name,
    image: room.image,
    beds: Number(room.beds),
    description: room.description,
    location: room.location,
    price: room.price,
    check_in: room.checkIn,
    check_out: room.checkOut,
  });
  return is_success;
}

export async function book_room({ owner_id, name, date, price }) {
  console.log("book_room date: ", date);
  let is_success = await window.contract.book_room(
    {
      owner_id: owner_id,
      name: name,
      check_in_date: date,
    },
    GAS,
    price
  );
  return is_success;
}

export async function change_status_to_available(
  name,
  check_in_date,
  guest_id
) {
  console.log("in utils.js: ", name);
  console.log("in utils.js: ", check_in_date);
  await window.contract.change_status_to_available({
    name: name,
    check_in_date: check_in_date,
    guest_id: guest_id,
  });
}

export async function change_status_to_stay(name, check_in_date) {
  await window.contract.change_status_to_stay({
    name: name,
    check_in_date: check_in_date,
  });
}
