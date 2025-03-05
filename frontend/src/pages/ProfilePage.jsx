import { useState, useEffect } from "react";
import { toast } from "sonner";

const BasicDetails = ({ userDetails, setUserDetails, onSave, isLoading }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <fieldset className="fieldset flex flex-col h-full bg-base-content text-base-200 p-4 rounded-box w-full gap-6">
      <div>
        <label htmlFor="firstName" className="fieldset-label text-base-200 block mb-2">
          First Name
        </label>
        <input
          id="firstName"
          name="firstName"
          value={userDetails.firstName}
          onChange={handleChange}
          type="text"
          className="input w-1/2 bg-base-content border border-accent/50 focus:border-accent focus:outline-none"
          placeholder="John"
        />
      </div>
      <div>
        <label htmlFor="lastName" className="fieldset-label text-base-200 block mb-2">
          Last Name
        </label>
        <input
          id="lastName"
          name="lastName"
          value={userDetails.lastName}
          onChange={handleChange}
          type="text"
          className="input w-1/2 bg-base-content border border-accent/50 focus:border-accent focus:outline-none"
          placeholder="Doe"
        />
      </div>
      <div>
        <label htmlFor="email" className="fieldset-label text-base-200 block mb-2">
          Email
        </label>
        <input
          id="email"
          name="email"
          value={userDetails.email}
          onChange={handleChange}
          type="email"
          className="input w-1/2 bg-base-content border border-accent/50 focus:border-accent focus:outline-none"
          placeholder="john.doe@example.com"
        />
      </div>
      <div>
        <label htmlFor="role" className="fieldset-label text-base-200 block mb-2">
          Role
        </label>
        <input
          id="role"
          name="role"
          value={userDetails.role}
          disabled
          type="text"
          className="input w-1/2 bg-base-content border border-accent/50 opacity-70 cursor-not-allowed"
          placeholder="USER"
        />
        <p className="text-xs text-accent/70 mt-1">Role cannot be changed from profile settings</p>
      </div>
      <div className="mt-4">
        <button onClick={onSave} disabled={isLoading} className="btn btn-soft btn-primary w-full sm:w-auto">
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </fieldset>
  );
};

const Profile = () => {
  const [activeTab, setActiveTab] = useState("basic");
  const [isLoading, setIsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    profilePicture: "",
  });
  const [originalDetails, setOriginalDetails] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Check if user made changes
  useEffect(() => {
    if (Object.keys(originalDetails).length) {
      const changed = Object.keys(userDetails).some((key) => userDetails[key] !== originalDetails[key]);
      setHasChanges(changed);
    }
  }, [userDetails, originalDetails]);

  // Fetch user and role data
  const getUserDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/auth/isAuthenticated`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("User authentication failed");
      }

      const userData = await response.json();

      const roleResponse = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/role/getAll`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const roles = await roleResponse.json();

      const userRole = roles.find((role) => role.id === userData.roleId);
      const updatedDetails = {
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        role: userRole?.roleName || "",
        profilePicture: userData.profilePicture || "",
      };

      setUserDetails(updatedDetails);
      setOriginalDetails(updatedDetails);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to fetch user data");
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile (save changes)
  const saveProfileChanges = async () => {
    if (!hasChanges) return;

    setIsLoading(true);
    try {
      // Extract only the fields that can be updated
      const { firstName, lastName, email } = userDetails;
      const updatedData = { firstName, lastName, email };

      // Send updated data to backend
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/auth/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save changes");
      }

      const result = await response.json();
      toast.success("Profile updated successfully!");
      // Update original details to match current details
      setOriginalDetails({ ...userDetails });
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error(error.message || "Failed to save profile changes.");
    } finally {
      setIsLoading(false);
    }
  };

  // Password change component (placeholder for now)
  const ChangePassword = () => (
    <fieldset className="fieldset flex flex-col h-full bg-base-content text-base-200 p-4 rounded-box w-full gap-6">
      <div>
        <label htmlFor="currentPassword" className="fieldset-label text-base-200 block mb-2">
          Current Password
        </label>
        <input
          id="currentPassword"
          type="password"
          className="input w-full bg-base-content border border-accent/50 focus:border-accent focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="newPassword" className="fieldset-label text-base-200 block mb-2">
          New Password
        </label>
        <input
          id="newPassword"
          type="password"
          className="input w-full bg-base-content border border-accent/50 focus:border-accent focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="fieldset-label text-base-200 block mb-2">
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          className="input w-full bg-base-content border border-accent/50 focus:border-accent focus:outline-none"
        />
      </div>
      <div className="mt-4">
        <button className="btn btn-soft btn-primary w-full sm:w-auto">Update Password</button>
      </div>
    </fieldset>
  );

  useEffect(() => {
    getUserDetails();
  }, []); // Fetch user data on mount

  return (
    <div className="flex h-full flex-col">
      {/* HEADER */}
      <div className="text-3xl p-2 mt-2 font-semibold text-base-200">Profile Settings</div>
      {/* DIVIDER */}
      <div className="divider m-2 w-3/4 before:bg-base-200/50 after:bg-base-200/50"></div>

      {/* Bottom section will have a sidebar and a space to display  */}
      <div className="flex flex-col md:flex-row h-full">
        {/* SIDEBAR */}
        <div className="md:h-full mb-4 md:mb-0">
          <ul className="menu bg-base-content w-full md:w-56 rounded-lg md:rounded-box h-full gap-2">
            <li>
              <a className={activeTab === "basic" ? "menu-active" : ""} onClick={() => setActiveTab("basic")}>
                Basic Details
              </a>
            </li>
            <li className="w-full">
              <a className={activeTab === "password" ? "menu-active" : ""} onClick={() => setActiveTab("password")}>
                Change Password
              </a>
            </li>
          </ul>
        </div>

        {/* Content Space */}
        <div className="h-full w-full md:pl-4">
          {activeTab === "basic" ? (
            <BasicDetails
              userDetails={userDetails}
              setUserDetails={setUserDetails}
              onSave={saveProfileChanges}
              isLoading={isLoading}
            />
          ) : (
            <ChangePassword />
          )}
        </div>
      </div>

      {/* Unsaved changes warning */}
      {hasChanges && (
        <div className="fixed bottom-4 right-4 bg-warning text-warning-content p-4 rounded-box shadow-lg">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>You have unsaved changes</span>
            {/*
            <button onClick={saveProfileChanges} disabled={isLoading} className="btn btn-sm btn-warning ml-2">
              Save Now
              </button>
              */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
