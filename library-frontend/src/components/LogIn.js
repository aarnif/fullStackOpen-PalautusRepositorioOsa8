import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { LOGIN } from "../queries";

const LogIn = ({ setToken }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message);
    },
  });

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value;
      setToken(token);
      localStorage.setItem("books-user-token", token);
      navigate("/books");
    }
  }, [result.data]);

  const handleLogin = async (event) => {
    event.preventDefault();
    console.log("Try to log in...");
    console.log("Username:", username);
    console.log("Password:", password);

    login({ variables: { username, password } });
    setUsername("");
    setPassword("");
  };

  return (
    <div>
      <h1>Log in</h1>
      <form onSubmit={handleLogin}>
        <div>
          username
          <input onChange={(event) => setUsername(event.target.value)} />
        </div>
        <div>
          password
          <input
            type="password"
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  );
};

export default LogIn;
