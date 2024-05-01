// server.js

// Import Express
const express = require('express');
const pool = require('./database');
const bodyParser = require('body-parser');
const User = require('./user.model'); 
const swaggerUi = require('swagger-ui-express'); // Add this line to import swaggerUi
const specs = require('./swagger');


// Create an instance of Express
const app = express();
app.use(bodyParser.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Define a port number
const PORT = process.env.PORT || 3002; // Use environment variable or port 3000 as default

// Define a route handler for the root URL
app.get('/', (req, res) => {
    // Execute the SQL query
    pool.query('SELECT NOW()', (err, queryResult) => {
      if (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
      } else {
        console.log('Query result:', queryResult.rows[0]);
        res.send('Query result: ' + queryResult.rows[0].now);
      }
    });
  });

// Authentication endpoints
app.post('/api/auth/register', (req, res) => {
    const { username, email, password, shipping_address } = req.body;
  
    // Validate request body
    if (!username || !email || !password || !shipping_address) {
      return res.status(400).json({ message: 'Username, email, password, and shipping address are required' });
    }
  
    // Logic to register a new user
    User.create({ username, email, password, shipping_address })
      .then(newUser => {
        res.status(201).json({ message: 'User registered successfully', user: newUser });
      })
      .catch(err => {
        console.error('Error registering user:', err);
        res.status(500).json({ message: 'Internal server error' });
      });
});
  
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Find user by credentials
      const user = await User.findByCredentials(username, password);
  
      // If user is not found or password is incorrect
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
  
      // If user is found and password is correct, return success response
      res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  
  app.post('/api/auth/logout', (req, res) => {
    // Logic to log out a user (assuming you're using sessions or JWT tokens)
    // This might involve destroying the session or invalidating the JWT token
    // Depending on your authentication strategy
    // For example, you might clear the session data or blacklist the token
    res.status(200).json({ message: 'Logout successful' });
  });
  

// Get all products
app.get('/api/products', async (req, res) => {
    try {
      const products = await pool.query('SELECT * FROM Products');
      res.json(products.rows);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Get a specific product by ID
  app.get('/api/products/:id', async (req, res) => {
    const productId = req.params.id;
    try {
      const product = await pool.query('SELECT * FROM Products WHERE product_id = $1', [productId]);
      if (product.rows.length === 0) {
        res.status(404).json({ error: 'Product not found' });
      } else {
        res.json(product.rows[0]);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Add a new product (admin only)
  app.post('/api/products', async (req, res) => {
    const { name, description, price, quantity_in_stock, category } = req.body;
    // Add validation for admin authentication
  
    try {
      const newProduct = await pool.query(
        'INSERT INTO Products (name, description, price, quantity_in_stock, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, description, price, quantity_in_stock, category]
      );
      res.status(201).json(newProduct.rows[0]);
    } catch (error) {
      console.error('Error adding product:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Update an existing product (admin only)
  app.put('/api/products/:id', async (req, res) => {
    const productId = req.params.id;
    const { name, description, price, quantity_in_stock, category } = req.body;
    // Add validation for admin authentication
  
    try {
      const updatedProduct = await pool.query(
        'UPDATE Products SET name = $1, description = $2, price = $3, quantity_in_stock = $4, category = $5 WHERE product_id = $6 RETURNING *',
        [name, description, price, quantity_in_stock, category, productId]
      );
      if (updatedProduct.rows.length === 0) {
        res.status(404).json({ error: 'Product not found' });
      } else {
        res.json(updatedProduct.rows[0]);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Delete a product (admin only)
  app.delete('/api/products/:id', async (req, res) => {
    const productId = req.params.id;
    // Add validation for admin authentication
  
    try {
      const deletedProduct = await pool.query('DELETE FROM Products WHERE product_id = $1 RETURNING *', [productId]);
      if (deletedProduct.rows.length === 0) {
        res.status(404).json({ error: 'Product not found' });
      } else {
        res.json({ message: 'Product deleted successfully' });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

// Get all users (admin only)
app.get('/api/users', async (req, res) => {
    // Add validation for admin authentication
    try {
      const users = await pool.query('SELECT * FROM Users');
      res.json(users.rows);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Get a specific user by ID (admin only)
  app.get('/api/users/:id', async (req, res) => {
    const userId = req.params.id;
    // Add validation for admin authentication
    try {
      const user = await pool.query('SELECT * FROM Users WHERE user_id = $1', [userId]);
      if (user.rows.length === 0) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.json(user.rows[0]);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Update a user's information (admin or user)
  app.put('/api/users/:id', async (req, res) => {
    const userId = req.params.id;
    const { username, email, password, shipping_address } = req.body;
    // Add validation for admin or user authentication
    try {
      const updatedUser = await pool.query(
        'UPDATE Users SET username = $1, email = $2, password = $3, shipping_address = $4 WHERE user_id = $5 RETURNING *',
        [username, email, password, shipping_address, userId]
      );
      if (updatedUser.rows.length === 0) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.json(updatedUser.rows[0]);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Delete a user (admin only)
  app.delete('/api/users/:id', async (req, res) => {
    const userId = req.params.id;
    // Add validation for admin authentication
    try {
      const deletedUser = await pool.query('DELETE FROM Users WHERE user_id = $1 RETURNING *', [userId]);
      if (deletedUser.rows.length === 0) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.json({ message: 'User deleted successfully' });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// Get a user's cart
app.get('/api/carts/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const userCart = await pool.query('SELECT * FROM Carts WHERE user_id = $1', [userId]);
    res.json(userCart.rows);
  } catch (error) {
    console.error('Error fetching user cart:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add a product to the user's cart
app.post('/api/carts/:userId/add', async (req, res) => {
  const userId = req.params.userId;
  const { product_id, quantity } = req.body;
  try {
    const newCartItem = await pool.query(
      'INSERT INTO Carts (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
      [userId, product_id, quantity]
    );
    res.status(201).json(newCartItem.rows[0]);
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Remove a product from the user's cart
app.post('/api/carts/:userId/remove', async (req, res) => {
  const userId = req.params.userId;
  const { product_id } = req.body;
  try {
    const deletedCartItem = await pool.query(
      'DELETE FROM Carts WHERE user_id = $1 AND product_id = $2 RETURNING *',
      [userId, product_id]
    );
    if (deletedCartItem.rows.length === 0) {
      res.status(404).json({ error: 'Product not found in user cart' });
    } else {
      res.json({ message: 'Product removed from cart successfully' });
    }
  } catch (error) {
    console.error('Error removing product from cart:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all orders for a user
app.get('/api/orders/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
      const userOrders = await pool.query('SELECT * FROM Orders WHERE user_id = $1', [userId]);
      res.json(userOrders.rows);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Place an order for the items in the user's cart
  app.post('/api/orders/:userId/place', async (req, res) => {
    const userId = req.params.userId;
    // Logic to place the order goes here
    try {
      // Retrieve the user's cart items from the database
      const userCartItems = await pool.query('SELECT * FROM Carts WHERE user_id = $1', [userId]);
      // Calculate the total price of the order based on the items in the cart
      const totalPrice = userCartItems.rows.reduce((acc, item) => acc + item.quantity * item.price, 0);
      // Insert a new order record into the database
      const newOrder = await pool.query('INSERT INTO Orders (user_id, total_price) VALUES ($1, $2) RETURNING *', [userId, totalPrice]);
      const orderId = newOrder.rows[0].order_id;
      // Insert individual order item records into the database for each item in the cart
      for (const item of userCartItems.rows) {
        await pool.query('INSERT INTO Order_Items (order_id, product_id, quantity) VALUES ($1, $2, $3)', [orderId, item.product_id, item.quantity]);
      }
      // Remove the items from the user's cart
      await pool.query('DELETE FROM Carts WHERE user_id = $1', [userId]);
      res.status(201).json({ message: 'Order placed successfully' });
    } catch (error) {
      console.error('Error placing order:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
// Admin operations endpoints (optional)
app.get('/api/admin/dashboard', async (req, res) => {
    try {
      // Example logic to retrieve dashboard data
      const userData = await pool.query('SELECT COUNT(*) AS total_users FROM Users');
      const productData = await pool.query('SELECT COUNT(*) AS total_products FROM Products');
      const orderData = await pool.query('SELECT COUNT(*) AS total_orders FROM Orders');
  
      const dashboardData = {
        totalUsers: userData.rows[0].total_users,
        totalProducts: productData.rows[0].total_products,
        totalOrders: orderData.rows[0].total_orders,
      };
  
      res.json(dashboardData);
    } catch (error) {
      console.error('Error retrieving dashboard data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

app.post('/api/admin/products', async (req, res) => {
    // Logic to add a new product (admin only)
    const { name, description, price, quantity_in_stock, category } = req.body;
    try {
      const newProduct = await pool.query('INSERT INTO Products (name, description, price, quantity_in_stock, category) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, description, price, quantity_in_stock, category]);
      res.status(201).json(newProduct.rows[0]);
    } catch (error) {
      console.error('Error adding new product:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.delete('/api/admin/products/:id', async (req, res) => {
    // Logic to delete a product (admin only)
    const productId = req.params.id;
    try {
      const deletedProduct = await pool.query('DELETE FROM Products WHERE product_id = $1 RETURNING *', [productId]);
      if (deletedProduct.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ message: 'Product deleted successfully', deletedProduct: deletedProduct.rows[0] });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
