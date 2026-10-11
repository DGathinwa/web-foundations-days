Markdown
# Library REST API Design

This document outlines the RESTful API design for managing books in the library system.

## Endpoints

### 1. List All Books (or Filter by Author)
- **Method:** `GET`
- **Path:** `/books` (supports query parameters, e.g., `/books?author=Jane+Doe`)
- **Description:** Retrieves a list of all books in the library catalog, with optional filtering by author.
- **Request Body:** None
- **Success Status Code:** `200 OK`

### 2. Get One Book
- **Method:** `GET`
- **Path:** `/books/{id}`
- **Description:** Retrieves detailed information for a single book specified by its unique ID.
- **Request Body:** None
- **Success Status Code:** `200 OK`

### 3. Create a Book
- **Method:** `POST`
- **Path:** `/books`
- **Description:** Adds a new book to the library database.
- **Request Body Example:**
json
{
"title": "Clean Code",
"author": "Robert C. Martin",
"publishedYear": 2008,
"isbn": "978-0132350884"
}

- **Success Status Code:** `201 Created`

### 4. Update a Book (Full Replacement)
- **Method:** `PUT`
- **Path:** `/books/{id}`
- **Description:** Completely replaces or updates an existing book record by its ID.
- **Request Body Example:**

json
{
"title": "Clean Code: A Handbook of Agile Software Craftsmanship",
"author": "Robert C. Martin",
"publishedYear": 2008,
"isbn": "978-0132350884"
}

- **Success Status Code:** `200 OK`

### 5. Delete a Book
- **Method:** `DELETE`
- **Path:** `/books/{id}`
- **Description:** Removes a book from the library catalog by its ID.
- **Request Body:** None
- **Success Status Code:** `204 No Content`

---

## Error Codes & Examples

### 400 Bad Request
- **When it happens:** Triggered when the client sends malformed JSON or omits required fields (e.g., trying to `POST` a book without a title).
- **Example Response:**

json
{
"error": "Bad Request",
"message": "The 'title' field is required and cannot be empty."
}


### 404 Not Found
- **When it happens:** Triggered when the requested book ID does not exist in the database (e.g., attempting to `GET`, `PUT`, or `DELETE` `/books/9999`).
- **Example Response:**

json
{
"error": "Not Found",
"message": "Book with ID 9999 was not found."
}