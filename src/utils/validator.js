const Mongoose = require("mongoose");

const verifyObjectId = (id) => {
    if (!Mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid ID");
      }
}

module.exports = {
    verifyObjectId
}