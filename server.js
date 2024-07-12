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
  const transaction = await sequelize.transaction();

  try {
    const userId = req.params.id;
    const amount = req.body.amount;

    const user = await User.findByPk(userId, { transaction });

    if (!user) {
      console.error(`User not found: ${userId}`);
      await transaction.rollback();
      return res.status(404).json({ error: 'User not found' });
    }

    const newBalance = user.balance + amount;
    if (newBalance < 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Balance cannot go negative' });
    }

    await User.update({ balance: newBalance }, { where: { id: userId }, transaction });

    await transaction.commit();
    res.status(200).json({ message: 'Balance updated successfully' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: 'Internal server error' });
  }
});


//await user.update({ balance: user.balance += amount }, { transaction: t });

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
