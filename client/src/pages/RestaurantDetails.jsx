import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";

function RestaurantDetails() {
  const { id } = useParams(); // Get restaurant ID from URL
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`https://restaurant-finder-87y8.onrender.com/api/restaurants/${id}`)
      .then((res) => {
        console.log("✅ Restaurant Data:", res.data); // Debugging
        setRestaurant(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error fetching restaurant:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <h1 className="text-center text-2xl font-bold">Loading...</h1>;
  }

  if (!restaurant) {
    return <h1 className="text-center text-2xl font-bold text-red-500">Restaurant Not Found</h1>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <Link to="/" className="text-blue-500 text-lg mb-4 inline-block">← Back to Home</Link>

      {/* Restaurant Image */}
      <img
        src={restaurant.featured_image || "https://via.placeholder.com/600"}
        alt={restaurant.name}
        className="w-full h-64 object-cover rounded-xl"
      />

      {/* Restaurant Details */}
      <h1 className="text-4xl font-bold mt-4">{restaurant.name}</h1>
      <p className="text-gray-600 mt-2">{restaurant.cuisines}</p>
      <p className="text-yellow-500 font-bold text-lg mt-2">
        ⭐ {restaurant.user_rating?.aggregate_rating || "No Rating"}
      </p>

      {/* Location */}
      <div className="mt-4">
        <h2 className="text-xl font-semibold">📍 Location</h2>
        <p className="text-gray-600">{restaurant.location?.address || "Not Available"}</p>
      </div>

      {/* Booking & Menu */}
      <div className="mt-6 flex gap-4">
        {restaurant.menu_url && (
          <a href={restaurant.menu_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-500 text-white rounded-lg">
            View Menu
          </a>
        )}
        {restaurant.book_url && (
          <a href={restaurant.book_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-green-500 text-white rounded-lg">
            Book a Table
          </a>
        )}
      </div>
    </div>
  );
}

export default RestaurantDetails;
