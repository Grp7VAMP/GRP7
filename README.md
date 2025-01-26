# Project Name

This project consists of a **frontend** deployed on Vercel and a **backend** deployed on Heroku. The frontend is built with [React/Vue.js/etc.] and the backend is built with [Node.js/Express/etc.]. 

## Live Demo

You can view the live demo of the application here:

**Frontend:** [https://w65e9jyvv9rioxol.vercel.app](https://w65e9jyvv9rioxol.vercel.app)

## Backend (Heroku)

The backend is deployed on Heroku. It provides the necessary API endpoints and handles the logic for the application.


### Deploying the Backend on Heroku

1. Create a new app on Heroku by visiting the [Heroku Dashboard](https://dashboard.heroku.com/).
2. Connect the repository to Heroku.
3. Set up the necessary environment variables for the app (e.g., `API_KEY`, `DATABASE_URL`, etc.).
4. Deploy the app to Heroku.

### Environment Variables on Heroku
Make sure to configure the following environment variables in your Heroku app's settings:

- `API_KEY` – Your Finnhub API key or any other necessary key.
- `DATABASE_URL` – Connection string for your database.

### Running Locally
To run the backend locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone (https://github.com/Vivek-1102/capx.git)
   cd frontend
   npm run dev

   cd backend
   npm start
