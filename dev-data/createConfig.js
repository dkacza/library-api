const fs = require('fs');

const textToSave = `# Port on which the app will be running
PORT=3000
# Database connection string
DB=mongodb://127.0.0.1:27017/library
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
`;

fs.writeFileSync('./config.env', textToSave, {append: false});
console.log('Config file created');