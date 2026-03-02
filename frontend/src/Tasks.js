import React, { useState } from "react";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";

const GET_TASKS = gql`
  query {
    tasks {
      id
      title
      description
    }
  }
`;

const CREATE_TASK = gql`
  mutation ($title: String!, $description: String!) {
    createTask(title: $title, description: $description) {
      id
      title
      description
    }
  }
`;

const DELETE_TASK = gql`
  mutation ($id: ID!) {
    deleteTask(id: $id)
  }
`;

function Tasks() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const { loading, error, data, refetch } = useQuery(GET_TASKS);
  const [createTask] = useMutation(CREATE_TASK);
  const [deleteTask] = useMutation(DELETE_TASK);

  const handleAddTask = async () => {
    if (!title) return;

    await createTask({
      variables: { title, description },
    });

    setTitle("");
    setDescription("");
    refetch();
  };

  const handleDelete = async (id) => {
    await deleteTask({
      variables: { id },
    });

    refetch();
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading tasks</p>;

  return (
    <div>
      <h2>Tasks</h2>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button onClick={handleAddTask}>Add Task</button>

      <ul>
        {data.tasks.map((task) => (
          <li key={task.id}>
            {task.title} - {task.description}

            {user.role === "admin" && (
              <button
                style={{ marginLeft: "10px", color: "red" }}
                onClick={() => handleDelete(task.id)}
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Tasks;