import React, { useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify'; // For notifications

function Create() {
  const [task, setTask] = useState("");

  const handleAdd = () => {
    if (task.trim() === "") {
      toast.error("Task cannot be empty.");
      return;
    }

    axios.post("http://localhost:8080/add", { task })
      .then(() => {
        setTask(""); 
        toast.success("Task added successfully!");
        window.location.reload(); 
      })
      .catch(() => toast.error("Error adding task"));
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter Task"
        value={task}
        onChange={(e) => setTask(e.target.value)}
      />
      <button onClick={handleAdd}>Add</button>
    </div>
  );
}

export default Create;
