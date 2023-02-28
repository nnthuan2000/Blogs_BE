const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./src/app');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
