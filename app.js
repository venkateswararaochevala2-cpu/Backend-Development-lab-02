const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, 'books.db');

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(PORT, () => {
      console.log(`Server Running at http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// Root / Welcome Route
app.get('/', (request, response) => {
  response.send(
    '<h1>Lab 02: SQLite Database and CRUD Routes</h1>' +
    '<p><strong>Student:</strong> CHEVALA VENKATESWARARAO</p>' +
    '<p><strong>Registration Number:</strong> 252U1R1058</p>' +
    '<p><strong>Section:</strong> CSE-2A</p>' +
    '<p>Access the API at <a href="/books/">/books/</a></p>'
  );
});

// Route 1: GET All Books
app.get('/books/', async (request, response) => {
  try {
    const getBooksQuery = `
      SELECT
        *
      FROM
        book;
    `;
    const booksArray = await db.all(getBooksQuery);
    response.status(200).json(booksArray);
  } catch (error) {
    response.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route 2: GET Book by ID
app.get('/books/:bookId/', async (request, response) => {
  try {
    const { bookId } = request.params;
    const getBookQuery = `
      SELECT
        *
      FROM
        book
      WHERE
        id = ?;
    `;
    const book = await db.get(getBookQuery, [bookId]);
    if (!book) {
      return response.status(404).json({ error: 'Book not found' });
    }
    response.status(200).json(book);
  } catch (error) {
    response.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route 3: POST (Add) Book
app.post('/books/', async (request, response) => {
  try {
    const { title, author, price, pages } = request.body;

    if (!title || !author || price === undefined || pages === undefined) {
      return response.status(400).json({ error: 'All fields (title, author, price, pages) are required' });
    }

    if (typeof price !== 'number' || typeof pages !== 'number' || price < 0 || pages <= 0) {
      return response.status(400).json({ error: 'Price must be a non-negative number and pages must be a positive integer' });
    }

    const addBookQuery = `
      INSERT INTO
        book (title, author, price, pages)
      VALUES
        (?, ?, ?, ?);
    `;
    const result = await db.run(addBookQuery, [title, author, price, pages]);
    response.status(201).json({
      message: 'Book created successfully',
      bookId: result.lastID,
    });
  } catch (error) {
    response.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route 4: PUT (Update) Book
app.put('/books/:bookId/', async (request, response) => {
  try {
    const { bookId } = request.params;
    const { title, author, price, pages } = request.body;

    if (!title || !author || price === undefined || pages === undefined) {
      return response.status(400).json({ error: 'All fields (title, author, price, pages) are required' });
    }

    if (typeof price !== 'number' || typeof pages !== 'number' || price < 0 || pages <= 0) {
      return response.status(400).json({ error: 'Price must be a non-negative number and pages must be a positive integer' });
    }

    const updateBookQuery = `
      UPDATE
        book
      SET
        title = ?,
        author = ?,
        price = ?,
        pages = ?
      WHERE
        id = ?;
    `;
    const result = await db.run(updateBookQuery, [title, author, price, pages, bookId]);
    if (result.changes === 0) {
      return response.status(404).json({ error: 'Book not found' });
    }
    response.status(200).json({ message: 'Book updated successfully' });
  } catch (error) {
    response.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route 5: DELETE Book
app.delete('/books/:bookId/', async (request, response) => {
  try {
    const { bookId } = request.params;
    const deleteBookQuery = `
      DELETE FROM
        book
      WHERE
        id = ?;
    `;
    const result = await db.run(deleteBookQuery, [bookId]);
    if (result.changes === 0) {
      return response.status(404).json({ error: 'Book not found' });
    }
    response.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    response.status(500).json({ error: 'Internal Server Error' });
  }
});

// 404 Handler for undefined routes
app.use((request, response) => {
  response.status(404).json({
    error: 'Not Found',
    message: `Cannot ${request.method} ${request.url}`,
  });
});

module.exports = app;
