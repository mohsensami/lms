// import mongoose from "mongoose";

// export async function dbConnect() {
//   try {
//     const conn = await mongoose.connect(
//       String(process.env.MONGODB_CONNECTION_STRING),
//     );
//     return conn;
//   } catch (error) {
//     console.log(error);
//   }
// }

import mongoose from "mongoose";

export async function dbConnect() {
  try {
    if (mongoose.connections[0].readyState) {
      return;
    }

    await mongoose.connect(String(process.env.MONGODB_CONNECTION_STRING));

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB Error:", error);
    throw error;
  }
}
