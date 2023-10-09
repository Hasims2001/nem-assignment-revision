const mongoose = require("mongoose");
const request = require("supertest");
const { app } = require("../index");
require("dotenv").config();

// beforeEach(async()=>{
//     await mongoose.connect(process.env.MONGOURL);
// })

describe("Express App Testing", () => {
  it("GET api/book -> should return first 5 books", async () => {
    const res = await request(app).get("/book");

    expect(res.statusCode).toBe(200);
    expect(res.body.issue).toBe(false);
    expect(res.body.page).toBe(1);
  });

  it("GET api/book?title=Hobbit -> should return book related to title", async () => {
    const res = await request(app).get("/book?title=Hobbit");

    expect(res.statusCode).toBe(200);
    expect(res.body.issue).toBe(false);
    expect(res.body.books[0].Title).toMatch(/Hobbit/);
  });

  it("GET api/book?author=John -> should return book related to title", async () => {
    const res = await request(app).get("/book?author=John");

    expect(res.statusCode).toBe(200);
    expect(res.body.issue).toBe(false);
    expect(res.body.books[0].Author).toMatch(/John/);
  });

  it("GET api/book/bookId -> should return book related to title", async () => {
    const res = await request(app).get("/book/651d68852683898d3bfab90c");

    expect(res.statusCode).toBe(200);
    expect(res.body.issue).toBe(false);
    expect(res.body.book.Title).toBe("Cooking Made Easy");
  });

  it("POST api/book -> (without token) should return error", async ()=>{
    const res = await request(app)
      .post("/book").send({
        Title: "Temp",
        Author: "Temp",
        Description: "Temp",
        ISBN: "Temp",
        PublishedDate: "Temp",
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.issue).toBe(true);
  })
  it("POST api/book -> should add book in database", async () => {
    const res = await request(app)
      .post("/book")
      .set(
       { auth:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTFlYjBjZTc0N2FjY2Y0ZDg1MDY3YTIiLCJlbWFpbCI6InRlbXBAZ21haWwuY29tIiwiaWF0IjoxNjk2NTEwMTcyfQ.yJr8sEY_inXtDL9_lpsi1c6bM1PbitJqZ5YOdXyHVsc"}
      )
      .send({
        Title: "Temp",
        Author: "Temp",
        Description: "Temp",
        ISBN: "Temp",
        PublishedDate: "Temp",
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.issue).toBe(false);
  });

  it("PUT api/book -> should update book in database", async () => {
    const res = await request(app)
      .put("/book/651d68852683898d3bfab90b")
      .set(
       { auth:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTFlYjBjZTc0N2FjY2Y0ZDg1MDY3YTIiLCJlbWFpbCI6InRlbXBAZ21haWwuY29tIiwiaWF0IjoxNjk2NTEwMTcyfQ.yJr8sEY_inXtDL9_lpsi1c6bM1PbitJqZ5YOdXyHVsc"}
      )
      .send({
        Title: "Temp",
        Author: "Temp",
        Description: "Temp",
        ISBN: "Temp",
        PublishedDate: "Temp",
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.issue).toBe(false);
    expect(res.body.book.Title).toBe("Temp");
  });
  it("DELETE api/book -> should delete the book", async () => {
    const res = await request(app).set(
      { auth:
       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTFlYjBjZTc0N2FjY2Y0ZDg1MDY3YTIiLCJlbWFpbCI6InRlbXBAZ21haWwuY29tIiwiaWF0IjoxNjk2NTEwMTcyfQ.yJr8sEY_inXtDL9_lpsi1c6bM1PbitJqZ5YOdXyHVsc"}
     ).delete("/book/651d68852683898d3bfab909");

    expect(res.statusCode).toBe(200);
    expect(res.body.issue).toBe(false);
  });


});



afterAll(async()=>{
    await mongoose.connection.close();
})
