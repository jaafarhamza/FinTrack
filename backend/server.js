const express = require("express");
const app = express();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Backend 54jkkdjkhkjkhjfs r  fffff5555un  nooo! jek");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
