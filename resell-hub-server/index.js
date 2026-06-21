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
    const wishlistCollection = database.collection("wishlist");
    const ordersCollection = database.collection("orders");
    const paymentsCollection = database.collection("payments");

    // ROOT ROUTE
    app.get("/", (req, res) => {
      res.send("ReSell Hub API is running!");
    });

    //PRODUCTS API
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

    // ORDERS API

    // Create order
    app.post("/api/orders", async (req, res) => {
      try {
        const {
          userId,
          productId,
          quantity,
          paymentMethod,
          paymentStatus,
          shippingAddress,
        } = req.body;

        if (!userId || !productId) {
          return res.status(400).json({
            success: false,
            message: "User ID and Product ID are required",
          });
        }

        const product = await productsCollection.findOne({
          _id: new ObjectId(productId),
        });
        if (!product) {
          return res.status(404).json({
            success: false,
            message: "Product not found",
          });
        }

        const qty = quantity || 1;
        if (product.stock < qty) {
          return res.status(400).json({
            success: false,
            message: "Insufficient stock",
          });
        }

        const orderCount = await ordersCollection.countDocuments();
        const orderNumber = `ORDER-${String(orderCount + 1).padStart(4, "0")}`;

        const orderData = {
          orderId: orderNumber,
          userId: userId,
          productId: productId,
          productDetails: {
            title: product.title,
            price: product.price,
            image: product.images?.[0] || null,
          },
          sellerId: product.sellerInfo?.userId || null,
          quantity: qty,
          totalAmount: product.price * qty,
          paymentStatus: paymentStatus || "pending",
          paymentMethod: paymentMethod || "stripe",
          paymentId: null,
          orderStatus: "pending",
          shippingAddress: shippingAddress || {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const result = await ordersCollection.insertOne(orderData);

        await productsCollection.updateOne(
          { _id: new ObjectId(productId) },
          {
            $inc: { stock: -qty },
            $set: {
              status: product.stock - qty === 0 ? "sold" : "available",
            },
          },
        );

        res.status(201).json({
          success: true,
          message: "Order created successfully",
          data: {
            _id: result.insertedId,
            ...orderData,
          },
        });
      } catch (error) {
        console.error("Order creation error:", error);
        res.status(500).json({
          success: false,
          message: "Failed to create order",
          error: error.message,
        });
      }
    });

    // Get user's orders with full details
    app.get("/api/orders/user/:userId", async (req, res) => {
      try {
        const { userId } = req.params;

        const orders = await ordersCollection
          .find({ userId: userId })
          .sort({ createdAt: -1 })
          .toArray();

        const ordersWithDetails = await Promise.all(
          orders.map(async (order) => {
            const product = await productsCollection.findOne({
              _id: new ObjectId(order.productId),
            });
            return {
              ...order,
              productDetails: product || null,
            };
          }),
        );

        res.status(200).json({
          success: true,
          data: ordersWithDetails,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch orders",
          error: error.message,
        });
      }
    });

    // Get single order by ID with user verification
    app.get("/api/orders/single/:orderId/:userId", async (req, res) => {
      try {
        const { orderId, userId } = req.params;

        if (!ObjectId.isValid(orderId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid order ID",
          });
        }

        const order = await ordersCollection.findOne({
          _id: new ObjectId(orderId),
          userId: userId,
        });

        if (!order) {
          return res.status(404).json({
            success: false,
            message: "Order not found",
          });
        }

        const product = await productsCollection.findOne({
          _id: new ObjectId(order.productId),
        });

        res.status(200).json({
          success: true,
          data: {
            ...order,
            productDetails: product || null,
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch order",
          error: error.message,
        });
      }
    });

    //  Cancel order
    app.patch("/api/orders/:orderId/cancel", async (req, res) => {
      try {
        const { orderId } = req.params;
        const { userId } = req.body;

        if (!ObjectId.isValid(orderId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid order ID",
          });
        }

        const order = await ordersCollection.findOne({
          _id: new ObjectId(orderId),
          userId: userId,
        });

        if (!order) {
          return res.status(404).json({
            success: false,
            message: "Order not found",
          });
        }

        if (
          order.orderStatus === "shipped" ||
          order.orderStatus === "delivered"
        ) {
          return res.status(400).json({
            success: false,
            message: "Order cannot be cancelled after shipment",
          });
        }

        if (order.orderStatus === "cancelled") {
          return res.status(400).json({
            success: false,
            message: "Order is already cancelled",
          });
        }

        await ordersCollection.updateOne(
          { _id: new ObjectId(orderId) },
          {
            $set: {
              orderStatus: "cancelled",
              updatedAt: new Date().toISOString(),
            },
          },
        );

        await productsCollection.updateOne(
          { _id: new ObjectId(order.productId) },
          {
            $inc: { stock: order.quantity },
          },
        );

        res.status(200).json({
          success: true,
          message: "Order cancelled successfully",
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to cancel order",
          error: error.message,
        });
      }
    });

    //  PAYMENTS API

    // Create payment record
    app.post("/api/payments", async (req, res) => {
      try {
        const {
          orderId,
          transactionId,
          amount,
          paymentMethod,
          paymentStatus,
          customerEmail,
          customerName,
        } = req.body;

        if (!orderId || !transactionId || !amount) {
          return res.status(400).json({
            success: false,
            message: "Order ID, Transaction ID, and Amount are required",
          });
        }

        const order = await ordersCollection.findOne({
          _id: new ObjectId(orderId),
        });
        if (!order) {
          return res.status(404).json({
            success: false,
            message: "Order not found",
          });
        }

        const paymentData = {
          orderId: orderId,
          transactionId: transactionId,
          amount: amount,
          paymentMethod: paymentMethod || "stripe",
          paymentStatus: paymentStatus || "success",
          customerEmail: customerEmail || null,
          customerName: customerName || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const result = await paymentsCollection.insertOne(paymentData);

        await ordersCollection.updateOne(
          { _id: new ObjectId(orderId) },
          {
            $set: {
              paymentStatus: paymentStatus || "success",
              paymentId: transactionId,
              updatedAt: new Date().toISOString(),
            },
          },
        );

        res.status(201).json({
          success: true,
          message: "Payment recorded successfully",
          data: {
            _id: result.insertedId,
            ...paymentData,
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to record payment",
          error: error.message,
        });
      }
    });

    // Get payment by order ID
    app.get("/api/payments/:orderId", async (req, res) => {
      try {
        const { orderId } = req.params;
        const payment = await paymentsCollection.findOne({
          orderId: orderId,
        });

        if (!payment) {
          return res.status(404).json({
            success: false,
            message: "Payment not found",
          });
        }

        res.status(200).json({
          success: true,
          data: payment,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch payment",
          error: error.message,
        });
      }
    });

    // Get user's payments with product details
    app.get("/api/payments/user/:userId", async (req, res) => {
      try {
        const { userId } = req.params;

        const orders = await ordersCollection
          .find({
            userId: userId,
            paymentStatus: "paid",
          })
          .sort({ createdAt: -1 })
          .toArray();

        const payments = await Promise.all(
          orders.map(async (order) => {
            const payment = await paymentsCollection.findOne({
              orderId: order._id.toString(),
            });
            const product = await productsCollection.findOne({
              _id: new ObjectId(order.productId),
            });
            return {
              _id: payment?._id || order._id,
              orderId: order.orderId,
              transactionId: payment?.transactionId || order.paymentId || "N/A",
              amount: order.totalAmount,
              paymentMethod: order.paymentMethod || "stripe",
              paymentStatus: order.paymentStatus || "paid",
              productTitle:
                product?.title || order.productDetails?.title || "N/A",
              productImage:
                product?.images?.[0] || order.productDetails?.image || null,
              createdAt: order.createdAt,
            };
          }),
        );

        res.status(200).json({
          success: true,
          data: payments,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch payments",
          error: error.message,
        });
      }
    });

    // WISHLIST API
    //  WISHLIST API

    // Add to wishlist
    app.post("/api/wishlist", async (req, res) => {
      try {
        const { userId, productId } = req.body;

        if (!userId || !productId) {
          return res.status(400).json({
            success: false,
            message: "User ID and Product ID are required",
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

        // Check if already in wishlist
        const existing = await wishlistCollection.findOne({
          userId: userId,
          productId: productId,
        });

        if (existing) {
          return res.status(400).json({
            success: false,
            message: "Product already in wishlist",
          });
        }

        const wishlistData = {
          userId: userId,
          productId: productId,
          createdAt: new Date().toISOString(),
        };

        const result = await wishlistCollection.insertOne(wishlistData);

        res.status(201).json({
          success: true,
          message: "Added to wishlist",
          data: {
            _id: result.insertedId,
            ...wishlistData,
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to add to wishlist",
          error: error.message,
        });
      }
    });

    // Remove from wishlist
    app.delete("/api/wishlist", async (req, res) => {
      try {
        const { userId, productId } = req.body;

        if (!userId || !productId) {
          return res.status(400).json({
            success: false,
            message: "User ID and Product ID are required",
          });
        }

        const result = await wishlistCollection.deleteOne({
          userId: userId,
          productId: productId,
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({
            success: false,
            message: "Wishlist item not found",
          });
        }

        res.status(200).json({
          success: true,
          message: "Removed from wishlist",
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to remove from wishlist",
          error: error.message,
        });
      }
    });

    // Get user's wishlist
    app.get("/api/wishlist/:userId", async (req, res) => {
      try {
        const { userId } = req.params;

        const wishlist = await wishlistCollection
          .find({ userId: userId })
          .sort({ createdAt: -1 })
          .toArray();

        const wishlistWithProducts = await Promise.all(
          wishlist.map(async (item) => {
            const product = await productsCollection.findOne({
              _id: new ObjectId(item.productId),
            });
            return {
              ...item,
              product: product,
            };
          }),
        );

        res.status(200).json({
          success: true,
          data: wishlistWithProducts,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch wishlist",
          error: error.message,
        });
      }
    });

    // Check if product is in wishlist
    app.get("/api/wishlist/check/:userId/:productId", async (req, res) => {
      try {
        const { userId, productId } = req.params;

        const exists = await wishlistCollection.findOne({
          userId: userId,
          productId: productId,
        });

        res.status(200).json({
          success: true,
          inWishlist: !!exists,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to check wishlist",
          error: error.message,
        });
      }
    });

    //  REVIEWS API
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

    //USERS API

    // Get all users
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

    // Get single user by ID
    app.get("/api/users/:userId", async (req, res) => {
      try {
        const { userId } = req.params;

        if (!ObjectId.isValid(userId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid user ID",
          });
        }

        const user = await usersCollection.findOne({
          _id: new ObjectId(userId),
        });

        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        res.status(200).json({
          success: true,
          data: user,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch user",
          error: error.message,
        });
      }
    });

    // Update user profile
    app.put("/api/users/:userId", async (req, res) => {
      try {
        const { userId } = req.params;
        const { name, phone, address, location } = req.body;

        if (!ObjectId.isValid(userId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid user ID",
          });
        }

        const existingUser = await usersCollection.findOne({
          _id: new ObjectId(userId),
        });

        if (!existingUser) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        // Update user
        const updateData = {
          $set: {
            name: name || existingUser.name,
            phone: phone || existingUser.phone || "",
            address: address || existingUser.address || "",
            location: location || existingUser.location || "",
            updatedAt: new Date().toISOString(),
          },
        };

        const result = await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          updateData,
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        // Get updated user
        const updatedUser = await usersCollection.findOne({
          _id: new ObjectId(userId),
        });

        res.status(200).json({
          success: true,
          message: "Profile updated successfully",
          data: updatedUser,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to update profile",
          error: error.message,
        });
      }
    });
    app.post("/api/products", async (req, res) => {
      try {
        const {
          title,
          category,
          condition,
          price,
          stock,
          description,
          images,
          sellerInfo,
          status,
        } = req.body;

        if (!title || !category || !price || !sellerInfo) {
          return res.status(400).json({
            success: false,
            message: "Title, category, price, and seller info are required",
          });
        }

        const productData = {
          title,
          category,
          condition: condition || "Good",
          price: parseFloat(price),
          stock: parseInt(stock) || 1,
          description: description || "",
          images: images || [],
          sellerInfo: {
            userId: sellerInfo.userId,
            name: sellerInfo.name,
            email: sellerInfo.email,
            phone: sellerInfo.phone || "",
          },
          status: status || "available",
          averageRating: 0,
          totalReviews: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const result = await productsCollection.insertOne(productData);

        res.status(201).json({
          success: true,
          message: "Product created successfully",
          data: {
            _id: result.insertedId,
            ...productData,
          },
        });
      } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({
          success: false,
          message: "Failed to create product",
          error: error.message,
        });
      }
    });
    // SELLER API

    // Get seller's products
    app.get("/api/seller/products/:userId", async (req, res) => {
      try {
        const { userId } = req.params;

        const products = await productsCollection
          .find({ "sellerInfo.userId": userId })
          .sort({ createdAt: -1 })
          .toArray();

        res.status(200).json({
          success: true,
          data: products,
        });
      } catch (error) {
        console.error("Error fetching seller products:", error);
        res.status(500).json({
          success: false,
          message: "Failed to fetch products",
          error: error.message,
        });
      }
    });

    // Get seller's orders
    app.get("/api/seller/orders/:userId", async (req, res) => {
      try {
        const { userId } = req.params;

        const orders = await ordersCollection
          .find({ sellerId: userId })
          .sort({ createdAt: -1 })
          .toArray();

        const ordersWithDetails = await Promise.all(
          orders.map(async (order) => {
            const product = await productsCollection.findOne({
              _id: new ObjectId(order.productId),
            });
            const buyer = await usersCollection.findOne(
              { _id: new ObjectId(order.userId) },
              {
                projection: {
                  name: 1,
                  email: 1,
                  phone: 1,
                  address: 1,
                  location: 1,
                },
              },
            );
            return {
              ...order,
              productDetails: product || null,
              buyerInfo: buyer
                ? {
                    name: buyer.name,
                    email: buyer.email,
                    phone: buyer.phone || "N/A",
                    address: buyer.address || "N/A",
                    location: buyer.location || "N/A",
                  }
                : null,
            };
          }),
        );

        res.status(200).json({
          success: true,
          data: ordersWithDetails,
        });
      } catch (error) {
        console.error("Error fetching seller orders:", error);
        res.status(500).json({
          success: false,
          message: "Failed to fetch orders",
          error: error.message,
        });
      }
    });

    // Update product (PUT)
    app.put("/api/products/:id", async (req, res) => {
      try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            message: "Invalid product ID",
          });
        }

        const {
          title,
          category,
          condition,
          price,
          stock,
          description,
          images,
          status,
        } = req.body;

        // Check if product exists
        const existingProduct = await productsCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!existingProduct) {
          return res.status(404).json({
            success: false,
            message: "Product not found",
          });
        }

        const updateData = {
          $set: {
            title: title || existingProduct.title,
            category: category || existingProduct.category,
            condition: condition || existingProduct.condition || "Good",
            price: parseFloat(price) || existingProduct.price,
            stock:
              parseInt(stock) !== undefined
                ? parseInt(stock)
                : existingProduct.stock,
            description: description || existingProduct.description || "",
            images: images || existingProduct.images || [],
            status: status || existingProduct.status || "available",
            updatedAt: new Date().toISOString(),
          },
        };

        const result = await productsCollection.updateOne(
          { _id: new ObjectId(id) },
          updateData,
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            message: "Product not found",
          });
        }

        const updatedProduct = await productsCollection.findOne({
          _id: new ObjectId(id),
        });

        res.status(200).json({
          success: true,
          message: "Product updated successfully",
          data: updatedProduct,
        });
      } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({
          success: false,
          message: "Failed to update product",
          error: error.message,
        });
      }
    });

    // Delete product
    app.delete("/api/products/:id", async (req, res) => {
      try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            message: "Invalid product ID",
          });
        }

        const result = await productsCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({
            success: false,
            message: "Product not found",
          });
        }

        res.status(200).json({
          success: true,
          message: "Product deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({
          success: false,
          message: "Failed to delete product",
          error: error.message,
        });
      }
    });
    // Get seller stats
    app.get("/api/seller/stats/:userId", async (req, res) => {
      try {
        const { userId } = req.params;

        const totalProducts = await productsCollection.countDocuments({
          "sellerInfo.userId": userId,
        });

        const orders = await ordersCollection
          .find({ sellerId: userId })
          .toArray();

        const totalOrders = orders.length;
        const completedOrders = orders.filter(
          (o) => o.orderStatus === "delivered",
        ).length;
        const pendingOrders = orders.filter(
          (o) => o.orderStatus === "pending" || o.orderStatus === "confirmed",
        ).length;
        const totalRevenue = orders
          .filter((o) => o.orderStatus === "delivered")
          .reduce((sum, o) => sum + o.totalAmount, 0);

        res.status(200).json({
          success: true,
          data: {
            totalProducts,
            totalOrders,
            completedOrders,
            pendingOrders,
            totalRevenue,
          },
        });
      } catch (error) {
        console.error("Error fetching seller stats:", error);
        res.status(500).json({
          success: false,
          message: "Failed to fetch stats",
          error: error.message,
        });
      }
    });

    // Update order status (for seller)
    app.patch("/api/seller/orders/:orderId/status", async (req, res) => {
      try {
        const { orderId } = req.params;
        const { status, sellerId } = req.body;

        const validStatuses = [
          "pending",
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
        ];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            message: "Invalid status",
          });
        }

        const order = await ordersCollection.findOne({
          _id: new ObjectId(orderId),
          sellerId: sellerId,
        });

        if (!order) {
          return res.status(404).json({
            success: false,
            message: "Order not found",
          });
        }

        await ordersCollection.updateOne(
          { _id: new ObjectId(orderId) },
          {
            $set: {
              orderStatus: status,
              updatedAt: new Date().toISOString(),
            },
          },
        );

        res.status(200).json({
          success: true,
          message: "Order status updated successfully",
        });
      } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({
          success: false,
          message: "Failed to update order status",
          error: error.message,
        });
      }
    });

    // ADMIN API
    //get admin stats
    app.get("/api/admin/stats", async (req, res) => {
  try {
    const totalUsers = await usersCollection.countDocuments() || 0;
    const totalProducts = await productsCollection.countDocuments() || 0;
    const totalOrders = await ordersCollection.countDocuments() || 0;
    
    let totalRevenue = 0;
    try {
      const deliveredOrders = await ordersCollection.find({ orderStatus: "delivered" }).toArray();
      if (deliveredOrders && deliveredOrders.length > 0) {
        totalRevenue = deliveredOrders.reduce((sum, o) => {
          const amount = o.totalAmount || 0;
          return sum + (typeof amount === 'number' ? amount : 0);
        }, 0);
      }
    } catch (e) {
      console.log("Revenue calculation skipped:", e.message);
    }

    let pendingOrders = 0;
    try {
      pendingOrders = await ordersCollection.countDocuments({ 
        orderStatus: { $in: ["pending", "confirmed"] } 
      }) || 0;
    } catch (e) {
      console.log("Pending orders count skipped:", e.message);
    }


    let activeUsersCount = 0;
    try {
      const activeUsers = await ordersCollection.distinct("userId");
      activeUsersCount = activeUsers ? activeUsers.length : 0;
      console.log("Active users (distinct):", activeUsersCount);
      console.log("Distinct userIds:", activeUsers);
    } catch (e) {
      console.error("Error getting active users:", e.message);
      

      try {
        const result = await ordersCollection.aggregate([
          { $group: { _id: "$userId" } },
          { $count: "total" }
        ]).toArray();
        activeUsersCount = result.length > 0 ? result[0].total : 0;
        console.log("Active users (aggregate fallback):", activeUsersCount);
      } catch (e2) {
        console.error("Aggregate also failed:", e2.message);
        activeUsersCount = 0;
      }
    }

    console.log("Admin Stats Summary:", {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      activeUsersCount
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        activeUsersCount,
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
      error: error.message,
    });
  }
});
    // Get all users (for admin)
    app.get("/api/admin/users", async (req, res) => {
      try {
        const users = await usersCollection
          .find({})
          .sort({ createdAt: -1 })
          .toArray();

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

    // Update user status (block/unblock)
    app.patch("/api/admin/users/:userId/status", async (req, res) => {
      try {
        const { userId } = req.params;
        const { isBlocked } = req.body;

        if (!ObjectId.isValid(userId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid user ID",
          });
        }

        const result = await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          {
            $set: {
              isBlocked: isBlocked,
              updatedAt: new Date().toISOString(),
            },
          },
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        res.status(200).json({
          success: true,
          message: isBlocked
            ? "User blocked successfully"
            : "User unblocked successfully",
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to update user status",
          error: error.message,
        });
      }
    });

app.patch("/api/admin/users/:userId/status", async (req, res) => {
  try {
    const { userId } = req.params;
    const { isBlocked, role } = req.body;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }


    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

 
    if (user.role === "admin" && role && role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot change admin role",
      });
    }

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (isBlocked !== undefined) {
      updateData.isBlocked = isBlocked;
    }

    if (role) {
      updateData.role = role;
    }

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
});

    // Delete user (admin)
    app.delete("/api/admin/users/:userId", async (req, res) => {
      try {
        const { userId } = req.params;

        if (!ObjectId.isValid(userId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid user ID",
          });
        }

        // Check if user is admin
        const user = await usersCollection.findOne({
          _id: new ObjectId(userId),
        });
        if (user?.role === "admin") {
          return res.status(403).json({
            success: false,
            message: "Cannot delete admin user",
          });
        }

        const result = await usersCollection.deleteOne({
          _id: new ObjectId(userId),
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        res.status(200).json({
          success: true,
          message: "User deleted successfully",
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to delete user",
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
