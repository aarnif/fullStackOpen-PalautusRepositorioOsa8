import { gql } from "@apollo/client";

export const ALL_AUTHORS = gql`
  query ExampleQuery {
    allAuthors {
      name
      born
      bookCount
    }
  }
`;
