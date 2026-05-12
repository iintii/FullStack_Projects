/* 
User clicks Sign in with GitHub.

Auth.js route endpoint is invoked.

Using the GitHub provider config from src/auth.ts, Auth.js redirects the browser to GitHub.

GitHub builds and shows the login/consent page, not your app.

After login, GitHub redirects back to your Auth.js callback endpoint.

Auth.js finishes the login and creates the session / DB records.

For this /api/auth/[...nextauth] route, if a GET request comes in, use Auth.js’s GET handler function. If a POST request comes in, use Auth.js’s POST handler function.
*/


import { handlers } from "@/auth";
export const { GET, POST } = handlers;