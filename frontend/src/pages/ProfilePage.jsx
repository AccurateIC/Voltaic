// import React, { useState, useEffect } from "react";
// import { toast } from "sonner";
// import { useNavigate } from "react-router";

// const Profile = () => {
//   const navigate = useNavigate();
//   const [roleName, setRoleName] = useState(" ");
//   const [userProfile, setUserProfile] = useState({
//     username: " ",
//     email: " ",
//     firstName: " ",
//     lastName: " ",
//     role_id: " ",
//     profilePicture: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp", // Default profile picture
//   });
//   const [isEditing, setIsEditing] = useState(false); // Toggle editing mode
//   const [newProfilePic, setNewProfilePic] = useState(null);

//   // Fetch user and role data
//   const getData = async () => {
//     try {
//       const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/auth/isAuthenticated`, {
//         method: "GET",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//       });
//       const userData = await response.json();

//       if (!response.ok) {
//         throw new Error("User authentication failed");
//       }

//       const roleResponse = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/role/getAll`, {
//         method: "GET",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//       });
//       const roles = await roleResponse.json();

//       const userRole = roles.find((role) => role.id === userData.roleId);
//       if (userRole) {
//         setRoleName(userRole.roleName);
//       }

//       setUserProfile({
//         firstName: userData.firstName,
//         lastName: userData.lastName,
//         email: userData.email,
//         role_id: userData.roleId,
//         profilePicture: userData.profilePicture || userProfile.profilePicture, // If profile picture exists in user data, set it
//       });
//     } catch (error) {
//       console.error("Error fetching user data:", error);
//       toast.error("Failed to fetch user data");
//     }
//   };

//   // Handle file change for profile picture
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setNewProfilePic(reader.result); // Update the profile picture preview
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   // Handle input changes for editable fields
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setUserProfile((prevState) => ({
//       ...prevState,
//       [name]: value,
//     }));
//   };

//   // Update profile (save changes)
//   const saveProfileChanges = async () => {
//     try {
//       const updatedData = { ...userProfile, profilePicture: newProfilePic || userProfile.profilePicture };

//       // Send updated data to backend (use appropriate API endpoint)
//       const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/user/update`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updatedData),
//         credentials: "include",
//       });

//       if (!response.ok) throw new Error("Failed to save changes");

//       toast.success("Profile updated successfully!");
//       setIsEditing(false); // Exit editing mode after saving
//     } catch (error) {
//       console.error("Error saving profile:", error);
//       toast.error("Failed to save profile changes.");
//     }
//   };

//   useEffect(() => {
//     getData();
//   }, []); // Fetch user data on mount

//   // Logout functionality
//   const handleLogout = async () => {
//     try {
//       const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/auth/logout`, {
//         method: "POST",
//         credentials: "include",
//       });

//       if (!response.ok) throw new Error(`Logout failed with status: ${response.status}`);
//       toast.success("Logged out successfully!");
//       navigate("/");
//     } catch (err) {
//       toast.error("Failed to logout");
//       console.error("Logout error:", err);
//     }
//   };

//   return (
//     <div className="min-h-[90vh]  p-6 flex-auto">
//       <div className="min-h-[80vh] max-w-6xl  mx-auto bg-white p-8 rounded-lg shadow-lg">
//         <h1 className="flex justify-center justify-items-center text-3xl font-semibold text-center text-gray-800">My Profile</h1>

//         <div className="flex justify-evenly   mt-25">
//           <div className="w-60 h-60 rounded-full flex items-center justify-center overflow-hidden relative">
//             {/* <img
//               alt="Profile picture"
//               src={newProfilePic || userProfile.profilePicture}
//               className="object-cover w-full h-full"
//             />
//             <div
//               className="absolute top-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer"
//               onClick={() => setIsEditing(true)}
//             >
//               <span className="text-2xl">+</span>
//             </div> */}
//              <div className="relative inline-block">
//           <img
//             src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
//             alt="Profile"
//             className="w-60 h-60 rounded-full mx-auto object-cover border-4 border-gray-300"
//           />

//           <input
//             type="file"
//             onChange={handleFileChange}
//             accept="image/*"
//             className="absolute bottom-0 right-0 bg-gray-500 text-white p-2 rounded-full cursor-pointer opacity-0 hover:opacity-100"
//           />
//         </div>

//           </div>

//           <div className="mt-6">
//             <div className="mb-4">

//               {isEditing ? (
//                 <p className="text-lg font-medium text-gray-600">First Name:</p>,
//                 <input
//                   type="text"
//                   name="firstName"
//                   value={userProfile.firstName}
//                   onChange={handleInputChange}
//                   className="text-xl text-gray-800 p-2 border border-gray-300 rounded-md"
//                 />
//               ) : (
//                 <p className="text-lg font-medium text-gray-600">First Name: <span className="text-xl text-gray-800"> {userProfile.firstName}</span></p>
//               )}
//             </div>

//             <div className="mb-4">

//               {isEditing ? (
//                   <p className="text-lg font-medium text-gray-600">Last Name:</p>,
//                 <input
//                   type="text"
//                   name="lastName"
//                   value={userProfile.lastName}
//                   onChange={handleInputChange}
//                   className="text-xl text-gray-800 p-2 border border-gray-300 rounded-md"
//                 />
//               ) : (
//                 <p className="text-lg font-medium text-gray-600">Last Name: <span className="text-xl text-gray-800"> {userProfile.lastName}</span></p>
//               )}
//             </div>

//             <div className="mb-4">

//               {isEditing ? (
//                 <p className="text-lg font-medium text-gray-600">Email:</p>,
//                 <input
//                   type="email"
//                   name="email"
//                   value={userProfile.email}
//                   onChange={handleInputChange}
//                   className="text-xl text-gray-800 p-2 border border-gray-300 rounded-md"
//                 />
//               ) : (   <p className="text-lg font-medium text-gray-600">Email : <span className="text-xl text-gray-800"> {userProfile.email}</span></p>
//               )}
//             </div>

//             <div className="mb-4">
//               <p className="text-lg font-medium text-gray-600">Role:<span className="text-xl text-gray-800"> {roleName}</span></p>
//               <p className="text-xl text-gray-800"></p>
//             </div>

//             <div className="mt-6 text-center">
//               {isEditing ? (
//                 <>
//                   <button
//                     className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-700"
//                     onClick={saveProfileChanges}
//                   >
//                     Save Changes
//                   </button>
//                   <button
//                     className="ml-4 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-700"
//                     onClick={() => setIsEditing(false)}
//                   >
//                     Cancel
//                   </button>
//                 </>
//               ) : (
//                 <button
//                   className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700"
//                   onClick={() => setIsEditing(true)}
//                 >
//                   Edit Profile
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="mt-6 text-center">
//           <button
//             className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700"
//             onClick={handleLogout}
//           >
//             Logout
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;

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
    profilePicture: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp", // Default profile picture
  });
  const [isEditing, setIsEditing] = useState(false); // Toggle editing mode
  const [newProfilePic, setNewProfilePic] = useState(null);

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
        role_id: userData.roleId,
        profilePicture: userData.profilePicture || userProfile.profilePicture, // If profile picture exists in user data, set it
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to fetch user data");
    }
  };

  // Handle file change for profile picture
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProfilePic(reader.result); // Update the profile picture preview
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle input changes for editable fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Update profile (save changes)
  const saveProfileChanges = async () => {
    try {
      const updatedData = { ...userProfile, profilePicture: newProfilePic || userProfile.profilePicture };

      // Send updated data to backend (use appropriate API endpoint)
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/user/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to save changes");

      toast.success("Profile updated successfully!");
      setIsEditing(false); // Exit editing mode after saving
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile changes.");
    }
  };

  useEffect(() => {
    getData();
  }, []); // Fetch user data on mount

  // Logout functionality
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
          <div className="pl-10 relative w-90 h-60">
            <img
              alt="Profile"
              src={newProfilePic || userProfile.profilePicture}
              className="w-full h-full rounded-full object-cover border-4 border-gray-300"
            />
            <label
              htmlFor="profile-pic"
              className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer">
              <span className="text-lg">+</span>
            </label>
            <input
              id="profile-pic"
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            />
          </div>

          <div className="w-full">
            <div className="mb-4">
              {isEditing ? (
                ((<p className="text-lg font-medium text-gray-600">First Name</p>),
                (
                  <input
                    type="text"
                    name="firstName"
                    value={userProfile.firstName}
                    onChange={handleInputChange}
                    className="text-xl text-gray-800 p-2 border border-gray-300 rounded-md w-full"
                  />
                ))
              ) : (
                <p className="text-lg font-medium text-gray-600">
                  First Name : <span className="text-xl text-gray-800">{userProfile.firstName}</span>
                </p>
              )}
            </div>

            <div className="mb-4">
              {isEditing ? (
                ((<p className="text-lg font-medium text-gray-600">Last Name</p>),
                (
                  <input
                    type="text"
                    name="lastName"
                    value={userProfile.lastName}
                    onChange={handleInputChange}
                    className="text-xl text-gray-800 p-2 border border-gray-300 rounded-md w-full"
                  />
                ))
              ) : (
                <p className="text-lg font-medium text-gray-600">
                  Last Name : <span className="text-xl text-gray-800"> {userProfile.lastName}</span>
                </p>
              )}
            </div>

            <div className="mb-4">
              {isEditing ? (
                ((<p className="text-lg font-medium text-gray-600">Email :</p>),
                (
                  <input
                    type="email"
                    name="email"
                    value={userProfile.email}
                    onChange={handleInputChange}
                    className="text-xl text-gray-800 p-2 border border-gray-300 rounded-md w-full"
                  />
                ))
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
