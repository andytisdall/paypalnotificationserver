import app from "../../../../index";
import request from "supertest";

it("gets restaurants", async () => {
  const res = await request(app).get("/api/d4j/restaurants").expect(200);
  expect(res.body.map((r: { name: string }) => r.name)).toContain(
    "Tacos Oscar",
  );
});

it("gets cocktails", async () => {
  const res = await request(app).get("/api/d4j/contest/cocktails").expect(200);
  expect(res.body).toHaveLength(14);
});
