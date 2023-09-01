@echo off

set MONGO_HOST=localhost
set MONGO_PORT=27017
set DATABASE_NAME=library

set COLLECTION_NAME=users
set JSON_FILE=users.json

mongoimport --host %MONGO_HOST% --port %MONGO_PORT% --db %DATABASE_NAME% --collection %COLLECTION_NAME% --file %JSON_FILE% --jsonArray

set COLLECTION_NAME=books
set JSON_FILE=books.json

mongoimport --host %MONGO_HOST% --port %MONGO_PORT% --db %DATABASE_NAME% --collection %COLLECTION_NAME% --file %JSON_FILE% --jsonArray

set COLLECTION_NAME=rentals
set JSON_FILE=rentals.json

mongoimport --host %MONGO_HOST% --port %MONGO_PORT% --db %DATABASE_NAME% --collection %COLLECTION_NAME% --file %JSON_FILE% --jsonArray