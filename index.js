const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const { check, validationResult } = require("express-validator"); // Import check and validationResult...For request validation

app.use(express.json());

const secretKey = "secret-key";

// Sample data for demonstration
let resources = [
  { id: 1, name: "Resource 1" },
  { id: 2, name: "Resource 2" },
];

//api for authentication '
app.post("/login", (req, res) => {
  const user = {
    id: 1,
    name: "Usama",
    email: "usamaikram228@gmail.com",
  };
  const token = jwt.sign(user, secretKey);
  res.json({ token: token });
});

//Authentication middlware
function verifyToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) {
    res.send("Not found");
  } else {
    jwt.verify(token, secretKey, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  }
}

//Crud Operations
app.get("/resources", (req, res) => {
  res.send(resources);
});

app.get("/resources/:id", (req, res) => {
  const resourceIndex = resources.findIndex(
    (r) => r.id === parseInt(req.params.id)
  );
  if (resourceIndex === -1) {
    return res.status(404).json({ message: "Resource not found" });
  }
  res.json(resources[resourceIndex].name);
});

//post request
app.post(
  "/resources",
  verifyToken,
  [
    check("name")
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newResource = {
      id: resources.length + 1,
      name: req.body.name,
    };

    resources.push(newResource);
    res.status(201).json(newResource);
  }
);
// Put request
app.put("/resources/:id", verifyToken, (req, res) => {
  const resourceIndex = resources.findIndex(
    (r) => r.id === parseInt(req.params.id)
  );
  if (resourceIndex === -1)
    return res.status(404).json({ message: "Resource not found" });

  resources[resourceIndex].name = req.body.name;
  res.json(resources[resourceIndex]);
});
//delete request
app.delete("/resources/:id", verifyToken, (req, res) => {
  const resourceIndex = resources.findIndex(
    (r) => r.id === parseInt(req.params.id)
  );
  if (resourceIndex === -1) {
    return res.status(404).json({ message: "Resource not found" });
  }
  resources.splice(resourceIndex, 1);
  res.json({ message: "Resource deleted" });
});

app.listen(5000, () => {
  console.log("App is running");
});
