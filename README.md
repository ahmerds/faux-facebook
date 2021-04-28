# Second Stage Evaluation
A RESTful API that mimics Facebook's post functionality 😁\
Find the Postman Documentation here [![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/ed40b5919e9142c3e232)


## Dependencies
1. Redis Server, you can install Redis using the following guide ([Redis Quickstart](https://redis.io/topics/quickstart))
2. SQLite3 is used in this project for the sake of simplicity.
3. NodeJS and Yarn package manager

## Steps to run this project
1. Run `yarn` command to install dependencies
2. Modify `.env` file to use your custom credentials where necessary. Make sure you add your SMTP credentials to enable email sending and REDIS_HOST is set to `0.0.0.0`
3. For emails, open `src/utils/sendEmail.ts` and update the from address on line 11 to match your allowed SMTP sender address. Note that you can use a normal email address as a temporary SMTP provider
4. Setup database settings inside `ormconfig.json` file. Only modify this if you intend on changing databases
5. Ensure that you have **Redis** running before running server
6. Run `yarn run serve` command to start development server
7. Run `yarn run build` to compile for production
8. Run `yarn run test` to run test suite


## Run with Docker
If you have docker setup on your machine. You can quickly start the development server with all its dependencies without having to install anything else by running
`docker-compose up`  in the project's root directory\
Before running the command, make sure you have your environment variables correctly set up. Change REDIS_HOST in the .env file to `redis_db`

\
&nbsp;
\
Note that this app does not have full test coverage
