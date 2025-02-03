# Backend for Voltaic
The backend code for voltaic.

> [!CAUTION]
> The backend uses AdonisJS, hence use of AI tools should be done with caution as they do not have complete knowledge of the framework. Using the docs will be much more fruitful.

## Get Started

0. Prerequisites
   - node
   - npm
   - sqlite
   - postgres

1. Install dependencies:

    Make sure you are in the backend folder.

    ```shell
    $ npm i
    ```

2. Run the backend server:

    ```shell
    $ npm run dev
    ```

3. The backend runs on port 3333.

## Relevant Know How About the Structure

- The project uses a backend framework known as AdonisJS.
- The choice was made due to the batteries included nature of AdonisJS.
- The framework is also capable of making fullstack applications with React, Vue, and Svelte instead of just acting like a backend REST API. But we dont utilize that here.
- The framework comes built in with an ORM, an Authorization Layer, a Validator, a Testing Framework, and of course an HTTP server (which is quite faster than express).
- The entry point of the backend is the `routes.ts` file located under the start folder.
- All the API routes are defined there, preferably in groups.
- The framework follows an opnionated, MVC pattern by default. Thus all requests are usually sent to `controllers`.
- New controllers can be created using the built in CLI utility called `ace` like so: `node ace make:controller <controller_name>`
- There is a lot more that the ace CLI tool can do. Just run `node ace` for a list of commands that the tool can perform.
- The database structure is determined by the `models` (located in the models folder) and the `migrations` (located in the migrations folder).
- The general rough workflow for creating a new feature that requires changes to the database is as follows:
  - Create a Model using the `ace` CLI: `node ace make:model <model_name> -m`. This will create a model and a corresponding migrations file.
  - The column names for a table will correspond to the models and the migrations file will create those columns in the database when migrations are ran.
  - The migrations have to be written as per the model and then ran using `node ace migrations:run`.
  - During the development cycle, when the data in the database does not matter, we can run `node ace migrations:fresh` to delete everything in the database and re-run the migrations. Be careful, since this deletes all the data in the database.
  - Once the models and migrations are ready, make corresponding routes in the `start/routes.ts` file. Since this is an opinionated MVC framework, follow the MVC pattern and each request should go to a controller. Look into how the controllers are currently working by experimenting with existing controllers in the code base under the `controllers` folder. 
  - The routes have to be defined by hand and the corresponding controllers need to be made using the ace CLI: `node ace make:controller <controller_name> -s -r`. This makes the controller under the controller folder. It also keeps the name of the controller in its singular form and also makes empty methods inside the controller for your use.
  - Define your logic to interact with the incoming requests inside the methods of the controller. This is the place where you interact with the database.
  - Ideally, each request that has incoming data must be validated using the built in validation library called `vine`. This is a fast validation library and is benchmarked to be faster than `zod`. Due to the completeness of the backend framework all such necessary libraries are included.
  - You make new validator using the command `node ace make:validator <validator_name>`. The validators are used inside the controllers to validate the bodies of incoming requests.
  - The framework uses Server Sent Events instead of WebSockets to communicate with the Frontend in the current iteration, since they are faster with less overhead. The libary is called `transmit` and has server side and client side counterparts: 
    - https://github.com/adonisjs/transmit-client
    - https://github.com/adonisjs/transmit

## Relevant Documentation To Be Read

1. AdonisJS (Backend Framework): https://docs.adonisjs.com/guides/preface/introduction
2. Lucid (ORM): https://lucid.adonisjs.com/docs/introduction
3. VineJS (validation Library): https://vinejs.dev/docs/introduction
4. Japa (Testing Framework): https://japa.dev/docs/introduction
5. Transmit (SSE): https://docs.adonisjs.com/guides/digging-deeper/transmit
