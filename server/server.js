const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const axios = require("axios");
const multer = require("multer");
const HF_API_KEY = process.env.HF_API_KEY;

const storage = multer.memoryStorage();
const upload = multer({ storage });


const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "project"; 
const COLLECTION_NAME = "restaurantlist";

let db, restaurantsCollection;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
MongoClient.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log("✅ Connected to MongoDB");
    db = client.db(DB_NAME);
    restaurantsCollection = db.collection(COLLECTION_NAME);
  })
  .catch(err => {
    console.error("❌ MongoDB Connection Failed:", err);
    process.exit(1);
  });

// Routes

// Get all restaurants with pagination
app.get("/api/restaurants", async (req, res) => {
  try {
    if (!restaurantsCollection) {
      return res.status(500).json({ success: false, error: "Database connection not established" });
    }

    // Pagination parameters (default page: 1, limit: 9)
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 9;
    const skip = (page - 1) * limit;

    // Get total number of restaurants
    const totalResults = await restaurantsCollection.countDocuments();

    // Fetch restaurants with pagination
    const restaurants = await restaurantsCollection
      .find({}, { projection: { _id: 0 } }) // Exclude _id from results
      .sort({ "restaurant.user_rating.aggregate_rating": -1 }) // Optional: Sort by rating
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format the response
    res.status(200).json({
      success: true,
      page,
      limit,
      total_results: totalResults,
      total_pages: Math.ceil(totalResults / limit),
      data: restaurants, // Fixed response format
    });
  } catch (err) {
    console.error("❌ Error fetching restaurants:", err);
    res.status(500).json({ success: false, error: "Failed to fetch restaurants" });
  }
});

  
  app.get("/api/restaurants/:id", async (req, res) => {
    try {
      const restaurantId = parseInt(req.params.id); // Convert ID to integer
  
      // Find the restaurant inside the nested "restaurants" array
      const document = await restaurantsCollection.findOne({
        "restaurants.restaurant.R.res_id": restaurantId
      });
  
      if (!document) {
        return res.status(404).json({ success: false, error: "Restaurant not found" });
      }
  
      // Extract the correct restaurant from the array
      const restaurant = document.restaurants.find(
        (r) => r.restaurant.R.res_id === restaurantId
      );
  
      if (!restaurant) {
        return res.status(404).json({ success: false, error: "Restaurant not found" });
      }
  
      // Return the restaurant data as-is from MongoDB
      res.json({ success: true, data: restaurant.restaurant });
    } catch (err) {
      res.status(500).json({ success: false, error: "Failed to fetch restaurant" });
    }
  });

  app.get("/location", async (req, res) => {
    try {
        const collection = db.collection("restaurantlist");
        const { lat, lng, radius } = req.query;

        // Validate query parameters
        if (!lat || !lng || !radius) {
            return res.status(400).json({ message: "Latitude, longitude, and radius are required." });
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const searchRadius = parseFloat(radius) / 6378.1; // Convert km to radians

        if (isNaN(latitude) || isNaN(longitude) || isNaN(searchRadius)) {
            return res.status(400).json({ message: "Invalid latitude, longitude, or radius values." });
        }

        // MongoDB Aggregation Pipeline
        const restaurants = await collection.aggregate([
            { $unwind: "$restaurants" },
            {
                $addFields: {
                    "restaurants.restaurant.location.coordinates": [
                        { $toDouble: "$restaurants.restaurant.location.longitude" },
                        { $toDouble: "$restaurants.restaurant.location.latitude" }
                    ]
                }
            },
            {
                $match: {
                    "restaurants.restaurant.location.coordinates": {
                        $geoWithin: {
                            $centerSphere: [[longitude, latitude], searchRadius]
                        }
                    }
                }
            },
            { $replaceRoot: { newRoot: "$restaurants" } }
        ]).toArray();

        // Handle case when no restaurants are found
        if (restaurants.length === 0) {
            return res.status(404).json({ message: "No restaurants found in this area." });
        }

        res.json({ success: true, data: restaurants });

    } catch (error) {
        console.error("Error in location search:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

const detectFood = async (imageBuffer) => {
  try {
      console.log("Sending request to Hugging Face API for food detection...");
      const response = await axios.post(
          "https://api-inference.huggingface.co/models/ewanlong/food_type_image_detection",
          imageBuffer,
          {
              headers: {
                  Authorization: `Bearer ${HF_API_KEY}`,
                  "Content-Type": "application/octet-stream",
              },
          }
      );

      console.log("Food detection response:", response.data);
      return response.data;
  } catch (error) {
      console.error("Error from API:", error.response ? error.response.data : error.message);
      return null;
  }
};

app.post("/image-search", upload.single("image"),async (req, res) => {
  console.log("Received request to upload image and find restaurants...");
  
  if (!req.file) {
      console.error("No image uploaded");
      return res.status(400).json({ error: "No image uploaded" });
  }

  try {
      console.log("Image uploaded, starting food detection...");
      const foodDetectionResult = await detectFood(req.file.buffer);

      if (!foodDetectionResult || !Array.isArray(foodDetectionResult) || foodDetectionResult.length === 0) {
          console.error("Food detection failed or returned empty results");
          return res.status(500).json({ error: "Food detection failed" });
      }

      console.log("Food Detection Result:", foodDetectionResult);

      const foodToCuisineMap = {
          burger: "American",
          pizza: "Italian",
          sushi: "Japanese",
          biryani: "Indian",
          tacos: "Mexican",
          pasta: "Italian",
          cheesecake: "Dessert",
          "baked potato": "American",
          "crispy chicken": "Fast Food",
          "crispy chicken": "Italian",
          "crispy chicken": "American",
          chai: "Indian"
      };

      const topCuisines = foodDetectionResult
          .sort((a, b) => b.score - a.score)
          .slice(0, 2)
          .map(item => foodToCuisineMap[item.label.toLowerCase()] || null) 
          .filter(Boolean);

      if (topCuisines.length === 0) {
          console.log("No cuisines identified from the food detection results.");
          return res.json({ message: "No cuisines identified", restaurants: [] });
      }

      console.log("Identified Cuisines:", topCuisines);

      const collection = db.collection("restaurantlist");
      console.log("Searching for restaurants matching the cuisines...");
      const result = await collection
          .find({ "restaurants.restaurant.cuisines": { $in: topCuisines } })
          .toArray();

      console.log("Found restaurants:", result);

      const filteredRestaurants = result.flatMap(doc =>
          doc.restaurants
              .filter(r => topCuisines.some(c => r.restaurant.cuisines.includes(c)))
              .map(r => ({
                  name: r.restaurant.name,
                  location: r.restaurant.location,
                  cuisines: r.restaurant.cuisines,
                  user_rating: r.restaurant.user_rating,
                  price_range: r.restaurant.price_range,
                  featured_image: r.restaurant.featured_image,
                  menu_url: r.restaurant.menu_url,
                  url: r.restaurant.url
              }))
      );

      if (filteredRestaurants.length === 0) {
          console.log("No matching restaurants found.");
          return res.json({ message: "No matching restaurants found", restaurants: [] });
      }

      //console.log("Returning matching restaurants:", filteredRestaurants);
      res.json({ restaurants: filteredRestaurants });
  } catch (error) {
      console.error("Error processing request:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

  app.get("/", (req, res) => {
    res.send("Zomato Backend is Running...");
  });
  
  // Start Server 
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));