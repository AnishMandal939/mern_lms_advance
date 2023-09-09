- The tsc --init command generates a tsconfig. json file which indicates that the directory is the root of a TypeScript project. The default tsconfig. json file sets a few options in the compilerOptions object and has comments for what each option does. - npx tsc --init

# mongodb, cloudinary, upstash
- mongodb : database
- cloudinary : image hosting
- upstash : cache - redis

## mongodb, cloudinary, upstash - connection code done

## ErrorHandling - done, ErrorHandler(OOPs to reduce same object error code), ErrorMiddleware( throw error based on errorHandler message & statusCode), catchAsyncError(handles errorMiddleware promise rejection is handled here)

## Design user database model ( schema ) 

## user registration - (controller, service, route) - 
- install ejs - npm i ejs - to render html pages
- npm i --save-dev @types/ejs - to use typescript with ejs
- install nodemailer - npm i nodemailer - to send email
- npm i --save-dev @types/nodemailer

- install express-ejs-layouts - npm i express-ejs-layouts - to render html pages
- install express-session - npm i express-session - to store session data in mongodb
- install connect-mongo - npm i connect-mongo - to store session data in mongodb
- install express-flash - npm i express-flash - to flash messages
- install express-mongo-sanitize - npm i express-mongo-sanitize - to sanitize data
- install helmet - npm i helmet - to secure http headers
- install xss-clean - npm i xss-clean - to prevent xss attacks
- install hpp - npm i hpp - to prevent http param pollution
- install rate-limit - npm i express-rate-limit - to limit request from same api
- install cors - npm i cors - to allow cross origin resource sharing
- install cookie-parser - npm i cookie-parser - to parse cookies
- install bcryptjs - npm i bcryptjs - to encrypt password
- install jsonwebtoken - npm i jsonwebtoken - to generate token
- install nodemailer-express-handlebars - npm i nodemailer-express-handlebars - to send email
- install nodemailer-sendgrid-transport - npm i nodemailer-sendgrid-transport - to send email
- install multer - npm i multer - to upload files
- install sharp - npm i sharp - to resize images
- install dotenv - npm i dotenv - to use environment variables
- install morgan - npm i morgan - to log http requests
    - check if user exists
    - create user
    - send email with token,
    - ejs implementation
    - forgot password
    - reset password
    - login
    - logout
    - update password
    - update profile
    - delete profile

TODO: routes - folder structure 2: 27:54