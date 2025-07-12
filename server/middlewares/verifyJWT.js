const supabase = require("../config/supabaseClient");

module.exports = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Missing token" });
  console.log("🔐 Received token:", token);
  const { data, error } = await supabase.auth.getUser(token);
  console.log("✅ Supabase returned user:", data?.user);
  console.log("❌ Error:", error);
  if (error || !data?.user) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ message: "Invalid token" });
  }

  req.user = data.user;
  next();
};
