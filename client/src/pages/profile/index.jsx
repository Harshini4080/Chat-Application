// Import required dependencies and components
import { useAppStore } from "@/store";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/api-client";
import {
  ADD_PROFILE_IMAGE_ROUTE,
  HOST,
  REMOVE_PROFILE_IMAGE_ROUTE,
  UPDATE_PROFLE_ROUTE,
} from "@/lib/constants";
import { useState, useRef, useEffect } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { IoArrowBack } from "react-icons/io5";
import { colors } from "@/lib/utils";

const Profile = () => {
  const { userInfo, setUserInfo } = useAppStore(); // Access global store
  const [firstName, setFirstName] = useState(""); // First name state
  const [lastName, setLastName] = useState(""); // Last name state
  const [image, setImage] = useState(null); // Profile image state
  const [hovered, setHovered] = useState(false); // Hover state for avatar
  const fileInputRef = useRef(null); // Ref for hidden file input
  const navigate = useNavigate(); // Router navigation
  const [selectedColor, setSelectedColor] = useState(0); // Profile color index

  // Pre-fill form data when component mounts
  useEffect(() => {
    if (userInfo.profileSetup) {
      setFirstName(userInfo.firstName);
      setLastName(userInfo.lastName);
      setSelectedColor(userInfo.color);
    }
    if (userInfo.image) {
      setImage(`${HOST}/${userInfo.image}`);
    }
  }, [userInfo]);

  // Validate form inputs
  const validateProfile = () => {
    if (!firstName) return toast.error("First Name is Required.");
    if (!lastName) return toast.error("Last Name is Required.");
    return true;
  };

  // Handle profile update API call
  const saveChanges = async () => {
    if (validateProfile()) {
      try {
        const response = await apiClient.post(
          UPDATE_PROFLE_ROUTE,
          { firstName, lastName, color: selectedColor },
          { withCredentials: true }
        );
        if (response.status === 200 && response.data) {
          setUserInfo({ ...response.data });
          toast.success("Profile Updated Successfully.");
          navigate("/chat");
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Handle profile image upload
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("profile-image", file);
      const response = await apiClient.post(ADD_PROFILE_IMAGE_ROUTE, formData, {
        withCredentials: true,
      });
      if (response.status === 200 && response.data.image) {
        setUserInfo({ ...userInfo, image: response.data.image });
        toast.success("Image updated successfully.");
      }
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle image delete request
  const handleDeleteImage = async () => {
    try {
      const response = await apiClient.delete(REMOVE_PROFILE_IMAGE_ROUTE, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setUserInfo({ ...userInfo, image: null });
        setImage(undefined);
        toast.success("Image Removed Successfully.");
      }
    } catch (error) {
      console.log({ error });
    }
  };

  // Open file picker
  const handleFileInputClick = () => fileInputRef.current.click();

  // Navigate back to chat if profile already setup
  const handleNavigate = () => {
    if (userInfo.profileSetup) navigate("/chat");
    else toast.error("Please setup profile.");
  };

  return (
    <div className="bg-[#1b1c24] h-[100vh] flex items-center justify-center flex-col gap-10">
      <div className="w-[80vw] md:w-max flex flex-col gap-10">
        {/* Back button */}
        <div>
          <IoArrowBack
            className="text-4xl lg:text-6xl text-white text-opacity-90 cursor-pointer"
            onClick={handleNavigate}
          />
        </div>

        {/* Profile form grid */}
        <div className="grid grid-cols-2">
          {/* Profile picture section */}
          <div
            className="h-full w-32 md:w-48 md:h-48 relative flex items-center justify-center"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <Avatar className="h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden">
              {image ? (
                <AvatarImage
                  src={image}
                  alt="profile"
                  className="object-cover w-full h-full bg-black"
                />
              ) : (
                <div className="uppercase h-32 w-32 md:w-48 md:h-48 text-5xl bg-[#712c4a57] text-[#ff006e] border-[1px] border-[#ff006faa] flex items-center justify-center rounded-full">
                  {firstName ? firstName[0] : userInfo.email[0]}
                </div>
              )}
            </Avatar>

            {/* Hover overlay for add/remove image */}
            {hovered && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer"
                onClick={image ? handleDeleteImage : handleFileInputClick}
              >
                {image ? (
                  <FaTrash className="text-white text-3xl cursor-pointer" />
                ) : (
                  <FaPlus className="text-white text-3xl cursor-pointer" />
                )}
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageChange}
              accept=".png, .jpg, .jpeg, .svg, .webp"
              name="profile-image"
            />
          </div>

          {/* Input fields */}
          <div className="flex min-w-32 md:min-w-64 flex-col gap-5 text-white items-center justify-center">
            <Input
              placeholder="Email"
              type="email"
              className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              disabled
              value={userInfo.email}
            />
            <Input
              placeholder="First Name"
              type="text"
              className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              placeholder="Last Name"
              type="text"
              className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />

            {/* Color selection */}
            <div className="w-full flex gap-5">
              {colors.map((color, index) => (
                <div
                  key={index}
                  className={`${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-100 ${
                    selectedColor === index ? "outline outline-white" : ""
                  }`}
                  onClick={() => setSelectedColor(index)}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="w-full">
          <Button
            className="h-16 w-full bg-teal-700 hover:bg-teal-900 transition-all duration-300"
            onClick={saveChanges}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
