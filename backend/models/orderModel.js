// import mongoose from "mongoose";

// const orderSchema = new mongoose.Schema(
//   {
//     items: [
//       {
//         itemId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "FoodItem",
//           required: true,
//         },
//         orderedQuantity: {
//           type: Number,
//           required: true,
//         },
//       },
//     ],
//     recipientId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     location: {
//       type: String,
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["pending", "delivered"],
//       default: "pending",
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Order", orderSchema);
