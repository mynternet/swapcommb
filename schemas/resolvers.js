const { User, Item, SwapTransaction } = require("../models");
const { signToken } = require("../utils/auth");
const {
  AuthenticationError,
  UserInputError,
} = require("apollo-server-express");
const valid = require("card-validator");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (!context.user) {
        return null;
      }
      const user = await User.findById(context.user._id);
      const items = await Item.find({
        owner: user.username,
      });
      user.createdItems = items;
      return user;
    },
    createdItems: async (parent, args, context) => {
      if (!context.user) {
        return [];
      }

      const user = await User.findById(context.user._id).populate("savedItems");

      return user.savedItems;
    },
    getItemById: async (parent, { itemId }) => {
      return await Item.findById(itemId).populate("contributions");
    },
    getAllItems: async (parent) => {
      return await Item.find({});
    },
    itemsForSwap: async (_, { itemToChange }) => {
      try {
        // Fetch and return items where itemToChange matches
        const items = await Item.find({ itemToChange });
        return items;
      } catch (error) {
        console.error(error);
        throw new Error("Error fetching items for swap");
      }
    },
    swapHistory: async (_, { userId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }

      const swaps = await Item.find({
        $or: [
          { owner: context.user.username },
          { offerToUser: context.user.username },
          { requestByUser: context.user.username },
        ],
        $or: [{ itemStatus: "Accepted" }, { itemStatus: "Swapped" }],
      });

      return swaps.map((swap) => ({
        itemId: swap._id,
        itemName: swap.itemName,
        swappedWith:swap.offerToUser + swap.requestByUser,        
        offerToUser: swap.offerToUser + swap.requestByUser,
        requestByUser: swap.requestByUser,
      }));
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },

    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("No user found with this email address");
      }
      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);

      return { token, user };
    },

    addItem: async (
      parent,
      {
        description,
        owner,
        image,
        itemName,
        itemStatus,
        requestByUser,
        offerToUser,
        itemToChange,
        location,
        swappedWith,
      },
      context
    ) => {
      console.log(
        "Adding new item",
        description,
        owner,
        image,
        itemName,
        itemStatus,
        requestByUser,
        offerToUser,
        itemToChange,
        location,
        swappedWith,
        context.user._id
      );

      try {
        const newItem = await Item.create({
          description,
          owner,
          image,
          itemName,
          itemStatus,
          requestByUser,
          offerToUser,
          itemToChange,
          location,
          swappedWith,
        });

        // Fetch updated user's items
        const user = await User.findById(context.user._id);
        const items = await Item.find({ owner: user.username });
        user.createdItems = items;

        return user;
      } catch (err) {
        console.error("Error creating Item", err);
        throw new Error("Error creating Item");
      }
    },
    deleteItem: async (parent, { itemId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      try {
        await Item.findByIdAndDelete(itemId);
        return await User.findById(context.user._id).populate("createdItems");
      } catch (err) {
        console.error("Error deleting item", err);
        throw new Error("Error deleting item");
      }
    },
    addContribution: async (
      parent,
      { contributorUsername, contributedAmount, itemId, card }
    ) => {
      if (!valid.number(card.number).isValid) {
        throw new UserInputError("Invalid credit card number");
      }

      if (!valid.expirationMonth(card.expirationMonth).isValid) {
        throw new UserInputError("Invalid expiration month");
      }

      if (!valid.expirationYear(card.expirationYear).isValid) {
        throw new UserInputError("Invalid expiration year");
      }

      if (!valid.cvv(card.cvv).isValid) {
        throw new UserInputError("Invalid cvv");
      }

      if (!valid.cardholderName(card.name).isValid) {
        throw new UserInputError("Invalid name");
      }

      let item = await Item.findOneAndUpdate(
        { _id: itemId },
        {
          $addToSet: {
            contributions: {
              contributorUsername,
              contributedAmount,
            },
          },
        }
      );
      console.log("card", card);

      return await Item.findById(itemId).populate("contributions");
    },

    deleteItem: async (parent, { itemId }, context) => {
      try {
        // Remove the item
        await Item.findByIdAndDelete(itemId);

        // Get the updated user data
        const user = await User.findById(context.user._id).populate(
          "createdItems"
        );

        // Return the updated user object
        return user;
      } catch (err) {
        console.error("Error deleting item", err);
        throw new Error("Error deleting item");
      }
    },

    updateItemStatus: async (
      parent,
      { itemId, status, owner, requestByUser, offerToUser, itemToChange },
      context
    ) => {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }

      const updateFields = { itemStatus: status };

      console.log("Updating item status", itemId, status, owner, requestByUser);

      // Update owner to requestByUser if status is 'accepted'
      // if (status === "accepted") {
      //   updateFields.owner = context.user.username;
      // } else {
      //   if (owner) updateFields.owner = owner;
      // }
      if (status === "Accepted") {
        updateFields.owner = "test3";
      }
      if (status === "Swapped") {
        updateFields.owner = "test";
      }

      if (requestByUser) updateFields.requestByUser = requestByUser;
      if (offerToUser) updateFields.offerToUser = offerToUser;
      if (itemToChange) updateFields.itemToChange = itemToChange;

      try {
        const updatedItem = await Item.findByIdAndUpdate(itemId, updateFields, {
          new: true,
        });
        return updatedItem;
      } catch (err) {
        console.error("Error updating item status", err);
        throw new Error("Error updating item status");
      }
    },

    updateOwnerAcceptedTransaction: async (_, { itemToChange }) => {
      try {
        // Update all items that were offered for swap
        await Item.updateMany(
          { itemStatus: "OfferToSwap", itemToChange },
          {
            $set: {
              itemStatus: "Swapped",
              // owner: '$offerToUser'
              owner: "test",
            },
          }
        );

        // Fetch the item that was requested for swap
        const requestedItem = await Item.findOne({
          _id: itemToChange,
          itemStatus: "requestToSwap",
        });

        if (!requestedItem) {
          throw new Error("Requested item not found");
        }

        // Update the requested item status to "Accepted" and change its owner
        requestedItem.itemStatus = "Accepted";
        // requestedItem.owner = requestedItem.requestByUser;
        requestedItem.owner = "test3";
        await requestedItem.save();

        return requestedItem;
      } catch (error) {
        console.error("Error updating owner accepted transaction:", error);
        throw new Error("Failed to update owner accepted transaction");
      }
    },

    swapItems: async (_, { acceptedItemId, swappedItemId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }

      const acceptedItem = await Item.findById(acceptedItemId);
      const swappedItem = await Item.findById(swappedItemId);

      if (!acceptedItem || !swappedItem) {
        throw new UserInputError("One or more items not found");
      }

      // Additional authorization checks can be added here

      acceptedItem.owner = acceptedItem.requestByUser;
      swappedItem.owner = swappedItem.offerToUser;
      acceptedItem.itemStatus = "Accepted";
      swappedItem.itemStatus = "Swapped";

      await acceptedItem.save();
      await swappedItem.save();

      return { success: true, message: "Swap successful" };
    },

    createSwapTransaction: async (
      _,
      { itemOffered, itemRequested, offeredByUser, requestedByUser },
      context
    ) => {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        const newTransaction = new SwapTransaction({
          itemOffered,
          itemRequested,
          offeredByUser,
          requestedByUser,
        });

        await newTransaction.save();
        return newTransaction;
      } catch (error) {
        console.error("Error creating swap transaction:", error);
        throw new Error("Failed to create swap transaction: " + error.message);
      }
    },

    acceptSwapTransaction: async (_, { transactionId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }

      const transaction = await SwapTransaction.findById(
        transactionId
      ).populate("itemOffered itemRequested");
      if (!transaction) {
        throw new UserInputError("Transaction not found");
      }

      if (
        transaction.requestedByUser.toString() !== context.user._id.toString()
      ) {
        throw new AuthenticationError(
          "User not authorized to accept this transaction"
        );
      }

      // Implement transaction logic here

      return transaction;
    },
  },
};

module.exports = resolvers;
