const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");

const Author = require("./models/author");
const Book = require("./models/book");
const User = require("./models/user");

const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();

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
    allGenres: async (root, args) => {
      const allGenres = [];
      const allBooks = await Book.find({});

      allBooks.forEach((book) => {
        book.genres.forEach((genre) => {
          if (!allGenres.includes(genre)) allGenres.push(genre);
        });
      });

      allGenres.push("all genres");

      return allGenres;
    },
    booksInFavouriteGenre: async (root, args, context) => {
      const currentUser = context.currentUser;
      return await Book.find({
        genres: { $in: [currentUser.favouriteGenre] },
      }).populate("author");
    },
    me: (root, args, context) => {
      return context.currentUser;
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser;

      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      let bookAuthor = null;
      const findAuthor = await Author.findOne({ name: args.author });
      if (!findAuthor) {
        bookAuthor = new Author({
          name: args.author,
          born: null,
          bookCount: 1,
        });
        try {
          await bookAuthor.save();
        } catch (error) {
          throw new GraphQLError("Saving author failed", {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: args.name,
              error,
            },
          });
        }
      } else {
        bookAuthor = findAuthor;
        await Author.findOneAndUpdate(
          { name: bookAuthor.name },
          { bookCount: bookAuthor.bookCount + 1 }
        );
      }
      const newBook = new Book({
        title: args.title,
        published: args.published,
        author: bookAuthor,
        genres: [...args.genres],
      });

      try {
        await newBook.save();
      } catch (error) {
        throw new GraphQLError("Saving book failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.title,
            error,
          },
        });
      }

      pubsub.publish("BOOK_ADDED", { bookAdded: newBook });

      return newBook;
    },
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser;

      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const findAuthor = await Author.findOne({ name: args.name });
      if (!findAuthor) {
        throw new GraphQLError("Could not find author", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.name,
          },
        });
      }
      findAuthor.born = args.setBornTo;
      return await findAuthor.save();
    },
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favouriteGenre: args.favouriteGenre,
      });

      try {
        return user.save();
      } catch (error) {
        throw new GraphQLError("Creating the user failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
            error,
          },
        });
      }
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secret") {
        throw new GraphQLError("wrong credentials", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator("BOOK_ADDED"),
    },
  },
};

module.exports = resolvers;
