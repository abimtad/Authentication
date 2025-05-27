import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log("Mongodb started successfully: ", conn.connection.host);
  } catch (error) {
    console.log("Error Occurred while Connecting", error.message);
  }
};
