import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
