# Test Examples & Patterns

This file contains common testing patterns you can copy and adapt for other routes and modules.

## Pattern 1: Testing Express Routes

### Basic GET Route Test
```javascript
import express from "express";
import request from "supertest";
import yourRouter from "../../routes/your-route.js";

describe("Your Route", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api", yourRouter);
  });

  it("should return 200 on success", async () => {
    const response = await request(app).get("/api/your-endpoint");
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
  });
});
```

### POST Route with Body
```javascript
it("should create a new resource", async () => {
  const newData = { title: "Test", price: 1000 };
  
  const response = await request(app)
    .post("/api/listings")
    .send(newData)
    .set("Content-Type", "application/json");
  
  expect(response.status).toBe(201);
  expect(response.body.title).toBe("Test");
});
```

### Testing Query Parameters
```javascript
it("should handle query parameters", async () => {
  const response = await request(app)
    .get("/api/listings")
    .query({ page: 2, limit: 10, search: "apartment" });
  
  expect(response.status).toBe(200);
  // Verify query params were used correctly
});
```

### Testing Route Parameters
```javascript
it("should get listing by ID", async () => {
  const response = await request(app).get("/api/listings/123");
  
  expect(response.status).toBe(200);
  expect(response.body.id).toBe("123");
});
```

## Pattern 2: Mocking MongoDB

### Method 1: Spy on Module (Recommended)
```javascript
import * as MyMongoDBModule from "../../db/MyMongoDB.js";

describe("With MongoDB Mock", () => {
  let getListingsSpy;

  beforeEach(() => {
    getListingsSpy = jest
      .spyOn(MyMongoDBModule.default, "getListings")
      .mockResolvedValue([]);
  });

  afterEach(() => {
    getListingsSpy.mockRestore();
  });

  it("should call MongoDB with correct params", async () => {
    await request(app).get("/api/listings?page=2");
    
    expect(getListingsSpy).toHaveBeenCalledWith({
      query: {},
      page: 2,
      pageSize: 20,
    });
  });
});
```

### Method 2: Mock Different Return Values
```javascript
it("should handle different data scenarios", async () => {
  // Success case
  getListingsSpy.mockResolvedValue([{ id: 1 }]);
  let response = await request(app).get("/api/listings");
  expect(response.body.listings).toHaveLength(1);

  // Empty case
  getListingsSpy.mockResolvedValue([]);
  response = await request(app).get("/api/listings");
  expect(response.body.listings).toHaveLength(0);
});
```

### Method 3: Mock Errors
```javascript
it("should handle database errors", async () => {
  const error = new Error("Connection timeout");
  getListingsSpy.mockRejectedValue(error);
  
  const response = await request(app).get("/api/listings");
  
  expect(response.status).toBe(500);
  expect(response.body.error).toBeDefined();
});
```

## Pattern 3: Testing with Different Data Types

### Testing Invalid Inputs
```javascript
describe("Input Validation", () => {
  it("should handle invalid page number", async () => {
    const response = await request(app)
      .get("/api/listings")
      .query({ page: "invalid" });
    
    // Should use default or return 400
    expect(response.status).toBe(200); // or 400 for validation error
  });

  it("should handle negative numbers", async () => {
    const response = await request(app)
      .get("/api/listings")
      .query({ page: -1 });
    
    expect(response.status).toBe(400); // or handle gracefully
  });

  it("should handle very large numbers", async () => {
    const response = await request(app)
      .get("/api/listings")
      .query({ page: 999999999 });
    
    expect(response.status).toBe(200);
  });
});
```

### Testing Edge Cases
```javascript
describe("Edge Cases", () => {
  it("should handle page=0", async () => {
    const response = await request(app)
      .get("/api/listings")
      .query({ page: 0 });
    
    expect(getListingsSpy).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1 })
    );
  });

  it("should handle missing required fields", async () => {
    const response = await request(app)
      .post("/api/listings")
      .send({});
    
    expect(response.status).toBe(400);
  });
});
```

## Pattern 4: Async/Await Testing

### Standard Async Test
```javascript
it("should handle async operations", async () => {
  const response = await request(app).get("/api/listings");
  expect(response.status).toBe(200);
});
```

### Testing Promises
```javascript
it("should handle promises", () => {
  return request(app)
    .get("/api/listings")
    .then((response) => {
      expect(response.status).toBe(200);
    });
});
```

### Testing with Done Callback (Legacy)
```javascript
it("should work with done callback", (done) => {
  request(app)
    .get("/api/listings")
    .end((err, response) => {
      expect(response.status).toBe(200);
      done();
    });
});
```

## Pattern 5: Test Organization

### Nested Describe Blocks
```javascript
describe("Listings API", () => {
  describe("GET /api/listings", () => {
    describe("Success Cases", () => {
      it("should return listings", async () => {
        // test
      });
    });

    describe("Error Cases", () => {
      it("should handle errors", async () => {
        // test
      });
    });

    describe("Validation", () => {
      it("should validate input", async () => {
        // test
      });
    });
  });

  describe("POST /api/listings", () => {
    // POST tests
  });
});
```

### Using test.each for Multiple Scenarios
```javascript
describe("Pagination", () => {
  test.each([
    [1, 20],
    [2, 10],
    [5, 50],
    [100, 5],
  ])("should handle page=%i and pageSize=%i", async (page, pageSize) => {
    await request(app)
      .get("/api/listings")
      .query({ page, pageSize });
    
    expect(getListingsSpy).toHaveBeenCalledWith(
      expect.objectContaining({ page, pageSize })
    );
  });
});
```

## Pattern 6: Setup and Teardown

### beforeEach / afterEach
```javascript
describe("With Setup and Teardown", () => {
  let app;
  let mockDB;

  beforeEach(() => {
    // Runs before EACH test
    app = express();
    mockDB = jest.fn();
  });

  afterEach(() => {
    // Runs after EACH test
    jest.clearAllMocks();
  });

  // tests...
});
```

### beforeAll / afterAll
```javascript
describe("With Expensive Setup", () => {
  beforeAll(async () => {
    // Runs ONCE before all tests
    await setupTestDatabase();
  });

  afterAll(async () => {
    // Runs ONCE after all tests
    await cleanupTestDatabase();
  });

  // tests...
});
```

## Pattern 7: Jest Matchers

### Common Assertions
```javascript
// Equality
expect(value).toBe(10);                    // Strict equality
expect(value).toEqual({ a: 1 });          // Deep equality

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeGreaterThanOrEqual(3.5);
expect(value).toBeLessThan(5);
expect(value).toBeCloseTo(0.3); // Floating point

// Strings
expect(string).toMatch(/pattern/);
expect(string).toContain("substring");

// Arrays/Iterables
expect(array).toContain("item");
expect(array).toHaveLength(3);
expect(array).toContainEqual({ id: 1 });

// Objects
expect(object).toHaveProperty("key");
expect(object).toHaveProperty("key", "value");
expect(object).toMatchObject({ a: 1 });

// Exceptions
expect(() => fn()).toThrow();
expect(() => fn()).toThrow(Error);
expect(() => fn()).toThrow("error message");

// Functions
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(1);
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
expect(mockFn).toHaveBeenLastCalledWith(arg1);
```

### Custom Matchers for HTTP
```javascript
// Status codes
expect(response.status).toBe(200);
expect(response.status).toBeGreaterThanOrEqual(200);
expect(response.status).toBeLessThan(300);

// Headers
expect(response.headers["content-type"]).toMatch(/json/);

// Body
expect(response.body).toHaveProperty("data");
expect(response.body.data).toBeInstanceOf(Array);
```

## Pattern 8: Mock Functions

### Creating Mocks
```javascript
// Simple mock
const mockFn = jest.fn();

// Mock with return value
const mockFn = jest.fn().mockReturnValue(42);

// Mock with async return
const mockFn = jest.fn().mockResolvedValue({ data: [] });

// Mock with error
const mockFn = jest.fn().mockRejectedValue(new Error("Failed"));

// Mock with implementation
const mockFn = jest.fn((x) => x * 2);
```

### Verifying Mock Calls
```javascript
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith("arg");
expect(mockFn).toHaveBeenNthCalledWith(2, "second call");
expect(mockFn).toHaveBeenLastCalledWith("last call");

// Check call results
expect(mockFn.mock.results[0].value).toBe(42);
```

## Quick Reference: AAA Pattern

```javascript
it("descriptive test name", async () => {
  // 🔧 ARRANGE: Set up test data and conditions
  const testData = { /* ... */ };
  mockFn.mockResolvedValue(testData);

  // ⚡ ACT: Execute the code being tested
  const result = await request(app).get("/api/endpoint");

  // ✅ ASSERT: Verify the results
  expect(result.status).toBe(200);
  expect(result.body).toEqual(testData);
});
```

## Next: Adapt These Patterns

1. Copy a pattern that matches your use case
2. Rename variables and endpoints
3. Adjust assertions for your logic
4. Run tests to verify
5. Add more edge cases as needed
