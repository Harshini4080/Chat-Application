import Message from "../model/MessagesModel.js";
import { mkdirSync, renameSync } from "fs";

// Controller to fetch all messages between two users
export const getMessages = async (req, res, next) => {
  try {
    const user1 = req.userId;      // Authenticated user
    const user2 = req.body.id;     // Target user

    // Validate both user IDs are provided
    if (!user1 || !user2) {
      return res.status(400).send("Both user IDs are required.");
    }

    // Fetch messages where sender/recipient is either user1 or user2
    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    }).sort({ timestamp: 1 });  // Sort chronologically

    return res.status(200).json({ messages });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

// Controller to upload a file and return its path
export const uploadFile = async (request, response, next) => {
  try {
    if (request.file) {
      const date = Date.now();   // Use timestamp to create unique directory
      let fileDir = `uploads/files/${date}`;
      let fileName = `${fileDir}/${request.file.originalname}`;

      // Create nested directories recursively if not present
      mkdirSync(fileDir, { recursive: true });

      // Move file from temporary path to desired directory
      renameSync(request.file.path, fileName);

      return response.status(200).json({ filePath: fileName });
    } else {
      return response.status(404).send("File is required.");
    }
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error.");
  }
};
