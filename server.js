require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const sequelize = require('./config/database');
const User = require('./models/user');
app.use(bodyParser.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});


// Middleware
app.use(express.json());

// Routes
app.get('/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.put('/users/:userId/balance', async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const { amount } = req.body;
  const parsedAmount = parseInt(amount, 10);

  // Validate parsed inputs
  if (isNaN(userId) || isNaN(parsedAmount)) {
    return res.status(400).json({ error: 'Invalid input: userId and amount must be integers' });
  }

  try {
    // Find the user outside of the transaction to avoid row-level locks
    const user = await User.findByPk(userId);

    if (!user) {
      console.error(`User with ID ${userId} not found`);
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate new balance
    const newBalance = user.balance + parsedAmount;

    // Check if new balance would go negative
    if (newBalance < 0) {
      return res.status(400).json({ error: 'Balance cannot go negative' });
    }

    // Use a transaction to ensure atomicity for the update operation
    const result = await sequelize.transaction(async (t) => {
      user.balance = newBalance;
      await user.save({ transaction: t });

      return user;
    });

    return res.status(200).json({ message: 'Balance updated successfully', balance: result.balance });
  } catch (error) {
    console.error('Error updating balance:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});



app.get('/reset', async (req, res) => {
  const userId = 1;

  try {
    // Find user by ID
    const user = await User.findByPk(userId);

    if (!user) {
      console.error(`User with ID ${userId} not found`);
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user's balance to 10000
    await user.update({ balance: 10000 });

    return res.status(200).json({ message: 'User balance reset to 10000 successfully', balance: 10000 });
  } catch (error) {
    console.error('Error resetting user balance:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// Start server
const PORT = process.env.PORT || 3000;
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => console.error('Unable to connect to the database:', err));
