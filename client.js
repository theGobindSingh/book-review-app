const axios = require("axios");

const BASE_URL = "http://localhost:5000";

// Task 10: Get all books – Using async callback function
function getAllBooks(callback) {
  axios
    .get(BASE_URL + "/")
    .then((response) => callback(null, response.data))
    .catch((error) => callback(error, null));
}

// Task 11: Search by ISBN – Using Promises
function searchByISBN(isbn) {
  return axios
    .get(BASE_URL + "/isbn/" + isbn)
    .then((response) => response.data);
}

// Task 12: Search by Author
async function searchByAuthor(author) {
  try {
    const response = await axios.get(BASE_URL + "/author/" + encodeURIComponent(author));
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Task 13: Search by Title
async function searchByTitle(title) {
  try {
    const response = await axios.get(BASE_URL + "/title/" + encodeURIComponent(title));
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Run all tasks and print results
(async () => {
  console.log("============================================");
  console.log("BOOK REVIEW APPLICATION - NODE.JS CLIENT");
  console.log("============================================\n");

  // Task 10
  console.log("--- Task 10: Get all books (async callback) ---");
  getAllBooks((err, data) => {
    if (err) {
      console.error("Error:", err.message);
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
    console.log();

    // Task 11
    console.log("--- Task 11: Search by ISBN (Promises) ---");
    searchByISBN(1)
      .then((data) => {
        console.log(JSON.stringify(data, null, 2));
        console.log();

        // Task 12
        console.log("--- Task 12: Search by Author ---");
        return searchByAuthor("Jane Austen");
      })
      .then((data) => {
        console.log(JSON.stringify(data, null, 2));
        console.log();

        // Task 13
        console.log("--- Task 13: Search by Title ---");
        return searchByTitle("Things Fall Apart");
      })
      .then((data) => {
        console.log(JSON.stringify(data, null, 2));
        console.log();
        console.log("============================================");
        console.log("All tasks completed successfully!");
        console.log("============================================");
      })
      .catch((err) => {
        console.error("Error:", err.message);
      });
  });
})();
