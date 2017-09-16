# BookManager API

 Simple API for managing books. CRUD operations for books and authors. Secured by JWT.


### Configuration 
 Requires MongoDB
 
 
 
Environment variables:

| Variable      |Description  |Default Value
| ------------- |-------------|-------------|
| HOST          | HTTP host   | localhost   |
| PORT          | HTTP port   | 3000        |
| MONGO_DB_URL  | mongo db url| http://localhost:27017/bookmanager|
| ADMIN_PASS    | admin user password | admin|

### Tests

- npm run server-unit-test
- npm run server-integration-test (requires MongoDB running)

