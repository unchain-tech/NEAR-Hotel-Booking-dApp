import { BrowserRouter, Route, Routes } from 'react-router-dom';

import NavBar from './assets/js/components/NavBar';
import GuestBookedList from './assets/js/pages/GuestBookedList';
import Home from './assets/js/pages/Home';
import ManageBookings from './assets/js/pages/ManageBookings';
import ManageRooms from './assets/js/pages/ManageRooms';
import Search from './assets/js/pages/Search';

const App = () => {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search/:date" element={<Search />} />
        <Route path="/booked-list" element={<GuestBookedList />} />
        <Route path="/manage-rooms" element={<ManageRooms />} />
        <Route path="/manage-bookings" element={<ManageBookings />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
