import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

const Profile = () => {
  const navigate = useNavigate();
  const [roleName, setRoleName] = useState(" ");
  const [userProfile, setUserProfile] = useState({
    username: " ",
    email: " ",
    firstName: " ",
    lastName: " ",
    role_id: " ",
    profilePicture: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp", 
  });
  const [isEditing, setIsEditing] = useState(false); 
  const [emailError, setEmailError] = useState(""); 

  // Fetch user and role data
  const getData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/auth/isAuthenticated`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const userData = await response.json();

      if (!response.ok) {
        throw new Error("User authentication failed");
      }

      const roleResponse = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/role/getAll`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const roles = await roleResponse.json();

      const userRole = roles.find((role) => role.id === userData.roleId);
      if (userRole) {
        setRoleName(userRole.roleName);
      }

      setUserProfile({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to fetch user data");
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (name === "email") {
      setEmailError(""); 
    }
  };

  // Validate email function
  const validateEmail = (email) => {
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError(""); 
    return true;
  };

  const saveProfileChanges = async () => {
   
    if (!validateEmail(userProfile.email)) {
      return; 
    }

    try {
     
      const updatedData = {
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
      };

     
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/auth/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to save changes");

      toast.success("Profile updated successfully!");
      setIsEditing(false); 
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile changes.");
    }
  };

  useEffect(() => {
    getData();
  }, []); 

  
  const handleLogout = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) throw new Error(`Logout failed with status: ${response.status}`);
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (err) {
      toast.error("Failed to logout");
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="min-h-screen flex pb-20 items-center justify-center bg-gray-100">
      <div className="w-full max-w-4xl bg-white shadow-black p-8 rounded-lg shadow-lg ">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8">My Profile</h1>

        <div className="flex items-center gap-10 justify-center space-x-6 mb-8">
          <div className="pl-9 relative w-95 h-65">
            <img
              alt="Profile"
              src= "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              className="w-full h-full rounded-full object-cover border-4 border-gray-300"
            />
          </div>

          <div className="w-full">
            <div className="mb-4">
              {isEditing ? (
                <>
                  <p className="text-lg font-medium text-gray-600">First Name</p>
                  <input
                    type="text"
                    name="firstName"
                    value={userProfile.firstName}
                    onChange={handleInputChange}
                    className="text-xl text-gray-800 p-2 border border-gray-300 rounded-md w-full"
                  />
                </>
              ) : (
                <p className="text-lg font-medium text-gray-600">
                  First Name : <span className="text-xl text-gray-800">{userProfile.firstName}</span>
                </p>
              )}
            </div>

            <div className="mb-4">
              {isEditing ? (
                <>
                  <p className="text-lg font-medium text-gray-600">Last Name</p>
                  <input
                    type="text"
                    name="lastName"
                    value={userProfile.lastName}
                    onChange={handleInputChange}
                    className="text-xl text-gray-800 p-2 border border-gray-300 rounded-md w-full"
                  />
                </>
              ) : (
                <p className="text-lg font-medium text-gray-600">
                  Last Name : <span className="text-xl text-gray-800"> {userProfile.lastName}</span>
                </p>
              )}
            </div>

            <div className="mb-4">
              {isEditing ? (
                <>
                  <p className="text-lg font-medium text-gray-600">Email :</p>
                  <input
                    type="email"
                    name="email"
                    value={userProfile.email}
                    onChange={handleInputChange}
                    className="text-xl text-gray-800 p-2 border border-gray-300 rounded-md w-full"
                  />
                  {emailError && <p className="text-red-500 text-sm">{emailError}</p>} {/* Show error message */}
                </>
              ) : (
                <p className="text-lg font-medium text-gray-600">
                  Email : <span className="text-xl text-gray-800"> {userProfile.email}</span>
                </p>
              )}
            </div>

            <div className="mb-4">
              <p className="text-lg font-medium text-gray-600">
                Role :<span className="text-xl text-gray-800"> {roleName}</span>{" "}
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          {isEditing ? (
            <>
              <button
                className="bg-green-500 text-white py-2 px-6 rounded-md hover:bg-green-700"
                onClick={saveProfileChanges}>
                Save Changes
              </button>
              <button
                className="ml-4 bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-700"
                onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </>
          ) : (
            <button
              className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-700"
              onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          )}
        </div>

        <div className="text-center mt-8">
          <button className="bg-red-500 text-white py-2 px-6 rounded-md hover:bg-red-700" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
