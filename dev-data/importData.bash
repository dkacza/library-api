MONGO_HOST="localhost"
MONGO_PORT="27017"
DATABASE_NAME="library"

COLLECTION_NAME="users"
JSON_FILE="users.json"

mongoimport --host $MONGO_HOST --port $MONGO_PORT --db $DATABASE_NAME --collection $COLLECTION_NAME --file $JSON_FILE --jsonArray

COLLECTION_NAME="books"
JSON_FILE="books.json"

mongoimport --host $MONGO_HOST --port $MONGO_PORT --db $DATABASE_NAME --collection $COLLECTION_NAME --file $JSON_FILE --jsonArray

COLLECTION_NAME="rentals"
JSON_FILE="rentals.json"

mongoimport --host $MONGO_HOST --port $MONGO_PORT --db $DATABASE_NAME --collection $COLLECTION_NAME --file $JSON_FILE --jsonArray