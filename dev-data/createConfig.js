const fs = require('fs');

const textToSave = `
# Port on which the app will be running
PORT=8000

# Local database connection string
DB_LOCAL_CONNECTION_STRING=mongodb://127.0.0.1:27017/library

# Remote database connection string
DB_CONNECTION_STRING=
DB_USERNAME=
DB_PASSWORD=

# PRODUCTION or DEV mode
MODE=PRODUCTION

# JWT Settings
# Insert some random string in JWT_SECRET
JWT_SECRET=
JWT_EXPIRES_IN=1d
JWT_COOKIE_EXPIRES_IN=1

# Email properties
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASSWORD=

# Front-end URLs
CLIENT_APP_URL=https://book-library-mern-app.netlify.app
LOCAL_APP_URL=http://localhost:3000
`;

fs.writeFileSync('./config.env', textToSave, {append: false});
console.log('Config file created');