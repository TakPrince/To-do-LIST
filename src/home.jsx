import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { BsCheckCircleFill, BsCircleFill, BsFillTrashFill, BsPencil, BsClockHistory } from "react-icons/bs";
import io from "socket.io-client";
import Create from "./create";
import { toast } from 'react-toastify'; 

const socket = io("http://localhost:8080");

function Home() {
  const [todos, setTodos] = useState([]);
  const [editing, setEditing] = useState(null);
  const [newTask, setNewTask] = useState("");
  const [versions, setVersions] = useState([]);
  const [lockedTask, setLockedTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    axios.get("http://localhost:8080/show")
      .then((result) => setTodos(result.data))
      .catch((err) => toast.error("Error fetching tasks"))
      .finally(() => setIsLoading(false));

    socket.on("taskAdded", (newTask) => {
      setTodos((prevTodos) => [...prevTodos, newTask]);
    });

    socket.on("taskUpdated", (updatedTask) => {
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo._id === updatedTask._id ? updatedTask : todo
        )
      );
    });

    socket.on("taskDeleted", (deletedId) => {
      setTodos((prevTodos) => prevTodos.filter((todo) => todo._id !== deletedId));
      setVersions((prevVersions) => prevVersions.filter((version) => version.todoId !== deletedId)); 
    });

    return () => {
      socket.off("taskAdded");
      socket.off("taskUpdated");
      socket.off("taskDeleted");
    };
  }, []);

  const markAsDone = useCallback((id) => {
    axios.put(`http://localhost:8080/update/${id}`)
      .then(() => {
        const updatedTodos = todos.map(todo =>
          todo._id === id ? { ...todo, done: true } : todo
        );
        setTodos(updatedTodos);
      })
      .catch(() => toast.error("Error marking task as done"));
  }, [todos]);

  const handleDelete = useCallback((id) => {
    axios.delete(`http://localhost:8080/delete/${id}`)
      .then(() => {
        setTodos(todos.filter(todo => todo._id !== id));
        setVersions(versions.filter(version => version.todoId !== id));
        toast.success("Task deleted successfully!");
      })
      .catch(() => toast.error("Error deleting task"));
  }, [todos, versions]);

  const startEditing = (todo) => {
    if (lockedTask && lockedTask !== todo._id) {
      toast.info("Task is locked by another user.");
      return;
    }
    setEditing(todo._id);
    setNewTask(todo.task);
    setLockedTask(todo._id);
  };

  const saveEdit = (id) => {
    if (!newTask.trim()) return;

    axios.put(`http://localhost:8080/edit/${id}`, { task: newTask })
      .then(() => {
        const updatedTodos = todos.map(todo =>
          todo._id === id ? { ...todo, task: newTask } : todo
        );
        setTodos(updatedTodos);
        setEditing(null);
        setNewTask("");
        setLockedTask(null); 
        toast.success("Task updated successfully!");
      })
      .catch(() => toast.error("Error updating task"));
  };

  const cancelEdit = () => {
    setEditing(null);
    setNewTask("");
    setLockedTask(null); 
  };

  const viewVersions = (id) => {
    axios.get(`http://localhost:8080/versions/${id}`)
      .then(response => setVersions(response.data))
      .catch(() => toast.error("Error fetching task versions"));
  };

  const closeVersions = () => {
    setVersions([]); 
  };


  const renderTodoList = useMemo(() => {
    return todos.map((todo, index) => (
      <div className="task-card" key={index}>
        <div className="checkbox" onClick={() => !editing && markAsDone(todo._id)}>
          {todo.done ? <BsCheckCircleFill className="icon completed" /> : <BsCircleFill className="icon" />}
          {editing === todo._id ? (
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="edit-input"
            />
          ) : (
            <p className={todo.done ? "throughline" : ""}>{todo.task}</p>
          )}
        </div>
        <div className="task-actions">
          {editing === todo._id ? (
            <div className="edit-actions">
              <button className="save-btn" onClick={() => saveEdit(todo._id)}>Save</button>
              <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
            </div>
          ) : (
            <>
              <button className="edit-btn" onClick={() => startEditing(todo)}><BsPencil /></button>
              <button className="delete-btn" onClick={() => handleDelete(todo._id)}><BsFillTrashFill /></button>
              <button className="version-btn" onClick={() => viewVersions(todo._id)}><BsClockHistory /></button>
            </>
          )}
        </div>
      </div>
    ));
  }, [todos, editing, newTask, markAsDone, handleDelete, startEditing, cancelEdit, saveEdit]);

  return (
    <div className="home">
      <h2>ToDo List</h2>
      <Create />
      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : todos.length === 0 ? (
        <div className="no-record">
          <h2>No record</h2>
        </div>
      ) : (
        renderTodoList
      )}

      <div className="versions">
        {versions.length > 0 && (
          <div>
            <h3>Versions</h3>
            {versions.map((version, idx) => (
              <p className="version_content" key={idx}>
                {version.task} - {new Date(version.date).toLocaleString()}
              </p>
            ))}
            <button onClick={closeVersions} className="close-btn">Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
