import express from "express";
import MyDB from "../db/MyMongoDB.js";

const router = express.Router();

router.get("/listings/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;
  const query = {};
  console.log("🏡 Received request for /api/listings", {
    page,
    pageSize,
    query,
  });

  try {
    const listings = await MyDB.getListings({ query, pageSize, page });
    res.json({
      listings,
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: "Internal Server Error", listings: [] });
  }
});

export default router;
