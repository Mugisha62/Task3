require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");
const { ApolloServer, gql } = require("apollo-server-express");

const sequelize = require("./config/database");
const User = require("./models/User");
const Task = require("./models/Task");

const app = express();
app.use(cors());
app.use(express.json());

/* =====================================================
   REST AUTH ROUTES
===================================================== */

// REGISTER
app.post("/api/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    res.json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =====================================================
   GRAPHQL
===================================================== */

const typeDefs = gql`
  type Task {
    id: ID!
    title: String!
    description: String
  }

  type Query {
    tasks: [Task]
  }

  type Mutation {
    createTask(title: String!, description: String): Task
    deleteTask(id: ID!): String
  }
`;

const resolvers = {
  Query: {
    tasks: async (_, __, context) => {
      if (!context.user) throw new Error("Unauthorized");
      return await Task.findAll({ order: [["createdAt", "DESC"]] });
    },
  },

  Mutation: {
    createTask: async (_, { title, description }, context) => {
      if (!context.user) throw new Error("Unauthorized");

      return await Task.create({
        title,
        description,
      });
    },

    deleteTask: async (_, { id }, context) => {
      if (!context.user) throw new Error("Unauthorized");

      if (context.user.role !== "admin")
        throw new Error("Only admin can delete tasks");

      await Task.destroy({ where: { id } });
      return "Task deleted successfully";
    },
  },
};

async function startServer() {
  /* =====================================================
     APOLLO SERVER
  ===================================================== */

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const token = req.headers.authorization || "";

      if (!token) return {};

      try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        return { user };
      } catch {
        return {};
      }
    },
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  /* =====================================================
     SOCKET.IO (REAL-TIME CHAT)
  ===================================================== */

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Receive full message object
    socket.on("sendMessage", (data) => {
      console.log("Message received:", data);

      // Broadcast to all users
      io.emit("receiveMessage", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  /* =====================================================
     DATABASE + SERVER START
  ===================================================== */

  await sequelize.sync({ alter: true });
  console.log("Database synced successfully");

  const PORT = process.env.PORT || 5000;

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`GraphQL ready at http://localhost:${PORT}/graphql`);
  });
}

startServer();