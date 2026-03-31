import request from "supertest";
import app from "../src/app";

describe("Health Check", () => {
  it("GET /api should return 404 (or appropriate response depending on root)", async () => {
    const res = await request(app).get("/api/health-check-non-existent");
    // Since we don't know the exact routes, we expect 404 for a random route
    expect(res.statusCode).toBe(404);
  });
  
  // Test Swagger
  it("GET /api-docs should return 200", async () => {
    const res = await request(app).get("/api-docs/");
    // Swagger UI redirects or returns HTML
    expect(res.statusCode).toBeLessThan(400); 
  });
});
