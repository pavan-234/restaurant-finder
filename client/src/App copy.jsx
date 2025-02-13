// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LocationSearch from "./pages/LocationSearch";
import ImageSearch from "./pages/ImageSearch";
import RestaurantDetails from "./pages/RestaurantDetails";

function App() {
  return (
    <Router>
      <div className="dark:bg-gray-900 dark:text-white min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/restaurant/:id" element={<RestaurantDetails />} />
          <Route path="/location" element={<LocationSearch />} />
          <Route path="/image-search" element={<ImageSearch />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
