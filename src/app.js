// // src/app.js

// console.log(">>> app.js loaded from:", import.meta.url);
// import express from 'express';
// import cors from 'cors';
// import cookieParser from 'cookie-parser';
// import userRoutes from './routes/user.routes.js';

// const app = express();

// // Logging middleware to track all requests
// app.use((req, res, next) => {
//   console.log("➡️", req.method, req.originalUrl);
//   next();
// });

// app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
// app.use(express.json({ limit: '16kb' }));
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static('public'));
// app.use(cookieParser());

// // ✅ Root route
// app.get('/', (req, res) => {
//   console.log("Root route hit ✅");
//   res.send('Server is running Here 🚀');
// });

// // ✅ API routes
// app.use('/api/v1/users', userRoutes);

// console.log("✅ app.js fully loaded and exported");
// export { app };



// src/app.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from './routes/user.routes.js'


const app = express();

// --- Debug middleware to log all requests ---
app.use((req, res, next) => {
  console.log("Incoming Request:", req.method, req.url);
  next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// ✅ TEST ROOT ROUTE
app.get("/", (req, res) => {
  console.log("✅ Root route hit!");
  res.send("Server is running Here 🚀");
});

// ✅ TEMP TEST ROUTE
app.get("/test", (req, res) => {
  res.json({ message: "Test route works ✅" });
});


// -----------main routes----------

app.use("/api/v1",routes)
export { app };


