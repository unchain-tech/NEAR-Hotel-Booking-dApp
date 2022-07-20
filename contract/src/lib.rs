use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{collections::UnorderedMap, env, near_bindgen, AccountId, Promise};

#[near_bindgen]
#[derive(Serialize, Deserialize, Debug, BorshDeserialize, BorshSerialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Room {
    room_id: String,
    name: String,
    image: String,
    description: String,
    location: String,
    price: U128,
    owner: AccountId,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Rooms {
    pub rooms: UnorderedMap<String, Room>,
}

impl Default for Rooms {
    fn default() -> Self {
        Self {
            rooms: UnorderedMap::new(b"r".to_vec()),
        }
    }
}

#[near_bindgen]
impl Rooms {
    pub fn set_room(
        &mut self,
        timestamp: String,
        name: String,
        image: String,
        description: String,
        location: String,
        price: U128,
    ) -> String {
        // TODO: timestampとowner_idでチェックする？
        assert!(self.rooms.get(&timestamp).is_none(), "Already exists");

        let account_id = env::signer_account_id();

        self.rooms.insert(
            &timestamp.clone(),
            &Room {
                room_id: timestamp.clone(),
                name,
                image,
                description,
                location,
                price,
                owner: account_id,
            },
        );
        timestamp
    }

    pub fn get_room(&self, id: String) -> Room {
        self.rooms.get(&id).expect("No Room")
    }

    pub fn get_rooms(&self) -> Vec<Room> {
        Vec::from_iter(self.rooms.values())
    }

    /*
        return booking Room
    */
    #[payable]
    pub fn book_room(&mut self, room_id: String) -> Room {
        let room = self.get_room(room_id.clone());
        // TODO: 商品がないときのエラー処理

        let deposit = env::attached_deposit();
        assert!(deposit == room.price.clone().into(), "Not enough tokens");
        // Delete rooms where bookings are completed.
        self.rooms.remove(&room_id);
        Promise::new(room.owner.clone()).transfer(deposit);
        room
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
    fn set_then_get_room() {
        let mut context = get_context(false);
        // Initialize the mocked blockchain
        testing_env!(context.build());

        // Set the testing environment for the subsequent calls
        testing_env!(context.predecessor_account_id(accounts(0)).build());

        let mut contract = Rooms::default();
        let room_id = contract.set_room(
            "0".to_string(),
            "JAPAN_room".to_string(),
            "test.img".to_string(),
            "This is JAPAN room".to_string(),
            "Japan".to_string(),
            near_to_yocto(10),
        );

        let room = contract.get_room(room_id);
        assert_eq!(room.name, "JAPAN_room",);
    }

    #[test]
    fn set_then_get_rooms() {
        let mut context = get_context(false);
        testing_env!(context.build());
        testing_env!(context.predecessor_account_id(accounts(0)).build());

        let mut contract = Rooms::default();
        let room_id_1 = contract.set_room(
            "0".to_string(),
            "JAPAN_room".to_string(),
            "test.img".to_string(),
            "This is JAPAN room".to_string(),
            "Japan".to_string(),
            near_to_yocto(10),
        );
        let room_id_2 = contract.set_room(
            "1".to_string(),
            "USA_room".to_string(),
            "test2.img".to_string(),
            "This is USA room".to_string(),
            "USA".to_string(),
            near_to_yocto(10),
        );

        let room_1 = contract.get_room(room_id_1);
        assert_eq!(room_1.name, "JAPAN_room",);

        let room_2 = contract.get_room(room_id_2);
        assert_eq!(room_2.name, "USA_room",);
    }

    #[test]
    fn empty_get_rooms() {
        let mut context = get_context(true);
        testing_env!(context.build());
        testing_env!(context.predecessor_account_id(accounts(0)).build());
        let contract = Rooms::default();
        let rooms = contract.get_rooms();
        assert_eq!(rooms.len(), 0);
    }

    #[test]
    fn book_room() {
        let mut context = get_context(false);

        context.account_balance(near_to_yocto(2).into());
        context.attached_deposit(near_to_yocto(1).into());

        testing_env!(context.build());
        testing_env!(context.predecessor_account_id(accounts(0)).build());

        let mut contract = Rooms::default();
        let room_id_1 = contract.set_room(
            "0".to_string(),
            "JAPAN_room".to_string(),
            "test.img".to_string(),
            "This is JAPAN room".to_string(),
            "Japan".to_string(),
            near_to_yocto(1),
        );
        let _ = contract.set_room(
            "1".to_string(),
            "USA_room".to_string(),
            "test2.img".to_string(),
            "This is USA room".to_string(),
            "USA".to_string(),
            near_to_yocto(1),
        );
        // Check set 2 rooms
        let rooms = contract.get_rooms();
        assert_eq!(rooms.len(), 2);

        let book_room_1 = contract.book_room(room_id_1);
        assert_eq!(book_room_1.name, "JAPAN_room");

        // Check delete 1 room
        let rooms = contract.get_rooms();
        assert_eq!(rooms.len(), 1);
    }
}
