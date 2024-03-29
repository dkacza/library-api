# Library API

### General description:
This is a REST API which is meant to be used by libraries, 
for getting and updating data about the books and the people who lend them.

There is a dedicated frontend for this API:
<br>
https://github.com/dkacza/book-library

### Technical details
- The app was made with Node.js and Express.js framework with MVC pattern in mind.
- It uses MongoDB to store the data and Mongoose for accessing it in a convenient way.
- User authentication is implemented via JWT through dedicated NPM package.
- Vulnerable data is encrypted through modules and packages like `crypto` and `bcrypt`.
- The app protects itself from XSS attacks and query injections by implementing additional 3rd party middleware packages.
- The app can be run in 2 modes: production and development. Their difference lies within the way the errors are presented to user.
- It uses `nodemailer` package to send emails to users.

### Behaviour:
1. Every user can:
 - Create library account
 - Log in to his account
 - Reset his password through email in case he forgets it
2. Logged-in user can:
 - Browse all books 
 - Change his password
 - View his profile with history of rentals
 - Change his profile details
3. Librarians can:
 - Lend books to users
 - Mark books as returned
 - Add new books to the library or update existing ones
 - Get data about all the users
 - Get history of rentals for each book and each user
4. Admins can:
 - Promote users for higher roles
 - Do anything else

Book can not be lend to user, if:
 - He has already borrowed 3 books.
 - He has not returned a book, which he borrowed more than 50 days ago.

Users can sort and filter the results when they are getting all the documents from the collection.
Field limiting and pagination is also implemented for GET requests.

### Endpoint documentation
App is separated into 3 main data models (users, books and rentals), which can be accessed through separate endpoints.
You can find the premade Postman workspace in `dev-data` folder.
Endpoint documentation is also available here: https://documenter.getpostman.com/view/14293687/2s93eZyBZi

### How to run it:
This API has been deployed on Render:
<br>
https://book-library-api-1g5j.onrender.com

Keep in mind that you need a MongoDB server running locally on your computer or MongoDB Atlas in the cloud to run this app.
I also recommend using Postman for convenient way of sending requests.

1. Clone the repository and run `npm install` command to get all the necessary NPM packages.
2. Run `npm createConfig` command to create the `config.env`.
3. Fill the `config.env` file with configuration data.
   Some of the variables are already prefilled, but I encourage you to adjust them for your needs.
4. Import the JSON files in dev-data folder to your MongoDB database.
   If you have MongoDB Command Line Tools installed, you can just run the bash or batch script in that folder.
   This step is not necessary, but again, I recommend you to do that for better experience.
5. Load two Postman configuration files found in that directory. *(optional)*
5. Hit `npm run start` to launch the app!

Now when the app is running, you can use the premade Postman setup, which I have included in the project.
Use the logging in endpoint with `example@test.com` and `pass1234` for email and password to get access to see how it works.
<br>
