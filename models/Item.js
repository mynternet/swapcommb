const { Schema, model } = require("mongoose");
const contributionSchema = require("./Contribution");

const dateFormatter = (date) => {
  return date.toDateString();
};

const itemSchema = new Schema(
  {
    description: {
      type: String,
      required: true,
    },
    owner: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      get: dateFormatter,
    },
    itemName: {
      type: String,
      required: true,
    },
    itemStatus: {
      type: String,
      enum: ["accepted", "rejected", "pending"], 
      default: "pending", 
    },
    requestByUser: {
      type: String,
      default: "",
    },
    offerToUser: {
      type: String,
      default: "",
    },
    location: { // Added location field
      type: String,
      required: true, // Assuming location is required; adjust as needed
    },
    swappedWith: {
      type: Schema.Types.ObjectId, 
      ref: 'Item',
      required: false,
      default: "", 
    },
    contributions: [contributionSchema],
    itemToChange: {
      type: Schema.Types.ObjectId, 
      ref: 'Item', 
      required: false 
    }
  },
  {
    toJSON: {
      getters: true,
    },
  }
);

const Item = model("item", itemSchema);

module.exports = Item;
