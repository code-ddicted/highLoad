require('dotenv').config();
const express = require('express');
const app = express();
const sequelize = require('./config/database');
const User = require('./models/user');

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

//route to update the users balance
app.put('/users/:id/balance', async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  try {
    const result = await sequelize.transaction(async (t) => {
      const user = await User.findByPk(id, { transaction: t });

      if (!user) {
        throw new Error('User not found');
      }

      const newBalance = user.balance + amount;

      if (newBalance < 0) {
        throw new Error('Balance cannot go negative');
      }

      await user.update({ balance: newBalance }, { transaction: t });

      return user;
    });

    res.status(200).json({ message: 'Balance updated successfully', balance: result.balance });
  } catch (error) {
    console.error('Error updating balance:', error.message);

    if (error.message === 'User not found') {
      res.status(404).json({ error: 'User not found' });
    } else if (error.message === 'Balance cannot go negative') {
      res.status(400).json({ error: 'Not enough funds in the balance' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
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
