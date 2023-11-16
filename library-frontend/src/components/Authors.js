import { ALL_AUTHORS, UPDATE_AUTHOR } from "../queries";
import { useQuery, useMutation } from "@apollo/client";
import { useState } from "react";

const SetBirthYear = () => {
  const [name, setName] = useState("");
  const [born, setBorn] = useState("");

  const [updateAuthor] = useMutation(UPDATE_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    const updatedAuthorDetails = {
      name: name,
      born: Number(born),
    };

    console.log("Update author");
    console.log(updatedAuthorDetails);

    updateAuthor({
      variables: updatedAuthorDetails,
    });

    setName("");
    setBorn("");
  };

  return (
    <>
      <h3>Set birthyear</h3>
      <form onSubmit={handleSubmit}>
        <div>
          name
          <input
            value={name}
            onChange={({ target }) => setName(target.value)}
          />
        </div>
        <div>
          born
          <input
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </>
  );
};

const Authors = () => {
  const result = useQuery(ALL_AUTHORS);

  if (result.loading) {
    return <div>Loading authors...</div>;
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {result.data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <SetBirthYear />
    </div>
  );
};

export default Authors;
