const express = require("express");
const cors = require("cors");
const app = express();
const port = 5000;
require("dotenv").config();

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = process.env.MONGO_DB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const database = client.db(process.env.AUTH_DB_NAME);
    const productsCollection = database.collection("products");
    const usersCollection = database.collection("user");
    const reviewsCollection = database.collection("reviews");

    //ROOT ROUTE
    app.get("/", (req, res) => {
      res.send("ReSell Hub API is running!");
    });

    // PRODUCTS API
    // Get all products
    app.get("/api/products", async (req, res) => {
      try {
        const products = await productsCollection.find({}).toArray();
        res.status(200).json({
          success: true,
          data: products,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch products",
          error: error.message,
        });
      }
    });

    // Get single product by ID
    app.get("/api/products/:id", async (req, res) => {
      try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            message: "Invalid product ID",
          });
        }

        const product = await productsCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!product) {
          return res.status(404).json({
            success: false,
            message: "Product not found",
          });
        }

        res.status(200).json({
          success: true,
          data: product,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch product",
          error: error.message,
        });
      }
    });

    // REVIEWS API
    // Get reviews for a product
    app.get("/api/reviews/:productId", async (req, res) => {
      try {
        const { productId } = req.params;

        const reviews = await reviewsCollection
          .find({ productId: productId })
          .sort({ createdAt: -1 })
          .toArray();

        // Get user details for each review
        const reviewsWithUsers = await Promise.all(
          reviews.map(async (review) => {
            const user = await usersCollection.findOne(
              { _id: new ObjectId(review.userId) },
              { projection: { name: 1, email: 1 } },
            );
            return {
              ...review,
              user: user || { name: "Deleted User", email: "" },
            };
          }),
        );

        res.status(200).json({
          success: true,
          data: reviewsWithUsers,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch reviews",
          error: error.message,
        });
      }
    });

    // Add a review
    app.post("/api/reviews", async (req, res) => {
      try {
        const { productId, userId, rating, comment } = req.body;

        // Validate required fields
        if (!productId || !userId || !rating) {
          return res.status(400).json({
            success: false,
            message: "Product ID, User ID, and Rating are required",
          });
        }

        // Validate rating (1-5)
        if (rating < 1 || rating > 5) {
          return res.status(400).json({
            success: false,
            message: "Rating must be between 1 and 5",
          });
        }

        // Check if product exists
        const product = await productsCollection.findOne({
          _id: new ObjectId(productId),
        });
        if (!product) {
          return res.status(404).json({
            success: false,
            message: "Product not found",
          });
        }

        // Check if user exists
        const user = await usersCollection.findOne({
          _id: new ObjectId(userId),
        });
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        // Check if user already reviewed this product
        const existingReview = await reviewsCollection.findOne({
          productId: productId,
          userId: userId,
        });

        if (existingReview) {
          return res.status(400).json({
            success: false,
            message: "You have already reviewed this product",
          });
        }

        const reviewData = {
          productId: productId,
          userId: userId,
          rating: rating,
          comment: comment || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const result = await reviewsCollection.insertOne(reviewData);

        // Update product rating
        const allReviews = await reviewsCollection
          .find({ productId: productId })
          .toArray();
        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = (totalRating / allReviews.length).toFixed(1);

        await productsCollection.updateOne(
          { _id: new ObjectId(productId) },
          {
            $set: {
              averageRating: parseFloat(averageRating),
              totalReviews: allReviews.length,
            },
          },
        );

        res.status(201).json({
          success: true,
          message: "Review added successfully",
          data: {
            _id: result.insertedId,
            ...reviewData,
            user: {
              name: user.name,
              email: user.email,
            },
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to add review",
          error: error.message,
        });
      }
    });

    // Update a review
    app.put("/api/reviews/:reviewId", async (req, res) => {
      try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;

        if (!ObjectId.isValid(reviewId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid review ID",
          });
        }

        const updateData = {
          rating: rating,
          comment: comment || "",
          updatedAt: new Date().toISOString(),
        };

        const result = await reviewsCollection.updateOne(
          { _id: new ObjectId(reviewId) },
          { $set: updateData },
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            message: "Review not found",
          });
        }

        res.status(200).json({
          success: true,
          message: "Review updated successfully",
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to update review",
          error: error.message,
        });
      }
    });



    // Delete a review
    app.delete("/api/reviews/:reviewId", async (req, res) => {
      try {
        const { reviewId } = req.params;

        if (!ObjectId.isValid(reviewId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid review ID",
          });
        }

        // Get the review before deleting to get productId
        const review = await reviewsCollection.findOne({
          _id: new ObjectId(reviewId),
        });

        if (!review) {
          return res.status(404).json({
            success: false,
            message: "Review not found",
          });
        }

        const productId = review.productId;

        // Delete the review
        const result = await reviewsCollection.deleteOne({
          _id: new ObjectId(reviewId),
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({
            success: false,
            message: "Review not found",
          });
        }

        // Recalculate average rating for the product
        const allReviews = await reviewsCollection
          .find({ productId: productId })
          .toArray();

        if (allReviews.length === 0) {
          // No reviews left, reset product rating
          await productsCollection.updateOne(
            { _id: new ObjectId(productId) },
            {
              $set: {
                averageRating: 0,
                totalReviews: 0,
              },
            },
          );
        } else {
          // Calculate new average
          const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
          const averageRating = (totalRating / allReviews.length).toFixed(1);

          await productsCollection.updateOne(
            { _id: new ObjectId(productId) },
            {
              $set: {
                averageRating: parseFloat(averageRating),
                totalReviews: allReviews.length,
              },
            },
          );
        }

        res.status(200).json({
          success: true,
          message: "Review deleted successfully",
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to delete review",
          error: error.message,
        });
      }
    });

    // USERS API
    app.get("/api/users", async (req, res) => {
      try {
        const users = await usersCollection.find({}).toArray();
        res.status(200).json({
          success: true,
          data: users,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch users",
          error: error.message,
        });
      }
    });

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);
