import { ALL_BOOKS, USER, RECOMMENDATIONS } from "../queries";
import { useQuery } from "@apollo/client";

const Recommendations = () => {
  const books = useQuery(ALL_BOOKS);
  const user = useQuery(USER);
  const recommendedBooks = useQuery(RECOMMENDATIONS);

  if (books.loading) {
    return <div>Loading books...</div>;
  }

  if (user.loading) {
    return <div>Loading user info...</div>;
  }

  if (recommendedBooks.loading) {
    return <div>Loading recommended books...</div>;
  }

  console.log(user);
  console.log(recommendedBooks);

  return (
    <div>
      <h2>recommendations</h2>
      <div>
        books in your favourite genre
        <strong> {user.data.me.favouriteGenre}</strong>
      </div>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {recommendedBooks.data.booksInFavouriteGenre.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Recommendations;
