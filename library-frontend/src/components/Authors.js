import { ALL_AUTHORS, UPDATE_AUTHOR } from "../queries";
import { useQuery, useMutation } from "@apollo/client";
import { useState } from "react";
import Select from "react-select";

const SetBirthYear = ({ authors }) => {
  const [born, setBorn] = useState("");
  const [name, setName] = useState("");

  const authorNames = authors.map((author) => {
    return { value: author.name, label: author.name };
  });

  const [updateAuthor] = useMutation(UPDATE_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    const updatedAuthorDetails = {
      name: name.value,
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
          <Select
            defaultValue={name}
            onChange={setName}
            options={authorNames}
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
      <SetBirthYear authors={result.data.allAuthors} />
    </div>
  );
};

export default Authors;
