const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const books = require("./booksdb.js");

const app = express();
const PORT = 5000;
const JWT_SECRET = "fingerprint_customer_secret_key_12345";

app.use(express.json());
app.use(
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

const users = [];

// --- Public Routes ---

// Task 1: Get all books
app.get("/", (req, res) => {
  res.json(books);
});

// Task 2: Get book by ISBN
app.get("/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    res.json(book);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// Task 3: Get books by author
app.get("/author/:author", (req, res) => {
  const author = req.params.author.toLowerCase();
  const result = Object.entries(books)
    .filter(([, book]) => book.author.toLowerCase().includes(author))
    .map(([isbn, book]) => ({ isbn, author: book.author, title: book.title, reviews: book.reviews }));
  res.json(result);
});

// Task 4: Get books by title
app.get("/title/:title", (req, res) => {
  const title = req.params.title.toLowerCase();
  const result = Object.entries(books)
    .filter(([, book]) => book.title.toLowerCase().includes(title))
    .map(([isbn, book]) => ({ isbn, author: book.author, title: book.title, reviews: book.reviews }));
  res.json(result);
});

// Task 5: Get book review
app.get("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    res.json(book.reviews);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// --- Async/Promise Routes ---

// Task 10 variant: Get all books using async callback
app.get("/async", async (req, res) => {
  const getAllBooks = () =>
    new Promise((resolve) => {
      resolve(books);
    });
  const result = await getAllBooks();
  res.json(result);
});

// Task 11 variant: Get book by ISBN using Promises
app.get("/isbn-promise/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) resolve(book);
    else reject(new Error("Book not found"));
  })
    .then((book) => res.json(book))
    .catch((err) => res.status(404).json({ message: err.message }));
});

// Task 12 variant: Get books by author using async/await
app.get("/author-async/:author", async (req, res) => {
  const author = req.params.author.toLowerCase();
  const findBooksByAuthor = () =>
    new Promise((resolve) => {
      const result = Object.entries(books)
        .filter(([, book]) => book.author.toLowerCase().includes(author))
        .map(([isbn, book]) => ({ isbn, author: book.author, title: book.title, reviews: book.reviews }));
      resolve(result);
    });
  const result = await findBooksByAuthor();
  res.json(result);
});

// Task 13 variant: Get books by title using Promises
app.get("/title-promise/:title", (req, res) => {
  const title = req.params.title.toLowerCase();
  new Promise((resolve) => {
    const result = Object.entries(books)
      .filter(([, book]) => book.title.toLowerCase().includes(title))
      .map(([isbn, book]) => ({ isbn, author: book.author, title: book.title, reviews: book.reviews }));
    resolve(result);
  }).then((result) => res.json(result));
});

// --- Auth Routes ---

// Task 6: Register
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }
  const exists = users.find((u) => u.username === username);
  if (exists) {
    return res.status(400).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Task 7: Login
app.post("/customer/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }
  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
  req.session.authorization = { token };
  return res.status(200).json({ message: "Login successful", token });
});

// Auth middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(403).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Failed to authenticate token" });
    }
    req.user = decoded;
    next();
  });
};

// Task 8: Add/modify a book review
app.put("/customer/auth/review/:isbn", authMiddleware, (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const username = req.user.username;

  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  book.reviews[username] = review;
  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: book.reviews,
  });
});

// Task 9: Delete a book review
app.delete("/customer/auth/review/:isbn", authMiddleware, (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (!book.reviews[username]) {
    return res.status(404).json({ message: "Review not found for this user" });
  }
  delete book.reviews[username];
  return res.status(200).json({
    message: "Review deleted successfully",
    reviews: book.reviews,
  });
});

app.listen(PORT, () => {
  console.log(`Book Review API running on http://localhost:${PORT}`);
});
