import { useState } from "react";
import { ALL_BOOKS, ALL_GENRES } from "../queries";
import { useQuery } from "@apollo/client";

const Books = () => {
  const books = useQuery(ALL_BOOKS);
  const genres = useQuery(ALL_GENRES);
  const [genre, setGenre] = useState("all genres");

  if (books.loading) {
    return <div>Loading books...</div>;
  }

  if (genres.loading) {
    return <div>Loading genres...</div>;
  }

  const booksToShow =
    genre === "all genres"
      ? books.data.allBooks
      : books.data.allBooks.filter((book) =>
          book.genres.includes(genre) ? book : null
        );

  return (
    <div>
      <h2>books</h2>
      {genre !== "all genres" && (
        <div>
          in genre <strong>{genre}</strong>
        </div>
      )}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {booksToShow.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {genres.data.allGenres.map((genre) => (
        <button key={genre} onClick={() => setGenre(genre)}>
          {genre}
        </button>
      ))}
    </div>
  );
};

export default Books;
