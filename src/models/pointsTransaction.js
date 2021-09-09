const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { PENDING, COMPLETED, EXPIRED } = require("../utils/constants");

const pointsTransactionSchema = new mongoose.Schema(
  {
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    points: {
      type: Number,
      min: 0,
      required: true,
    },
    status: {
      type: Number,
      enum: [PENDING , COMPLETED , EXPIRED],
      required: true
    }
  },
  { timestamps: true }
);

pointsTransactionSchema.statics.transfer = async (fromUser , toId , points) => {
  try {
    const newTransaction = new PointsTransaction();

    newTransaction.from = fromUser._id;
    newTransaction.to = toId;
    newTransaction.points = points;
    newTransaction.status = PENDING;
    await newTransaction.save();

    fromUser.points = fromUser.points - points;
    await fromUser.save();

    return newTransaction;
  } catch (error) {
    throw new Error(error);
  }
}

pointsTransactionSchema.methods.generateConfirmationToken = function  (){
  try {

    const transaction = this;
    const token = jwt.sign(
      { transactionId: transaction._id.toString() },
      process.env.JWT_SECRET_KEY,
      {expiresIn : "10m"}
    );

    return token;
  } catch (error) {
    throw new Error()
  }

}

pointsTransactionSchema.methods.confirmPoints = function (){
  try {

    const transaction = this;
    transaction.status = COMPLETED;

    const toUser = transaction.to;
    toUser.points += transaction.points;

    transaction.save();
    toUser.save();

    return true;
  } catch (error) {
    throw new Error(error)
  }
}

pointsTransactionSchema.methods.declinePoints = function (){
  try {

    const transaction = this;
    transaction.status = EXPIRED;

    const fromUser = transaction.from;
    fromUser.points += transaction.points;

    transaction.save();
    fromUser.save();

    return true;
  } catch (error) {
    throw new Error()
  }

}

const PointsTransaction = mongoose.model("PointsTransaction", pointsTransactionSchema);

module.exports = PointsTransaction;
