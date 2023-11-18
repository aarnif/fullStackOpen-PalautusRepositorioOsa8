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
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (args.genre) {
        return await Book.find({ genres: { $in: [args.genre] } }).populate(
          "author"
        );
      }
      return await Book.find().populate("author");
    },
    allAuthors: async () => await Author.find({}),
  },

  Author: {
    bookCount: async (root) => {
      const allBooks = await Book.find({}).populate("author");
      return allBooks.filter((book) => book.author.name === root.name).length;
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
