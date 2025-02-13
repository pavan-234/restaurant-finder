import { useState, useEffect } from "react";
import axios from "axios";

function LocationSearch() {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radius, setRadius] = useState("5"); // Default: 5 km
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Auto-fetch user's location when component mounts
  useEffect(() => {
    getUserLocation();
  }, []);

  // 📍 Get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
      },
      () => {
        setError("Unable to fetch location. Please enter manually.");
      }
    );
  };

  // 🔍 Search restaurants based on location
  const handleSearch = async () => {
    if (!latitude || !longitude || !radius) {
      setError("Please enter valid latitude, longitude, and radius.");
      return;
    }

    setLoading(true);
    setError(null);
    setRestaurants([]); // Clear previous results

    try {
      const response = await axios.get(
        `http://localhost:5000/api/restaurants?lat=${latitude}&lng=${longitude}&radius=${radius}`
      );

      if (response.data.success && response.data.data.length > 0) {
        setRestaurants(response.data.data);
      } else {
        setError("No restaurants found in this area.");
      }
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      setError("Failed to fetch restaurants. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center text-green-500">Find Nearby Restaurants</h1>

      {/* 🌍 Location Input Fields */}
      <div className="flex flex-col gap-4 items-center mt-4">
        <input
          type="number"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          placeholder="Latitude"
          className="border p-2 rounded w-full max-w-xs"
        />
        <input
          type="number"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          placeholder="Longitude"
          className="border p-2 rounded w-full max-w-xs"
        />
        <input
          type="number"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          placeholder="Radius (km)"
          className="border p-2 rounded w-full max-w-xs"
        />

        {/* 🎯 Action Buttons */}
        <div className="flex gap-4">
          <button onClick={getUserLocation} className="bg-gray-500 text-white px-4 py-2 rounded">
            📍 Get My Location
          </button>
          <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded">
            🔍 Search
          </button>
        </div>
      </div>

      {/* ⏳ Loading & Error Messages */}
      {loading && <p className="text-center mt-4 text-yellow-500">Loading...</p>}
      {error && <p className="text-center mt-4 text-red-500">{error}</p>}

      {/* 🍽️ Restaurants List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {restaurants.map((restaurant) => (
          <div
            key={restaurant._id || Math.random()}
            className="bg-white dark:bg-gray-800 p-4 shadow-lg rounded-xl hover:scale-105 transition-transform"
          >
            <img
              src={restaurant.featured_image || "https://via.placeholder.com/300?text=No+Image"}
              alt={restaurant.name}
              className="w-full h-48 object-cover rounded-xl"
            />
            <h2 className="text-xl font-semibold mt-3">{restaurant.name}</h2>
            <p className="text-gray-600 dark:text-gray-300">{restaurant.cuisines}</p>
            <p className="text-yellow-500 font-bold">
              ⭐ {restaurant.user_rating?.aggregate_rating || "No Rating"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LocationSearch;
