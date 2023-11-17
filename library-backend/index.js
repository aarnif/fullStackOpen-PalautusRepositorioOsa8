const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const Author = require("./models/author");
const Book = require("./models/book");

require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log("connecting to", MONGODB_URI);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connection to MongoDB:", error.message);
  });

const typeDefs = `
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!,
    born: Int,
    id: String!,
    bookCount: Int,
  }

  type Query {
    bookCount: Int
    authorCount: Int
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
      title: String!,
      published: Int!,
      author: String!,
      id: String,
      genres: [String],
    ): Book
  }

  type Mutation {
    editAuthor(name: String!, setBornTo: Int): Author
  }
`;

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => {
      if (args.author) {
        console.log("Filter books by author");
        books = books.filter((book) => book.author === args.author);
      }
      if (args.genre) {
        console.log("Filter books by genre");
        books = books.filter((book) => book.genres.includes(args.genre));
      }
      return books;
    },
    allAuthors: () => authors,
  },
  Author: {
    bookCount: (root) => {
      return books.filter((book) => book.author === root.name).length;
    },
  },
  Mutation: {
    addBook: async (root, args) => {
      let bookAuthor = null;
      const findAuthor = await Author.findOne({ name: args.author });
      if (!findAuthor) {
        bookAuthor = new Author({ name: args.author, born: null });
        await bookAuthor.save();
      } else {
        bookAuthor = findAuthor;
      }
      const newBook = new Book({
        title: args.title,
        published: args.published,
        author: bookAuthor,
        genres: args.genres,
      });
      return await newBook.save();
    },
    editAuthor: async (root, args) => {
      console.log("Edit author");
      const findAuthor = await Author.findOne({ name: args.name });
      console.log(findAuthor);
      findAuthor.born = args.setBornTo;
      return findAuthor.save();
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
