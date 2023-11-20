import { ADD_BOOK, ALL_BOOKS, RECOMMENDATIONS, USER } from "../queries";
import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";

const NewBook = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [published, setPublished] = useState("");
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState([]);
  const user = useQuery(USER);

  const [createBook] = useMutation(ADD_BOOK, {
    onError: (error) => {
      const messages = error.graphQLErrors.map((e) => e.message).join("\n");
      console.log(messages);
    },
    update: (cache, response) => {
      cache.updateQuery({ query: ALL_BOOKS }, ({ allBooks }) => {
        return {
          allBooks: allBooks.concat(response.data.addBook),
        };
      });
      cache.updateQuery(
        { query: RECOMMENDATIONS },
        ({ booksInFavouriteGenre }) => {
          const newRecommendations = response.data.addBook.genres.includes(
            user.data.me.favouriteGenre
          )
            ? booksInFavouriteGenre.concat(response.data.addBook)
            : booksInFavouriteGenre;
          return {
            booksInFavouriteGenre: newRecommendations,
          };
        }
      );
    },
  });

  const submit = async (event) => {
    event.preventDefault();

    const newBookDetails = {
      title: title,
      author: author,
      published: Number(published),
      genres: genres,
    };

    console.log("add book...");
    console.log(newBookDetails);

    createBook({
      variables: newBookDetails,
    });

    setTitle("");
    setPublished("");
    setAuthor("");
    setGenres([]);
    setGenre("");
  };

  const addGenre = () => {
    setGenres(genres.concat(genre));
    setGenre("");
  };

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(" ")}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  );
};

export default NewBook;
