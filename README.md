<p align="center">
    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png" alt="JavaScript" width="100" style="margin-right: 20px;">
    <img src="https://sequelize.org/img/logo.svg" alt="Sequelize" width="100" style="margin-right: 20px;">
    <img src="https://nodejs.org/static/images/logo.svg" alt="Node.js" width="100">
</p>

# Overview
This project is a Node.js application that connects to a PostgreSQL database using Sequelize ORM. It provides APIs for user management, including fetching user details, updating user balance, and resetting user balance. The application is designed for high performance and reliability, employing transactions and error handling to ensure data integrity.

## Features
- Fetch all users
- Update user balance with atomic transactions
- Reset user balance to a default value
- Error handling middleware for graceful error responses

## Installation

1. **Clone the repository:**
    ```sh
    git clone https://github.com/yourusername/your-repo.git
    cd your-repo
    ```

2. **Install dependencies:**
    ```sh
    npm install
    ```

3. **Create a `.env` file:**
    ```env
    DIALECT=postgres
    DB_HOST=**************
    DB_PORT=5432
    DB_USERNAME=**************
    DB_PASSWORD=**************
    DB_NAME=**************
    ```

4. **Start the application:**
    ```sh
    npm start
    ```

## Usage

### Fetch All Users
- **Endpoint:** `/users`
- **Method:** `GET`

### Update User Balance
- **Endpoint:** `/users/:userId/balance`
- **Method:** `PUT`
- **Body Parameters:**
  - `amount` (number) - The amount to be added to the user's balance

### Reset User Balance
- **Endpoint:** `/reset`
- **Method:** `GET`