import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function LocationSearch() {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radius, setRadius] = useState("5"); // Default radius: 5 km
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    console.log("Updated Restaurants State:", restaurants);
  }, [restaurants]);

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

  const handleSearch = async () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseInt(radius, 10);
  
    if (isNaN(lat) || isNaN(lng) || isNaN(rad)) {
      setError("Please enter valid numeric values for latitude, longitude, and radius.");
      return;
    }
  
    setLoading(true);
    setError(null);
    setRestaurants([]); // Clear previous results
  
    try {
      const response = await axios.get(
        `http://localhost:5000/location?lat=${lat}&lng=${lng}&radius=${rad}`
      );
  
      console.log("API Response:", response.data); // 🟢 Debug API response
  
      if (response.data?.success && Array.isArray(response.data.data)) {
        
        console.log("Processed Data:", response.data.data); // 🟢 Debug processed data
        setRestaurants(response.data.data); // ✅ Ensure correct state update
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

        <div className="flex gap-4">
          <button onClick={getUserLocation} className="bg-gray-500 text-white px-4 py-2 rounded">
            📍 Get My Location
          </button>
          <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded">
            🔍 Search
          </button>
        </div>
      </div>

      {loading && <p className="text-center mt-4 text-yellow-500">Loading...</p>}
      {error && <p className="text-center mt-4 text-red-500">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
  {restaurants.slice(0, 100).map(({ restaurant }) => (
    <Link to={`/restaurant/${restaurant.R?.res_id || ""}`} key={restaurant.R?.res_id || Math.random()}>
      <div className="bg-white dark:bg-gray-800 p-4 shadow-lg rounded-xl hover:scale-105 transition-transform">
        <img
          src={restaurant.featured_image || "https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png"}
          alt={restaurant.name || "Restaurant"}
          className="w-full h-48 object-cover rounded-xl"
          onError={(e) => (e.target.src = "https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png")}
        />
        <h2 className="text-xl font-semibold mt-3">{restaurant.name || "Unknown Restaurant"}</h2>
        <p className="text-gray-600 dark:text-gray-300">{restaurant.cuisines || "Cuisines not available"}</p>
        <p className="text-yellow-500 font-bold">
          ⭐ {restaurant.user_rating?.aggregate_rating ?? "No Rating"}
        </p>
      </div>
    </Link>
  ))}
</div>

    </div>
  );
}

export default LocationSearch;
