import { SOCKET_HOST } from "@/lib/constants"; 
import { useAppStore } from "@/store"; 
import React, { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client"; 

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

// SocketProvider wraps around app components to manage socket connection lifecycle
export const SocketProvider = ({ children }) => {
  const socket = useRef(); 
  const { userInfo } = useAppStore(); 

  useEffect(() => {
    if (userInfo) {
      // Initialize socket connection with userId as query param
      socket.current = io(SOCKET_HOST, {
        withCredentials: true,
        query: { userId: userInfo.id },
      });

      // Log connection success
      socket.current.on("connect", () => {
        console.log("Connected to socket server");
      });

      // Handle incoming direct messages
      const handleReceiveMessage = (message) => {
        const {
          selectedChatData: currentChatData,
          selectedChatType: currentChatType,
          addMessage,
          addContactInDMContacts,
        } = useAppStore.getState(); 

        // Add message if it belongs to the currently open DM
        if (
          currentChatType !== undefined &&
          (currentChatData._id === message.sender._id ||
            currentChatData._id === message.recipient._id)
        ) {
          addMessage(message);
        }

        // Always update contact list with sender info
        addContactInDMContacts(message);
      };

      // Handle messages sent to a channel
      const handleReceiveChannelMessage = (message) => {
        const {
          selectedChatData,
          selectedChatType,
          addMessage,
          addChannelInChannelLists,
        } = useAppStore.getState();

        // Add message if it belongs to the currently selected channel
        if (
          selectedChatType !== undefined &&
          selectedChatData._id === message.channelId
        ) {
          addMessage(message);
        }

        // Update channel preview in channel list
        addChannelInChannelLists(message);
      };

      // Add new channel to global state when one is created
      const addNewChannel = (channel) => {
        const { addChannel } = useAppStore.getState();
        addChannel(channel);
      };

      // Register all event listeners
      socket.current.on("receiveMessage", handleReceiveMessage);
      socket.current.on("recieve-channel-message", handleReceiveChannelMessage);
      socket.current.on("new-channel-added", addNewChannel);

      // Cleanup on component unmount
      return () => {
        socket.current.disconnect(); // Close socket connection
      };
    }
  }, [userInfo]); 

  // Provide socket instance to children components
  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
