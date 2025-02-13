const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

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

  

  app.get("/", (req, res) => {
    res.send("Zomato Backend is Running...");
  });
  
  // Start Server 
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));