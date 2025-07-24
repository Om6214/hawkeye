const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const path = require("path");
const os = require("os");
const fs = require("fs-extra");

dotenv.config();
require("./config/passport")(passport);
const corsOptions = require("./config/corsOptions");

const TEMP_CACHE = path.join(os.tmpdir(), "hawkeye_cache");
if (fs.existsSync(TEMP_CACHE)) {
  fs.emptyDirSync(TEMP_CACHE);
  console.log(`Cleaned cache directory: ${TEMP_CACHE}`);
}
const app = express();
app.use(cors(corsOptions));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);
app.use("/api/scan", require("./routes/scanRoutes"));
app.use("/api/github", require("./routes/githubRoutes"));

// Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
