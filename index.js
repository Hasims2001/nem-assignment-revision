const express = require("express");
const cors = require("cors");
const { connectToDB } = require("./db");
const { bookRouter } = require("./Routers/BookRouter");
const { userRouter } = require("./Routers/UserRouter");
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require("swagger-jsdoc");


const app = express();
app.use(express.json());
app.use(cors());

const swaggerOptions = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Book App",
      version: "1.0.0",
      
    },
    server: [
      {
        url : `http://localhost:8080`
      }
    ]
  },
  apis: ["./Routers/*js"],
}
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/user", userRouter);
app.use("/books", bookRouter);
app.listen(8080, async () => {
  try {
    await connectToDB;
    console.log("Server is runing...");
  } catch (error) {
    throw new Error(error);
  }
});
module.exports = {
  app
}