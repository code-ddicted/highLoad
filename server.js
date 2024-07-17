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


// Route to update the user's balance
app.put('/users/:id/balance', async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = parseInt(req.params.id, 10);
    const amount = parseFloat(req.body.amount);

    const user = await User.findByPk(userId, { transaction });

    if (!user) {
      console.error(`User not found: ${userId}`);
      await transaction.rollback();
      return res.status(404).json({ error: 'User not found' });
    }

    const newBalance = user.balance + amount;

    if (newBalance < 0) {
      return res.status(400).json({ error: 'Balance cannot go negative' });
    }

    // Update the balance with locking
    await user.update(
      { balance: newBalance },
      {
        where: { id: userId },
        transaction,
        lock: transaction.LOCK.UPDATE
      }
    );
    await transaction.commit();

    console.log(`Balance updated successfully for user ${userId}`);
    res.status(200).json({ message: 'Balance updated successfully' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating balance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Route to reset user balance (for testing purposes)
app.get('/reset', async (req, res) => {
  const userId = 1;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      console.error(`User with ID ${userId} not found`);
      return res.status(404).json({ error: 'User not found' });
    }

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
