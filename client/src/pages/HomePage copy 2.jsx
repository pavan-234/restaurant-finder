import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 9; // Ensure exactly 9 restaurants per page

  useEffect(() => {
    setLoading(true);
    setError(null);

    axios
      .get(`http://localhost:5000/api/restaurants?page=${page}&limit=${limit}`)
      .then((res) => {
        console.log("✅ API Response:", res.data);

        if (res.data && res.data.data) {
          // Extract restaurant data correctly
          const formattedRestaurants = res.data.data.flatMap((entry) => entry.restaurants.map((r) => r.restaurant));

          console.log("✅ Formatted Restaurants:", formattedRestaurants);

          setRestaurants(formattedRestaurants);
          setTotalPages(res.data.total_pages || 1); // Ensure total pages exist
        } else {
          console.error("🚨 Unexpected API Response:", res.data);
          setError("Unexpected API response format.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error fetching restaurants:", err);
        setError("Failed to load restaurants. Please try again.");
        setLoading(false);
      });
  }, [page]);

  if (loading) {
    return <h1 className="text-center text-2xl font-bold">Loading...</h1>;
  }

  if (error) {
    return <h1 className="text-center text-2xl font-bold text-red-500">{error}</h1>;
  }

  if (!restaurants || restaurants.length === 0) {
    return <h1 className="text-center text-2xl font-bold text-red-500">No Restaurants Found</h1>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center text-white-500">Select Your Restaurants</h1>

      {/* Restaurant Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {restaurants.slice(0, 9).map((restaurant) => (
          <Link to={`/restaurant/${restaurant.R?.res_id}`} key={restaurant.R?.res_id || Math.random()}>
            <div className="bg-white dark:bg-gray-800 p-4 shadow-lg rounded-xl hover:scale-105 transition-transform">
              <img
                src={restaurant.featured_image || "https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png"}
                alt={restaurant.name}
                className="w-full h-48 object-cover rounded-xl"
                onError={(e) => (e.target.src = "https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png")}
              />
              <h2 className="text-xl font-semibold mt-3">{restaurant.name}</h2>
              <p className="text-gray-600 dark:text-gray-300">{restaurant.cuisines}</p>
              <p className="text-yellow-500 font-bold">
                ⭐ {restaurant.user_rating?.aggregate_rating || "No Rating"}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-6 space-x-4">
        <button
          className={`px-4 py-2 rounded-lg ${
            page === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-white"
          }`}
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
        >
          ← Previous
        </button>
        <span className="text-lg font-semibold">
          Page {page} of {totalPages}
        </span>
        <button
          className={`px-4 py-2 rounded-lg ${
            page >= totalPages ? "bg-gray-400 cursor-not-allowed" : "bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-white"
          }`}
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default HomePage;
