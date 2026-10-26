# AI Content Assistant

A full-stack AI content generation app built with React, Node.js, Express, and Google Gemini API.

## Project Structure

- backend/ - Express server and Gemini API integration
- frontend/ - React frontend UI

## Setup

1. Open the backend folder and create a real Google Gemini API key in the .env file.
2. Install backend dependencies:
   npm install
3. Start the backend:
   npm start
4. Start the frontend from the frontend folder:
   cd frontend
   npm start

## Environment

Create a backend/.env file like this:

GEMINI_API_KEY=your_real_api_key_here
PORT=5000

## Notes

- Keep the API key in the backend only.
- Do not expose it in frontend code.
- The frontend communicates with the backend via port 5000.
