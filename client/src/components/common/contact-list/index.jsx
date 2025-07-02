import { HOST } from "@/lib/constants";
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

/**
 * ContactList Component
 * Renders a list of contacts or channels.
 * Highlights selected contact/channel and updates chat state on click.
 */
const ContactList = ({ contacts, isChannel = false }) => {
  // Destructure required state and functions from global store
  const {
    selectedChatData,
    setSelectedChatType,
    setSelectedChatData,
    setSelectedChatMessages,
  } = useAppStore();

  /**
   * Handles click on a contact or channel
   * - Sets chat type (contact/channel)
   * - Updates selected chat data
   * - Clears messages if a different chat is selected
   */
  const handleClick = (contact) => {
    if (isChannel) setSelectedChatType("channel");
    else setSelectedChatType("contact");

    setSelectedChatData(contact);

    if (selectedChatData && selectedChatData._id !== contact._id) {
      setSelectedChatMessages([]);
    }
  };

  return (
    <div className="mt-5">
      {contacts.map((contact) => (
        <div
          key={contact._id}
          // Apply teal background if this contact is selected
          className={`pl-10 py-2  transition-all duration-300 cursor-pointer ${
            selectedChatData && selectedChatData._id === contact._id
              ? "bg-[#008080] hover:bg-[#20B2AA]" // active state
              : "hover:bg-[#f1f1f111] " // inactive hover
          }`}
          onClick={() => handleClick(contact)}
        >
          <div className="flex gap-5 items-center justify-start text-neutral-300">
            
            {/* Show Avatar if not a channel */}
            {!isChannel && (
              <Avatar className="h-10 w-10 ">
                {/* If image exists, show it */}
                {contact.image && (
                  <AvatarImage
                    src={`${HOST}/${contact.image}`}
                    alt="profile"
                    className="rounded-full bg-cover h-full w-full"
                  />
                )}

                {/* Fallback to first letter if no image */}
                <AvatarFallback
                  className={`uppercase ${
                    selectedChatData && selectedChatData._id === contact._id
                      ? "bg-[#ffffff22] border border-white/50" // selected fallback style
                      : getColor(contact.color) // dynamic background from color
                  } h-10 w-10 flex items-center justify-center rounded-full`}
                >
                  {contact.firstName.split("").shift()}
                </AvatarFallback>
              </Avatar>
            )}

            {/* Channel icon for channels */}
            {isChannel && (
              <div className={` bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full`}>
                #
              </div>
            )}

            {/* Show name: channel name or full name */}
            {isChannel ? (
              <span>{contact.name}</span>
            ) : (
              <span>{`${contact.firstName} ${contact.lastName}`}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactList;
