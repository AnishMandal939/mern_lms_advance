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


- password generator for access token m refreshToken
https://www.lastpass.com/features/password-generator - to generate random password

SUCCESS: Generate New Token , get user, social authentication

jtw token must be provided - means - your token expired - this should only be hitted when user is logged in
this is like professional authentication system that fb,outlook, teams etc other sites uses to secure session logout

- social auth will be handled from frontend

SUCCESS: update user info, password and avatar
 - cloudinary - image hosting - 
 base64 image  for cloudinary - 

 ## authentication done - forgot password functionality left


TODO:
 ## COURSE - 2
    - create course model : Design course database model ( schema )
    - create course controller - create and edit course
    - create course service
    - create course route
    - create course middleware
    - create course validation
    SUCCESS: above

    SUCCESS: - below
    GET Single & All courses - without purchase
     - since redis is serverless - we're maintaining data in cache (redis) - if once visited - then it will be stored in cache - so that next time it will be fetched from cache
        - if not visited - then it will be fetched from database and stored in cache
        - if visited - then it will be fetched from cache


SUCCESS:
    - get course content, get user accessible all courses - only for valid user

SUCCESS:
   - add questions to course array, and answers to question array
   - add reviews in course

   git remote set-url origin git@github.com:AnishMandal939/mern_lms_advance.git   - to push for personal github repo using ssh
   git push origin branch_name - to push to github repo

SUCCESS: add review and reply in course

- SUCCESS: 
   - design order model and notification model: done

- TODO: 
   - create order controller - create and edit order
      - create order done
      - : get and update notification status - done
      - : delete notification with cronjob: TODO: this will delete notification after 1 month of interval if notification is read 

      package: for cron job
      npm install --save node-cron
      npm i @types/node-cron -D
      [node cron link](https://www.npmjs.com/package/node-cron)
