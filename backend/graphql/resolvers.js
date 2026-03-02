const Task = require("../models/Task");

module.exports = {
  Query: {
    getTasks: async (_, __, { user }) => {
      if (!user) throw new Error("Not authenticated");
      return Task.find({ user: user.id }).populate("user");
    }
  },

  Mutation: {
    createTask: async (_, { title, description }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const task = new Task({
        title,
        description,
        user: user.id
      });

      await task.save();
      return task;
    }
  }
};