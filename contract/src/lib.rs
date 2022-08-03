use std::collections::HashMap;
use std::vec;

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedSet};
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, near_bindgen, AccountId, Promise};

type RoomId = String;

#[derive(Serialize, Deserialize, BorshSerialize, BorshDeserialize, PartialEq, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct UseTime {
    check_in: String,
    check_out: String,
}

#[derive(Serialize, Deserialize, Debug, BorshSerialize, BorshDeserialize, PartialEq)]
#[serde(crate = "near_sdk::serde")]
pub enum UsageStatus {
    Available,
    Stay { check_in_date: String },
}

#[derive(Serialize, Deserialize, Debug, BorshSerialize, BorshDeserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct ResigteredRoom {
    name: String,
    image: String,
    beds: u8,
    description: String,
    location: String,
    price: U128,
    use_time: UseTime,
    status: UsageStatus,
}

#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct BookedRoom {
    room_id: RoomId,
    name: String,
    check_in_date: String,
    guest_id: AccountId,
    status: UsageStatus,
}

#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize, PartialEq, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct AvailableRoom {
    room_id: RoomId,
    owner_id: AccountId,
    name: String,
    image: String,
    beds: u8,
    description: String,
    location: String,
    price: U128,
    use_time: UseTime,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Room {
    name: String,
    owner_id: AccountId,
    image: String,
    beds: u8,
    description: String,
    location: String,
    price: U128,
    use_time: UseTime,
    status: UsageStatus,
    booked_info: HashMap<String, AccountId>, // checkin-date: guest_id
}

#[derive(Serialize, Deserialize, Debug, BorshSerialize, BorshDeserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct ShowBookedInfo {
    owner_id: AccountId,
    room_name: String,
    check_in_date: String,
    check_in_time: String,
}

#[near_bindgen]
#[derive(BorshSerialize, BorshDeserialize)]
pub struct Contract {
    rooms_per_owner: LookupMap<AccountId, Vec<RoomId>>,
    rooms_by_id: HashMap<RoomId, Room>,
    bookings_per_guest: LookupMap<AccountId, HashMap<String, RoomId>>,
}

impl Default for Contract {
    fn default() -> Self {
        Self {
            rooms_per_owner: LookupMap::new(b"m"),
            rooms_by_id: HashMap::new(),
            bookings_per_guest: LookupMap::new(b"m"),
        }
    }
}

#[near_bindgen]
impl Contract {
    pub fn add_room_to_owner(
        &mut self,
        name: String,
        image: String,
        beds: u8,
        description: String,
        location: String,
        price: U128,
        check_in: String,
        check_out: String,
    ) {
        let owner_id = env::signer_account_id();
        let room_id = format!("{}{}", owner_id, name);
        let use_time = UseTime {
            check_in,
            check_out,
        };
        let new_room = Room {
            owner_id: owner_id.clone(),
            name,
            image,
            beds,
            description,
            location,
            price,
            use_time: use_time,
            status: UsageStatus::Available,
            booked_info: HashMap::new(),
        };

        // roomをIDと紐付けて保存
        self.rooms_by_id.insert(room_id.clone(), new_room);

        match self.rooms_per_owner.get(&owner_id) {
            Some(mut rooms) => {
                rooms.push(room_id.clone());
                self.rooms_per_owner.insert(&owner_id, &rooms);
            }
            None => {
                let new_rooms = vec![room_id];
                self.rooms_per_owner.insert(&owner_id, &new_rooms);
            }
        }
    }

    pub fn change_status_to_available(
        &mut self,
        room_id: RoomId,
        check_in_date: String,
        guest_id: AccountId,
    ) {
        let mut room = self
            .rooms_by_id
            .get_mut(&room_id)
            .expect("ERR_NOT_FOUND_ROOM");

        // ホテルが持つ予約情報の削除
        room.booked_info
            .remove(&check_in_date)
            .expect("ERR_NOT_FOUND_DATE");

        room.status = UsageStatus::Available;

        // ゲストが持つ予約情報を削除
        self.remove_booking_from_guest(guest_id, check_in_date);
    }

    pub fn change_status_to_stay(&mut self, room_id: RoomId, check_in_date: String) {
        let mut room = self
            .rooms_by_id
            .get_mut(&room_id)
            .expect("ERR_NOT_FOUND_ROOM");

        room.status = UsageStatus::Stay { check_in_date };
    }

    pub fn is_available(&self, room_id: RoomId) -> bool {
        let room = self.rooms_by_id.get(&room_id).expect("ERR_NOT_FOUND_ROOM");

        if room.status != UsageStatus::Available {
            return false;
        }
        true
    }

    pub fn get_available_rooms(&self, check_in_date: String) -> Vec<AvailableRoom> {
        let mut available_rooms = vec![];

        for (room_id, room) in self.rooms_by_id.iter() {
            match room.booked_info.get(&check_in_date) {
                Some(_) => continue,
                None => {
                    let use_time = UseTime {
                        check_in: room.use_time.check_in.clone(),
                        check_out: room.use_time.check_out.clone(),
                    };
                    let available_room = AvailableRoom {
                        room_id: room_id.clone(),
                        owner_id: room.owner_id.clone(),
                        name: room.name.clone(),
                        beds: room.beds,
                        image: room.image.clone(),
                        description: room.description.clone(),
                        location: room.location.clone(),
                        price: room.price,
                        use_time: use_time,
                    };
                    available_rooms.push(available_room);
                }
            }
        }
        available_rooms
    }

    pub fn get_hotel_rooms(&self, owner_id: AccountId) -> Vec<ResigteredRoom> {
        let mut hotel_rooms = vec![];

        match self.rooms_per_owner.get(&owner_id) {
            Some(rooms) => {
                for room_id in rooms {
                    let room = self.rooms_by_id.get(&room_id).expect("ERR_NOT_FOUND_ROOM");
                    hotel_rooms.push(self.create_resigtered_room(room));
                }
                hotel_rooms
            }
            None => hotel_rooms,
        }
    }

    pub fn get_booked_rooms(&self, owner_id: AccountId) -> Vec<BookedRoom> {
        let mut booked_rooms = vec![];

        match self.rooms_per_owner.get(&owner_id) {
            Some(rooms) => {
                for room_id in rooms.iter() {
                    let room = self.rooms_by_id.get(room_id).expect("ERR_NOT_FOUND_ROOM");
                    if room.booked_info.len() == 0 {
                        continue;
                    }
                    for (date, guest_id) in room.booked_info.clone() {
                        let status: UsageStatus;
                        match room.status {
                            UsageStatus::Available => status = UsageStatus::Available,
                            UsageStatus::Stay { ref check_in_date } => {
                                if date == check_in_date.clone() {
                                    status = UsageStatus::Stay {
                                        check_in_date: check_in_date.clone(),
                                    }
                                } else {
                                    status = UsageStatus::Available;
                                }
                            }
                        }
                        let booked_room = BookedRoom {
                            room_id: room_id.to_string(),
                            name: room.name.clone(),
                            check_in_date: date,
                            guest_id: guest_id,
                            status: status,
                        };
                        booked_rooms.push(booked_room);
                    }
                }
                booked_rooms
            }
            None => booked_rooms,
        }
    }

    /*
        return booking ResigteredRoom
    */
    #[payable]
    pub fn book_room(&mut self, room_id: RoomId, check_in_date: String) -> bool {
        // 予約する部屋を取得
        let room = self
            .rooms_by_id
            .get_mut(&room_id)
            .expect("ERR_NOT_FOUND_ROOM");

        let account_id = env::signer_account_id();
        let deposit = env::attached_deposit();
        let room_price: u128 = room.price.clone().into();
        if deposit != room_price {
            return false;
        }

        // 予約が入った日付, guestを登録
        room.booked_info
            .insert(check_in_date.clone(), account_id.clone());

        // guestsに保存
        let owner_id = room.owner_id.clone();
        self.add_booking_to_guest(account_id, room_id, check_in_date);

        // トークンを送信
        Promise::new(owner_id).transfer(deposit);
        true
    }

    /**
     * Guests
     */
    pub fn get_guest_booked_info(&self, guest_id: AccountId) -> Vec<ShowBookedInfo> {
        let mut guest_info: Vec<ShowBookedInfo> = vec![];
        match self.bookings_per_guest.get(&guest_id) {
            Some(save_booked_info) => {
                for (check_in_date, room_id) in save_booked_info {
                    let room = self.rooms_by_id.get(&room_id).expect("ERR_NOT_FOUND_ROOM");
                    let info = ShowBookedInfo {
                        owner_id: room.owner_id.clone(),
                        room_name: room.name.clone(),
                        check_in_date: check_in_date.clone(),
                        check_in_time: room.use_time.check_in.clone(),
                    };
                    guest_info.push(info);
                }
                guest_info
            }
            None => guest_info,
        }
    }
}

// Private functions
impl Contract {
    fn create_resigtered_room(&self, room: &Room) -> ResigteredRoom {
        let use_time = UseTime {
            check_in: room.use_time.check_in.clone(),
            check_out: room.use_time.check_out.clone(),
        };

        // statusを複製
        let status: UsageStatus;
        match room.status {
            UsageStatus::Available => status = UsageStatus::Available,
            UsageStatus::Stay { ref check_in_date } => {
                status = UsageStatus::Stay {
                    check_in_date: check_in_date.clone(),
                }
            }
        }

        let resigtered_room = ResigteredRoom {
            name: room.name.clone(),
            beds: room.beds,
            image: room.image.clone(),
            description: room.description.clone(),
            location: room.location.clone(),
            price: room.price,
            use_time: use_time,
            status: status,
        };
        resigtered_room
    }

    fn add_booking_to_guest(
        &mut self,
        guest_id: AccountId,
        room_id: RoomId,
        check_in_date: String,
    ) {
        match self.bookings_per_guest.get(&guest_id) {
            Some(mut booked_date) => {
                booked_date.insert(check_in_date.clone(), room_id);
                return;
            }
            None => {
                let mut new_guest_date = HashMap::new();
                new_guest_date.insert(check_in_date.clone(), room_id);
                self.bookings_per_guest.insert(&guest_id, &new_guest_date);
            }
        }
    }

    fn remove_booking_from_guest(&mut self, guest_id: AccountId, check_in_data: String) {
        // ユーザー（宿泊者）が持っている予約情報のmapを取得
        let mut book_info = self
            .bookings_per_guest
            .get(&guest_id)
            .expect("ERR_NOT_FOUND_GUEST");

        book_info
            .remove(&check_in_data)
            .expect("ERR_NOT_FOUND_BOOKED");

        // 予約情報が空になった場合、guestsコレクションからゲストを削除する。
        if book_info.is_empty() {
            self.bookings_per_guest.remove(&guest_id);
        } else {
            // 予約情報がまだある場合、更新した情報を挿入し直す。
            self.bookings_per_guest.insert(&guest_id, &book_info);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::testing_env;

    fn near_to_yocto(near_amount: u128) -> U128 {
        U128(near_amount * 10u128.pow(24))
    }

    // Allows for modifying the environment of the mocked blockchain
    fn get_context(is_view: bool) -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder
            .account_balance(0)
            .attached_deposit(0)
            .current_account_id(accounts(0))
            .predecessor_account_id(accounts(0))
            .signer_account_id(accounts(1))
            .is_view(is_view);
        builder
    }

    #[test]
    fn owner_add_then_get_room() {
        let mut context = get_context(false);
        // Initialize the mocked blockchain
        testing_env!(context.build());

        // Set the testing environment for the subsequent calls
        testing_env!(context.predecessor_account_id(accounts(0)).build());

        let mut contract = Contract::default();
        contract.add_room_to_owner(
            "JAPAN_room".to_string(),
            "test.img".to_string(),
            1,
            "This is JAPAN room".to_string(),
            "Japan".to_string(),
            near_to_yocto(10),
            "14:00".to_string(),
            "10:00".to_string(),
        );

        let owner_id = env::signer_account_id();
        let all_rooms = contract.get_hotel_rooms(owner_id);
        // println!("\nALL_ROOMS: {:?}\n", all_rooms);
        assert_eq!(all_rooms.len(), 1);
    }

    #[test]
    fn owner_add_then_get_rooms() {
        let mut context = get_context(false);
        testing_env!(context.build());
        testing_env!(context.predecessor_account_id(accounts(0)).build());

        let mut contract = Contract::default();
        contract.add_room_to_owner(
            "JAPAN_room".to_string(),
            "test.img".to_string(),
            1,
            "This is JAPAN room".to_string(),
            "Japan".to_string(),
            near_to_yocto(10),
            "14:00".to_string(),
            "10:00".to_string(),
        );
        contract.add_room_to_owner(
            "USA_room".to_string(),
            "test2.img".to_string(),
            2,
            "This is USA room".to_string(),
            "USA".to_string(),
            near_to_yocto(10),
            "14:00".to_string(),
            "10:00".to_string(),
        );

        let owner_id = env::signer_account_id();
        let rooms = contract.get_hotel_rooms(owner_id);
        // println!("\nHOTEL_ROOMS: {:?}\n", rooms);
        assert_eq!(rooms.len(), 2);
    }

    #[test]
    fn owner_empty_get_rooms() {
        let mut context = get_context(true);
        testing_env!(context.build());
        testing_env!(context.predecessor_account_id(accounts(0)).build());
        let contract = Contract::default();

        // ここで使用するaccountsの指定に注意。環境設定でsigner_account_idにaccounts(1)を指定しているので、それ以外（〜6)を指定すること。
        let error_owner_id = accounts(2);
        let error_rooms = contract.get_hotel_rooms(error_owner_id);
        assert_eq!(error_rooms.len(), 0);
    }

    #[test]
    fn no_available_room() {
        let mut context = get_context(true);
        testing_env!(context.build());
        testing_env!(context.predecessor_account_id(accounts(0)).build());
        let contract = Contract::default();

        let available_rooms = contract.get_available_rooms("2222-01-01".to_string());
        // println!("\n\nAVAILABLE_ROOM: {:?}\n\n", available_rooms);
        assert_eq!(available_rooms.len(), 0);
    }

    #[test]
    // hotel owner: bob(accounts(1))
    // booking guest: charlie(accounts(2))
    fn book_room_then_get_booked_list() {
        let mut context = get_context(false);

        context.account_balance(near_to_yocto(2).into());
        context.attached_deposit(near_to_yocto(1).into());

        testing_env!(context.build());
        testing_env!(context.predecessor_account_id(accounts(0)).build());

        let hotel_owner_id = env::signer_account_id();
        let name = String::from("JAPAN_room");
        let mut contract = Contract::default();
        contract.add_room_to_owner(
            name.clone(),
            "test.img".to_string(),
            1,
            "This is JAPAN room".to_string(),
            "Japan".to_string(),
            near_to_yocto(1),
            "14:00".to_string(),
            "10:00".to_string(),
        );
        let rooms = contract.get_hotel_rooms(hotel_owner_id.clone());
        assert_eq!(rooms.len(), 1);

        // Search check
        testing_env!(context.signer_account_id(accounts(2)).build());
        let check_in_date: String = "2222-01-01".to_string();
        let available_rooms = contract.get_available_rooms(check_in_date.clone());
        // println!("\n\nAVAILABLE_ROOM: {:?}\n\n", available_rooms);
        assert_eq!(available_rooms.len(), 1);

        let is_success =
            contract.book_room(available_rooms[0].room_id.clone(), check_in_date.clone());
        assert_eq!(is_success, true);

        let booked_rooms = contract.get_booked_rooms(hotel_owner_id.clone());
        println!("{:?}", booked_rooms);
        assert_eq!(booked_rooms.len(), 1);
        assert_eq!(booked_rooms[0].check_in_date, check_in_date);
        println!(
            "guest{:?} signer{:?}",
            booked_rooms[0].guest_id,
            env::signer_account_id()
        );
        assert_eq!(booked_rooms[0].guest_id, accounts(2));

        let guest_booked_info = contract.get_guest_booked_info(booked_rooms[0].guest_id.clone());
        println!("\n\nGUEST INFO: {:?}", guest_booked_info);
        assert_eq!(guest_booked_info.len(), 1);

        // //TEST
        // // ホテルのオーナーにアカウントを切り替え
        testing_env!(context.signer_account_id(accounts(1)).build());
        contract.change_status_to_stay(available_rooms[0].room_id.clone(), check_in_date.clone());
        contract.change_status_to_available(
            available_rooms[0].room_id.clone(),
            check_in_date.clone(),
            booked_rooms[0].guest_id.clone(),
        );

        // // ゲストの登録情報から消えたかチェック
        let guest_booked_info = contract.get_guest_booked_info(booked_rooms[0].guest_id.clone());
        println!("\n\nGUEST INFO: {:?}", guest_booked_info);
        assert_eq!(guest_booked_info.len(), 0);
    }
}
