## Authenticake

Authentication and Authorization system. The backend can be run independently as a service or integrated with an existing Node/Express app. React components are available for the front end, making a complete system.

Currently pre-alpha and in development. Not ready for production use. In the future, various packages for server, client and connector will be published to NPM.

### Features (not all are implemented)

- Configurable authentication models: Sessions, JWT, OAuth and Passwordless
- Optional refresh tokens, blacklisting and/or CSRF protection
- Choice of database and cache
- Automatic schema generation based on configuation (or use your own)
- Custom role based authorization
- Easily plugs into a new or existing React app on the front end
- Components/hooks for Login, Logout, Signup, Forgot Password, Authorization, etc.
- Built with Typescript

### Previewing

First do a build: `npm run build`

`npm run demos` - runs the demos (auth server on port 4000, client/React app on 3000)

`npm run dev` - Runs all packages except demos in watch mode (to work on the app)

`npm start` - same as above but also starts demos in a single terminal

Aside from the demo, you can also test the API from the httpClient folder using Http Client (requires a Jetbrains IDE or the VSCode Rest Client extension) although logout won't work in Jetbrains due to a longstanding cookie jar bug.

