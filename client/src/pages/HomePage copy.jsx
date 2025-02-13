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
      <h1 className="text-3xl font-bold text-center text-green-500">Zomato Restaurants</h1>

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



// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import Navbar from "../components/Navbar"; // Import Navbar

// function HomePage() {
//   const [restaurants, setRestaurants] = useState([]); // 🔥 Store restaurants received from Navbar
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   return (
//     <div className="p-6">
//       {/* ✅ Pass setRestaurants to Navbar so it can update the list */}
//       <Navbar setRestaurants={setRestaurants} setLoading={setLoading} setError={setError} />

//       <h1 className="text-3xl font-bold text-center text-green-500">Zomato Restaurants</h1>

//       {/* ✅ Handle Loading & Error States */}
//       {loading ? (
//         <h1 className="text-center text-2xl font-bold">Loading...</h1>
//       ) : error ? (
//         <h1 className="text-center text-2xl font-bold text-red-500">{error}</h1>
//       ) : restaurants.length === 0 ? (
//         <h1 className="text-center text-2xl font-bold text-red-500">No Restaurants Found</h1>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
//           {restaurants.map((restaurant) => (
//             <Link to={`/restaurant/${restaurant.R?.res_id}`} key={restaurant.R?.res_id || Math.random()}>
//               <div className="bg-white dark:bg-gray-800 p-4 shadow-lg rounded-xl hover:scale-105 transition-transform">
//                 <img
//                   src={restaurant.featured_image || "https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png"}
//                   alt={restaurant.name}
//                   className="w-full h-48 object-cover rounded-xl"
//                 />
//                 <h2 className="text-xl font-semibold mt-3">{restaurant.name}</h2>
//                 <p className="text-gray-600 dark:text-gray-300">{restaurant.cuisines}</p>
//                 <p className="text-yellow-500 font-bold">
//                   ⭐ {restaurant.user_rating?.aggregate_rating || "No Rating"}
//                 </p>
//               </div>
//             </Link>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// export default HomePage;

// import { useState, useEffect } from "react";
// import { Moon, Sun, MapPin } from "lucide-react"; // Lucide icons for UI
// import axios from "axios";

// function Navbar({ setRestaurants, setLoading, setError }) {
//   const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
//   const [latitude, setLatitude] = useState("");
//   const [longitude, setLongitude] = useState("");
//   const [radius, setRadius] = useState("5"); // Default radius (5 km)

//   useEffect(() => {
//     if (darkMode) {
//       document.documentElement.classList.add("dark");
//       localStorage.setItem("theme", "dark");
//     } else {
//       document.documentElement.classList.remove("dark");
//       localStorage.setItem("theme", "light");
//     }
//   }, [darkMode]);

//   // 📌 Fetch Nearby Restaurants & Pass Data to HomePage
//   const handleSearch = async () => {
//     if (!latitude || !longitude || !radius) {
//       alert("Please enter valid latitude, longitude, and radius.");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError(null);

//       const response = await axios.get(`http://localhost:5000/location?lat=${latitude}&lng=${longitude}&radius=${radius}`);
//       console.log("✅ Nearby Restaurants:", response.data);

//       if (response.data && Array.isArray(response.data)) {
//         const formattedRestaurants = response.data.map(entry => entry.restaurant);
//         setRestaurants(formattedRestaurants); // 🔥 Pass data to HomePage
//       } else {
//         setError("Unexpected API response format.");
//       }

//       setLoading(false);
//     } catch (error) {
//       console.error("❌ Error fetching nearby restaurants:", error);
//       setError("Failed to fetch restaurants. Please try again.");
//       setLoading(false);
//     }
//   };

//   return (
//     <nav className="bg-white dark:bg-gray-900 shadow-md py-4 px-6 flex flex-wrap justify-between items-center gap-4">
//       <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Find Restaurant</h1>

//       {/* 📌 Location Input Fields */}
//       <div className="flex items-center gap-2">
//         <input
//           type="number"
//           value={latitude}
//           onChange={(e) => setLatitude(e.target.value)}
//           placeholder="Latitude"
//           className="px-3 py-2 w-24 rounded-md border dark:bg-gray-800 dark:text-white"
//         />
//         <input
//           type="number"
//           value={longitude}
//           onChange={(e) => setLongitude(e.target.value)}
//           placeholder="Longitude"
//           className="px-3 py-2 w-24 rounded-md border dark:bg-gray-800 dark:text-white"
//         />
//         <input
//           type="number"
//           value={radius}
//           onChange={(e) => setRadius(e.target.value)}
//           placeholder="Radius (km)"
//           className="px-3 py-2 w-24 rounded-md border dark:bg-gray-800 dark:text-white"
//         />
//         <button
//           onClick={handleSearch}
//           className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
//         >
//           <MapPin className="w-5 h-5" /> Search
//         </button>
//       </div>

//       {/* 🌙 Dark Mode Toggle */}
//       <button
//         onClick={() => setDarkMode(!darkMode)}
//         className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 transition"
//       >
//         {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
//       </button>
//     </nav>
//   );
// }

// export default Navbar;

// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { useState } from "react";
// import Navbar from "./components/Navbar";
// import HomePage from "./pages/HomePage";
// import RestaurantDetails from "./pages/RestaurantDetails";

// function App() {
//   const [restaurants, setRestaurants] = useState([]); // State for restaurants

//   return (
//     <Router>
//       <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        
//         {/* ✅ Move Navbar here so it's shown only once */}
//         <Navbar setRestaurants={setRestaurants} />
        
//         <main className="flex-grow relative">
//           <div className="absolute inset-0 overflow-auto">
//             <Routes>
//               <Route
//                 path="/"
//                 element={<HomePage restaurants={restaurants} setRestaurants={setRestaurants} />}
//               />
//               <Route
//                 path="/restaurant/:id"
//                 element={<RestaurantDetails />}
//               />
//               <Route
//                 path="*"
//                 element={
//                   <div className="min-h-screen flex items-center justify-center">
//                     <div className="text-center p-8 bg-red-50 dark:bg-red-900 rounded-xl">
//                       <h1 className="text-2xl font-bold text-red-500 dark:text-red-400">
//                         Page Not Found
//                       </h1>
//                       <p className="mt-2 text-gray-600 dark:text-gray-400">
//                         The page you're looking for doesn't exist.
//                       </p>
//                     </div>
//                   </div>
//                 }
//               />
//             </Routes>
//           </div>
//         </main>
//       </div>
//     </Router>
//   );
// }

// export default App;
