Payments (Stripe)
------------------

- The server expects a Stripe secret key in `STRIPE_SECRET` or `STRIPE_KEY`.
- In production provide a real Stripe secret key. Without it the payment endpoint
  returns HTTP 500.
- For local development you can either set `NODE_ENV=development` and use the
  `X-Dev-User` request header to bypass JWT auth when testing the payment
  endpoint, or set a real Stripe key in a `.env` file. Example `.env` entry:

  STRIPE_SECRET=<YOUR_STRIPE_SECRET_KEY_HERE>

- To create a test cart for a user, run one of the scripts in `server/scripts/`
  (for example `create_test_order.js`) or create a simple dev script that
  inserts a cart record for the desired user email.

Disabling dev mock
------------------

- To test with real Stripe PaymentIntents, set `STRIPE_SECRET` (or `STRIPE_KEY`) in your `.env` and restart the server. When a valid key is present the server will call Stripe's API and return a real `clientSecret`.
- Remove any `X-Dev-User` usage and use a valid JWT token for the user when testing end-to-end payments.
