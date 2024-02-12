const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectMongoDB = require('./configs/dbConnect');
const authRouter = require('./routes/auth.routes');
const responseMiddleware = require('./middlewares/success.middleware');
const errorMiddleware = require('./middlewares/error.middleware');
const port = process.env.PORT || 4000;
require('dotenv').config();

const app = express();

let origin = process.env.ORIGIN || 'http://localhost:5173';

app.use(cookieParser());
app.use(cors(
    {
        origin: origin,
        credentials: true,
    }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(responseMiddleware.responseMiddleware);
app.use(errorMiddleware.errorHandler);

connectMongoDB();

app.use('/api/auth', authRouter);

app.use('/', (req, res) => {
    res.send('Server is up and running!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
