import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import LogIn from "./components/LogIn";
import Recommendations from "./components/Recommendations";
import { useApolloClient, useSubscription } from "@apollo/client";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ALL_BOOKS, BOOK_ADDED } from "./queries";

// function that takes care of manipulating cache
export const updateCache = (cache, query, addedBook) => {
  // helper that is used to eliminate saving same person twice
  const uniqByTitle = (a) => {
    let seen = new Set();
    return a.filter((item) => {
      let k = item.title;
      return seen.has(k) ? false : seen.add(k);
    });
  };

  cache.updateQuery(query, ({ allBooks }) => {
    return {
      allBooks: uniqByTitle(allBooks.concat(addedBook)),
    };
  });
};

const App = () => {
  const [token, setToken] = useState(null);
  const client = useApolloClient();

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      console.log(data);
      const addedBook = data.data.bookAdded;
      window.alert(`Added book titled ${addedBook.title}`);
      updateCache(client.cache, { query: ALL_BOOKS }, addedBook);
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
