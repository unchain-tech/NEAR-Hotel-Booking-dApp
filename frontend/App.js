import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./assets/js/pages/Home";
import Search from "./assets/js/pages/Search";
import GuestBookedList from "./assets/js/pages/GuestBookedList";
import ManageRooms from "./assets/js/pages/ManageRooms";
import ManageBookings from "./assets/js/pages/ManageBookings";

import NavBar from "./assets/js/components/NavBar";

const App = () => {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/search/:date' element={<Search />} />
        <Route path='/booked-list' element={<GuestBookedList />} />
        <Route path='/manage-rooms' element={<ManageRooms />} />
        <Route path='/manage-bookings' element={<ManageBookings />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
