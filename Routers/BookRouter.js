const express = require("express");
const { BookModel } = require("../model/BookModel");
const { auth } = require("../middlewares/auth.middleware");
const jwt = require("jsonwebtoken");

const bookRouter = express.Router();
/**
 * @swagger
 * components:
 *  schemas:
 *    Book:
 *      type: object
 *      properties:
 *        Title:
 *          type: string
 *        Author:
 *          type: string
 *        ISBN:
 *          type: string
 *        Description:
 *          type: string
 *        PublishedDate:
 *          type: string
 * 
 */

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Add a new book
 *     description: Add a new book to the collection.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Title:
 *                 type: string
 *               Author:
 *                 type: string
 *               ISBN:
 *                 type: string
 *               Description:
 *                 type: string
 *               PublishedDate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Book added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 issue:
 *                   type: boolean
 *                 msg:
 *                   type: string
 *                 book:
 *                   $ref: '#/components/schemas/Book'  
 *       400:
 *         description: Bad request, missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 issue:
 *                   type: boolean
 *                 msg:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 issue:
 *                   type: boolean
 *                 msg:
 *                   type: string
 */
bookRouter.post("/", auth, async (req, res) => {
  const { Title, Author, ISBN, Description, PublishedDate } = req.body;
  if (!Title || !Author || !ISBN || !Description || !ISBN || !PublishedDate) {
    res.send({ issue: true, msg: "all fields are required" });
  } else {
    try {
      let book = new BookModel({
        Title,
        Author,
        ISBN,
        Description,
        PublishedDate,
      });
      await book.save();
      res.send({ issue: false, msg: "book added!", book: book });
    } catch (error) {
      res.send({ issue: true, msg: error.message });
    }
  }
});
/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get a list of books
 *     description: Retrieve a list of books with optional filtering by title and author, and pagination.
 *     responses:
 *       200:
 *         description: Books retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 issue:
 *                   type: boolean
 *                 msg:
 *                   type: string
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 books:
 *                   type: array
 *                   items:
 *                       $ref: '#/components/schemas/Book'  
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 issue:
 *                   type: boolean
 *                 msg:
 *                   type: string
 */
bookRouter.get("/", async (req, res) => {
  const { title, author } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  try {
    let books;
    if (title !== undefined) {
      books = await BookModel.aggregate([
        {
          $match: {
            Title: { $regex: title, $options: "i" },
          },
        },
      ])
        .sort({ update_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
    } else if (author !== undefined) {
      books = await BookModel.aggregate([
        {
          $match: {
            Author: { $regex: author, $options: "i" },
          },
        },
      ])
        .sort({ update_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
    } else {
      books = await BookModel.find()
        .sort({ update_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
    }
    res.send({
      issue: false,
      msg: "books",
      page: page,
      limit: limit,
      books: books,
    });
  } catch (error) {
    res.send({ issue: true, msg: error.message });
  }
});

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get a single book by ID
 *     description: Retrieve a book by its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the book to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 issue:
 *                   type: boolean
 *                 msg:
 *                   type: string
 *                 book:
 *                   type: object
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 issue:
 *                   type: boolean
 *                 msg:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 issue:
 *                   type: boolean
 *                 msg:
 *                   type: string
 */
bookRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    let book = await BookModel.findOne({ _id: id });
    res.send({ issue: false, msg: "single book", book: book });
  } catch (error) {
    res.send({ issue: true, msg: error.message });
  }
});

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Update a book by ID
 *     description: Update a book's information using its unique ID.
 *     security:
 *       - BearerAuth: [] # Specify authentication security scheme if required
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the book to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Title:
 *                 type: string
 *               Author:
 *                 type: string
 *               ISBN:
 *                 type: string
 *               Description:
 *                 type: string
 *               PublishedDate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 issue:
 *                   type: boolean
 *                 msg:
 *                   type: string
 *                 book:
 *                   $ref: '#/components/schemas/Book'
 *       400:
 *         description: Bad request, missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 issue:
 *                   type: boolean
 *                 msg:
 *                   type: string
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 issue:
 *                   type: boolean
 *                 msg:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 issue:
 *                   type: boolean
 *                 msg:
 *                   type: string
 */
bookRouter.put("/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { Title, Author, ISBN, Description, PublishedDate } = req.body;
  if (!Title || !Author || !ISBN || !Description || !ISBN || !PublishedDate) {
    res.send({ issue: true, msg: "all fields are required" });
  } else {
    try {
      let book = await BookModel.findByIdAndUpdate({ _id: id }, req.body);
      res.send({ issue: false, msg: "updated book", book: book });
    } catch (error) {
      res.send({ issue: true, msg: error.message });
    }
  }
});

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete a book by ID
 *     description: Delete a book using its unique ID.
 *     security:
 *       - BearerAuth: [] # Specify authentication security scheme if required
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the book to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 issue:
 *                   type: boolean
 *                 msg:
 *                   type: string
 *                 book:
 *                   $ref: '#/components/schemas/Book' 
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 issue:
 *                   type: boolean
 *                 msg:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 issue:
 *                   type: boolean
 *                 msg:
 *                   type: string
 */
bookRouter.delete("/:id", auth, async (req, res) => {
  const { id } = req.params;
  try {
    let book = await BookModel.findByIdAndDelete({ _id: id });
    res.send({ issue: false, msg: "updated book", book: book });
  } catch (error) {
    res.send({ issue: true, msg: error.message });
  }
});

module.exports = {
  bookRouter,
};
