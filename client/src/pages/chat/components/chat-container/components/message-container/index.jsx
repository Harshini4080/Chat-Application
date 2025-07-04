import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import apiClient from "@/lib/api-client";
import {
  FETCH_ALL_MESSAGES_ROUTE,
  GET_CHANNEL_MESSAGES,
  HOST,
  MESSAGE_TYPES,
} from "@/lib/constants";
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { IoMdArrowRoundDown } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import { MdFolderZip } from "react-icons/md";

const MessageContainer = () => {
  // Local state for image preview modal
  const [showImage, setShowImage] = useState(false);
  const [imageURL, setImageURL] = useState(null);

  const {
    selectedChatData,
    setSelectedChatMessages,
    selectedChatMessages,
    selectedChatType,
    userInfo,
    setDownloadProgress,
    setIsDownloading,
  } = useAppStore();

  // Ref to scroll into view
  const messageEndRef = useRef(null);

  // Fetch messages when chat changes
  useEffect(() => {
    const getMessages = async () => {
      const response = await apiClient.post(
        FETCH_ALL_MESSAGES_ROUTE,
        { id: selectedChatData._id },
        { withCredentials: true }
      );
      if (response.data.messages) {
        setSelectedChatMessages(response.data.messages);
      }
    };

    const getChannelMessages = async () => {
      const response = await apiClient.get(
        `${GET_CHANNEL_MESSAGES}/${selectedChatData._id}`,
        { withCredentials: true }
      );
      if (response.data.messages) {
        setSelectedChatMessages(response.data.messages);
      }
    };

    if (selectedChatData._id) {
      if (selectedChatType === "contact") getMessages();
      else if (selectedChatType === "channel") getChannelMessages();
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages]);

  // Check if file is an image
  const checkIfImage = (filePath) => {
    const imageRegex = /\.(jpg|jpeg|png|gif|bmp|tiff|webp|svg|ico|heic)$/i;
    return imageRegex.test(filePath);
  };

  // Download any file (image or zip)
  const downloadFile = async (url) => {
    setIsDownloading(true);
    setDownloadProgress(0);
    const response = await apiClient.get(`${HOST}/${url}`, {
      responseType: "blob",
      onDownloadProgress: (e) => {
        const percent = Math.round((e.loaded * 100) / e.total);
        setDownloadProgress(percent);
      },
    });

    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", url.split("/").pop());
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
    setIsDownloading(false);
    setDownloadProgress(0);
  };

  // Render all messages, grouped by date
  const renderMessages = () => {
    let lastDate = null;

    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;

      return (
        <div key={index}>
          {showDate && (
            <div className="text-center text-gray-500 my-2">
              {moment(message.timestamp).format("LL")}
            </div>
          )}
          {selectedChatType === "contact"
            ? renderPersonalMessages(message)
            : renderChannelMessages(message)}
        </div>
      );
    });
  };

  // Render messages in personal (1-1) chats
  const renderPersonalMessages = (message) => (
    <div className={`message ${message.sender === selectedChatData._id ? "text-left" : "text-right"}`}>
      {/* Text message */}
      {message.messageType === MESSAGE_TYPES.TEXT && (
        <div
          className={`${
            message.sender !== selectedChatData._id
              ? "bg-[#008080]/5 text-[#008080]/90 border-[#008080]/50"
              : "bg-[#008080]/50 text-white/80 border-[#ffffff]/20"
          } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
        >
          {message.content}
        </div>
      )}

      {/* File message (image or zip) */}
      {message.messageType === MESSAGE_TYPES.FILE && (
        <div
          className={`${
            message.sender !== selectedChatData._id
              ? "bg-[#008080]/5 text-[#8417ff]/90 border-[#008080]/50"
              : "bg-[#2a2b33]/50 text-white/80 border-[#ffffff]/20"
          } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
        >
          {checkIfImage(message.fileUrl) ? (
            <div className="cursor-pointer" onClick={() => {
              setShowImage(true);
              setImageURL(message.fileUrl);
            }}>
              <img src={`${HOST}/${message.fileUrl}`} alt="attachment" height={300} width={300} />
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <span className="text-white/80 text-3xl bg-black/20 rounded-full p-3">
                <MdFolderZip />
              </span>
              <span>{message.fileUrl.split("/").pop()}</span>
              <span className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer"
                onClick={() => downloadFile(message.fileUrl)}>
                <IoMdArrowRoundDown />
              </span>
            </div>
          )}
        </div>
      )}

      {/* Timestamp */}
      <div className="text-xs text-gray-600">
        {moment(message.timestamp).format("LT")}
      </div>
    </div>
  );

  // Render messages in channel group chats
  const renderChannelMessages = (message) => (
    <div className={`mt-5 ${message.sender._id !== userInfo.id ? "text-left" : "text-right"}`}>
      {/* Text message */}
      {message.messageType === MESSAGE_TYPES.TEXT && (
        <div
          className={`${
            message.sender._id === userInfo.id
              ? "bg-[##008080]/5 text-[#8417ff]/90 border-[##008080]/50"
              : "bg-[#2a2b33]/50 text-white/80 border-[#ffffff]/20"
          } border inline-block p-4 rounded my-1 max-w-[50%] break-words ml-9`}
        >
          {message.content}
        </div>
      )}

      {/* File message */}
      {message.messageType === MESSAGE_TYPES.FILE && (
        <div
          className={`${
            message.sender._id === userInfo.id
              ? "bg-[##008080]/5 text-[##008080]/90 border-[##008080]/50"
              : "bg-[#2a2b33]/50 text-white/80 border-[#ffffff]/20"
          } border inline-block p-4 rounded my-1 max-w-[50%] break-words ml-9`}
        >
          {checkIfImage(message.fileUrl) ? (
            <div className="cursor-pointer" onClick={() => {
              setShowImage(true);
              setImageURL(message.fileUrl);
            }}>
              <img src={`${HOST}/${message.fileUrl}`} alt="attachment" height={300} width={300} />
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <span className="text-white/80 text-3xl bg-black/20 rounded-full p-3">
                <MdFolderZip />
              </span>
              <span>{message.fileUrl.split("/").pop()}</span>
              <span className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer"
                onClick={() => downloadFile(message.fileUrl)}>
                <IoMdArrowRoundDown />
              </span>
            </div>
          )}
        </div>
      )}

      {/* Sender details and time */}
      {message.sender._id !== userInfo.id ? (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {message.sender.image && (
              <AvatarImage
                src={`${HOST}/${message.sender.image}`}
                alt="profile"
                className="rounded-full"
              />
            )}
            <AvatarFallback className={`uppercase h-8 w-8 flex ${getColor(message.sender.color)} items-center justify-center rounded-full`}>
              {message.sender.firstName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-white/60">
            {`${message.sender.firstName} ${message.sender.lastName}`}
          </span>
          <div className="text-xs text-white/60">
            {moment(message.timestamp).format("LT")}
          </div>
        </div>
      ) : (
        <div className="text-xs text-white/60 mt-1">
          {moment(message.timestamp).format("LT")}
        </div>
      )}
    </div>
  );

  // Final return: messages list and full-image modal
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 w-full md:w-[65vw] lg:w-[70vw] xl:w-[80vw]">
      {renderMessages()}
      <div ref={messageEndRef} />
      {showImage && (
        <div className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg flex-col">
          <img src={`${HOST}/${imageURL}`} className="h-[80vh] w-full bg-cover" alt="preview" />
          <div className="flex gap-5 fixed top-0 mt-5">
            <button
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50"
              onClick={() => downloadFile(imageURL)}
            >
              <IoMdArrowRoundDown />
            </button>
            <button
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50"
              onClick={() => {
                setShowImage(false);
                setImageURL(null);
              }}
            >
              <IoCloseSharp />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageContainer;
