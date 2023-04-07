use near_sdk::env;
use near_sdk::json_types::U128;
use near_sdk::test_utils::{accounts, VMContextBuilder};
use near_sdk::testing_env;

// トランザクションを実行するテスト環境を設定
fn get_context(is_view: bool) -> VMContextBuilder {
    let mut builder = VMContextBuilder::new();
    builder
        .current_account_id(accounts(0))
        .predecessor_account_id(accounts(0))
        .signer_account_id(accounts(1))
        // 使用するメソッドをbooleanで指定(viewメソッドはtrue, changeメソッドはfalse)
        .is_view(is_view);
    builder
}
#[test]
fn add_then_get_registered_rooms() {
    let context = get_context(false);
    testing_env!(context.build());
    let mut contract = hotel_booking::Contract::default();
    contract.add_room_to_owner(
        "101".to_string(),
        "test.img".to_string(),
        1,
        "This is 101 room".to_string(),
        "Tokyo".to_string(),
        U128(10),
    );
    contract.add_room_to_owner(
        "201".to_string(),
        "test.img".to_string(),
        1,
        "This is 201 room".to_string(),
        "Tokyo".to_string(),
        U128(10),
    );
    // add_room_to_owner関数をコールしたアカウントIDを取得
    let owner_id = env::signer_account_id();

    let all_rooms = contract.get_rooms_registered_by_owner(owner_id);
    assert_eq!(all_rooms.len(), 2);
}

#[test]
fn no_registered_room() {
    let context = get_context(true);
    testing_env!(context.build());
    let contract = hotel_booking::Contract::default();

    let no_registered_room = contract.get_rooms_registered_by_owner(accounts(0));
    assert_eq!(no_registered_room.len(), 0);
}

#[test]
fn add_then_get_available_rooms() {
    let mut context = get_context(false);
    testing_env!(context.build());

    let mut contract = hotel_booking::Contract::default();
    contract.add_room_to_owner(
        "101".to_string(),
        "test.img".to_string(),
        1,
        "This is 101 room".to_string(),
        "Tokyo".to_string(),
        U128(10),
    );
    contract.add_room_to_owner(
        "201".to_string(),
        "test.img".to_string(),
        1,
        "This is 201 room".to_string(),
        "Tokyo".to_string(),
        U128(10),
    );

    // `get_available_rooms`をコールするアカウントを設定
    testing_env!(context.signer_account_id(accounts(2)).build());
    let available_rooms = contract.get_available_rooms("2222-01-01".to_string());
    assert_eq!(available_rooms.len(), 2);
}

#[test]
fn no_available_room() {
    let context = get_context(true);
    testing_env!(context.build());
    let contract = hotel_booking::Contract::default();

    let available_rooms = contract.get_available_rooms("2222-01-01".to_string());
    assert_eq!(available_rooms.len(), 0);
}

// Room Owner   : bob(accounts(1))
// Booking Guest: charlie(accounts(2))
#[test]
fn book_room_then_change_status() {
    let mut context = get_context(false);

    // 宿泊料を支払うため、NEARを設定
    context.account_balance(10);
    context.attached_deposit(10);

    testing_env!(context.build());

    let owner_id = env::signer_account_id();
    // 部屋の名前
    let name = "101".to_string();
    // 部屋のID
    let room_id = format!("{}{}", owner_id, name);

    let mut contract = hotel_booking::Contract::default();
    contract.add_room_to_owner(
        name,
        "test.img".to_string(),
        1,
        "This is 101 room".to_string(),
        "Tokyo".to_string(),
        U128(10),
    );

    ///////////////////
    // CHECK BOOKING //
    ///////////////////
    // 予約を実行するアカウントを設定
    testing_env!(context.signer_account_id(accounts(2)).build());

    let check_in_date: String = "2222-01-01".to_string();

    // 予約を実行
    contract.book_room(room_id.clone(), check_in_date.clone());

    // オーナー用の予約データの中身を確認
    let booked_rooms = contract.get_booking_info_for_owner(owner_id.clone());
    assert_eq!(booked_rooms.len(), 1);

    // 宿泊者用の予約データの中身を確認
    let guest_booked_rooms = contract.get_booking_info_for_guest(accounts(2));
    assert_eq!(guest_booked_rooms.len(), 1);

    /////////////////////////
    // CHECK CHANGE STATUS //
    /////////////////////////
    // 'change_status_to_stay'をコールするアカウントを部屋のオーナーに設定
    testing_env!(context.signer_account_id(accounts(1)).build());

    // 部屋のステータスを確認
    let is_available = contract.is_available(room_id.clone());
    assert!(is_available);

    // 部屋のステータスを変更（Available -> Stay）
    contract.change_status_to_stay(room_id.clone(), check_in_date.clone());

    // 再度ステータスを確認
    let is_available = contract.is_available(room_id.clone());
    assert!(!is_available);

    // 部屋のステータスを変更（Stay -> Available）
    contract.change_status_to_available(room_id, check_in_date, accounts(2));
    // 予約データから削除されたかチェック
    let booked_rooms = contract.get_booking_info_for_owner(owner_id);
    assert_eq!(booked_rooms.len(), 0);

    // 宿泊者の予約データから消えたかチェック
    let guest_booked_info = contract.get_booking_info_for_guest(accounts(2));
    assert_eq!(guest_booked_info.len(), 0);
}
