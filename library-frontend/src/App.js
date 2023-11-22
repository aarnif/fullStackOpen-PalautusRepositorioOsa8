import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import LogIn from "./components/LogIn";
import Recommendations from "./components/Recommendations";
import { useApolloClient, useSubscription } from "@apollo/client";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { BOOK_ADDED } from "./queries";

const App = () => {
  const [token, setToken] = useState(null);
  const client = useApolloClient();

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      console.log(data);
      const bookTitle = data.data.bookAdded.title;
      window.alert(`Added book titled ${bookTitle}`);
    },
  });

  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
  };

  return (
    <Router>
      <div>
        <button>
          <Link to="/authors">authors</Link>
        </button>
        <button>
          <Link to="/books">books</Link>
        </button>
        {token && (
          <>
            <button>
              <Link to="/add">add book</Link>
            </button>
            <button>
              <Link to="/recommended">recommended</Link>
            </button>
          </>
        )}
        {!token ? (
          <button>
            <Link to="/login">login</Link>
          </button>
        ) : (
          <button onClick={logout}>
            <Link to="/books">logout</Link>
          </button>
        )}
      </div>

      <Routes>
        <Route path="/" element={<Authors />}></Route>
        <Route path="/authors" element={<Authors />}></Route>
        <Route path="/books" element={<Books />}></Route>
        <Route path="/add" element={<NewBook />}></Route>
        <Route path="/recommended" element={<Recommendations />}></Route>
        <Route path="/login" element={<LogIn setToken={setToken} />}></Route>
      </Routes>
    </Router>
  );
};

export default App;
