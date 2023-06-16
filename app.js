const express = require("express");
const app = express();
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
dotenv.config();
const port = process.env.PORT || 5005;
const cors = require("cors");
const path = require("path");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const donationRouter = require("./routes/donation");
const postRouter = require("./routes/post");
const compression = require("compression");
const helmet = require("helmet");
const morgan = require("morgan");
const http = require("http").Server(app);
const fs = require("fs");

app.use(
  cors({
    credentials: true,
    // origin: ["http://localhost:3000", "http://localhost:3001"],
    origin: [
      "https://momo-app-client.vercel.app",
      "https://momo-app-admin.vercel.app",
    ],
  })
);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// connect MongoDb
mongoose
  // .connect(process.env.MONGO_URL)
  .connect(
    "mongodb+srv://Skull:anhtanhl12345k@cluster0.bevlxni.mongodb.net/donation_app?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Database connection successful!");
  })
  .catch((err) => {
    console.log(err);
  });

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

// absolute file to server upload photos
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "images")));

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/donation", donationRouter);
app.use("/api/post", postRouter);

app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

http.listen(port, () => {
  console.log(`server start at port: ${port}`);
});
