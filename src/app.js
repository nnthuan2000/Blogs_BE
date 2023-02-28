const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const blogRoutes = require('./routes/blogRoutes');
const userRoutes = require('./routes/userRoutes');

const globalErrorHandler = require('./controllers/errorController');
const initial = require('./utils/createData');

const app = express();

//! Configuration middleware
app.use(
    cors({
        origin: 'http://localhost:8081',
    })
);

//* Logger morgan
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//* Parse requests of content-type - application/json
app.use(express.json());

//* Parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

//! DB
const db = require('./models');

if (process.env.NODE_ENV === 'development') {
    db.sequelize
        .sync({ force: true })
        .then(() => {
            console.log(`Synced database`);
            initial();
        })
        .catch((err) => console.log(`Failed to sync databse ${err.message}`));
}

//! Routes
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/users', userRoutes);

//! Global error controller
app.use(globalErrorHandler);

module.exports = app;
