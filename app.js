import express from 'express';
import dotenv from 'dotenv';
import aichat from './routes/apiService.js';
import telegramService from './routes/telegramService.js'

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', './views');

app.use('/', aichat);
app.use('/bot',telegramService);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
