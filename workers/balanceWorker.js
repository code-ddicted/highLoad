const { parentPort } = require('worker_threads');
const sequelize = require('../config/database');
const User = require('../models/user');

parentPort.on('message', async (data) => {
  const { userId, amount } = data;
  
  try {
    const result = await sequelize.transaction(async (t) => {
      const user = await User.findByPk(userId, { transaction: t });

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

    parentPort.postMessage({ success: true, balance: result.balance });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }
});
