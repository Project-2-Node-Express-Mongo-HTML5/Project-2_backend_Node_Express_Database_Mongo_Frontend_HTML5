import express from "express";
import request from "supertest";
import listingsRouter from "../../routes/listings.js";
import * as MyMongoDBModule from "../../db/MyMongoDB.js";

describe("Listings API Route", () => {
  let app;
  let getListingsSpy;

  beforeEach(() => {
    // Create a fresh Express app for each test
    app = express();
    app.use(express.json());
    app.use("/api", listingsRouter);

    // Spy on the getListings method
    getListingsSpy = jest
      .spyOn(MyMongoDBModule.default, "getListings")
      .mockResolvedValue([]);
  });

  afterEach(() => {
    // Restore the original implementation
    getListingsSpy.mockRestore();
  });

  describe("GET /api/listings/", () => {
    it("should return 200 with listings array on success", async () => {
      // Arrange
      const mockListings = [
        { title: "Cozy Studio", address: "123 Main St", price: 1200 },
        { title: "Spacious 2BR", address: "456 Oak Ave", price: 1800 },
      ];

      getListingsSpy.mockResolvedValue(mockListings);

      // Act
      const response = await request(app).get("/api/listings/");

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("listings");
      expect(response.body.listings).toEqual(mockListings);
      expect(getListingsSpy).toHaveBeenCalledTimes(1);
    });

    it("should use default pagination values when not provided", async () => {
      // Arrange
      getListingsSpy.mockResolvedValue([]);

      // Act
      await request(app).get("/api/listings/");

      // Assert
      expect(getListingsSpy).toHaveBeenCalledWith({
        query: {},
        pageSize: 20,
        page: 1,
      });
    });

    it("should parse and use custom page parameter", async () => {
      // Arrange
      getListingsSpy.mockResolvedValue([]);

      // Act
      await request(app).get("/api/listings/").query({ page: 3 });

      // Assert
      expect(getListingsSpy).toHaveBeenCalledWith({
        query: {},
        pageSize: 20,
        page: 3,
      });
    });

    it("should parse and use custom pageSize parameter", async () => {
      // Arrange
      getListingsSpy.mockResolvedValue([]);

      // Act
      await request(app).get("/api/listings/").query({ pageSize: 50 });

      // Assert
      expect(getListingsSpy).toHaveBeenCalledWith({
        query: {},
        pageSize: 50,
        page: 1,
      });
    });

    it("should handle both page and pageSize parameters together", async () => {
      // Arrange
      getListingsSpy.mockResolvedValue([]);

      // Act
      await request(app).get("/api/listings/").query({ page: 2, pageSize: 30 });

      // Assert
      expect(getListingsSpy).toHaveBeenCalledWith({
        query: {},
        pageSize: 30,
        page: 2,
      });
    });

    it("should handle invalid page parameter and default to 1", async () => {
      // Arrange
      getListingsSpy.mockResolvedValue([]);

      // Act
      await request(app).get("/api/listings/").query({ page: "invalid" });

      // Assert
      expect(getListingsSpy).toHaveBeenCalledWith({
        query: {},
        pageSize: 20,
        page: 1, // NaN becomes 1 due to || operator
      });
    });

    it("should handle invalid pageSize parameter and default to 20", async () => {
      // Arrange
      getListingsSpy.mockResolvedValue([]);

      // Act
      await request(app).get("/api/listings/").query({ pageSize: "invalid" });

      // Assert
      expect(getListingsSpy).toHaveBeenCalledWith({
        query: {},
        pageSize: 20, // NaN becomes 20 due to || operator
        page: 1,
      });
    });

    it("should return 500 when database throws an error", async () => {
      // Arrange
      const dbError = new Error("Database connection failed");
      getListingsSpy.mockRejectedValue(dbError);

      // Act
      const response = await request(app).get("/api/listings/");

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error", "Internal Server Error");
      expect(response.body).toHaveProperty("listings", []);
    });

    it("should return empty listings array on database error", async () => {
      // Arrange
      getListingsSpy.mockRejectedValue(new Error("Network timeout"));

      // Act
      const response = await request(app).get("/api/listings/");

      // Assert
      expect(response.body.listings).toEqual([]);
    });

    it("should handle empty listings array from database", async () => {
      // Arrange
      getListingsSpy.mockResolvedValue([]);

      // Act
      const response = await request(app).get("/api/listings/");

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.listings).toEqual([]);
    });

    it("should handle large page numbers", async () => {
      // Arrange
      getListingsSpy.mockResolvedValue([]);

      // Act
      await request(app).get("/api/listings/").query({ page: 9999 });

      // Assert
      expect(getListingsSpy).toHaveBeenCalledWith({
        query: {},
        pageSize: 20,
        page: 9999,
      });
    });

    it("should handle page=0 and convert to default", async () => {
      // Arrange
      getListingsSpy.mockResolvedValue([]);

      // Act
      await request(app).get("/api/listings/").query({ page: 0 });

      // Assert
      expect(getListingsSpy).toHaveBeenCalledWith({
        query: {},
        pageSize: 20,
        page: 1, // 0 is falsy, so || operator returns 1
      });
    });
  });
});
