// user.model.js

const pool = require('./database'); // Assuming you have a database connection pool set up

class User {
  static async create({ username, email, password, shipping_address }) {
    try {
      const newUser = await pool.query(
        'INSERT INTO users (username, email, password, shipping_address) VALUES ($1, $2, $3, $4) RETURNING *',
        [username, email, password, shipping_address]
      );
      return newUser.rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  static async findByUsername(username) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByCredentials(username, password) {
    try {
      const user = await User.findByUsername(username);
      if (!user) {
        return null; // User not found
      }

      // Check if the provided password matches the user's password
      if (password !== user.password) {
        return null; // Incorrect password
      }

      return user;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;