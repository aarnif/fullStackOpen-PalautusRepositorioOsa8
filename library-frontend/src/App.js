import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

const App = () => {
  return (
    <Router>
      <div>
        <button>
          <Link to="/authors">authors</Link>
        </button>
        <button>
          <Link to="/books">books</Link>
        </button>
        <button>
          <Link to="/add">add book</Link>
        </button>
      </div>

      <Routes>
        <Route path="/" element={<Authors />}></Route>
        <Route path="/authors" element={<Authors />}></Route>
        <Route path="/books" element={<Books />}></Route>
        <Route path="/add" element={<NewBook />}></Route>
      </Routes>
    </Router>
  );
};

export default App;
