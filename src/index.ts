import express from 'express';
import dotenv from 'dotenv';
import sequelize from './config/database';
import { initializeAssociations } from './utils/associations';
import { initializeTriggers } from './utils/triggers';
import UserController from './modules/user/controllers/user.controller';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userController = new UserController();

sequelize
  .sync({ alter: true })
  .then(() => {
    initializeAssociations();
    initializeTriggers();
  })
  .catch((err) => console.error('Sync failed:', err));

app.use('/api', userController.router);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
