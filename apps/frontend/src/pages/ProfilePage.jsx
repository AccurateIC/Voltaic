import { useState, useEffect } from "react";
import { toast } from "sonner";
import { tuyau } from "../lib/Tuyau";

const BasicDetails = ({ userDetails, setUserDetails, onSave, isLoading }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilePicture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserDetails((prev) => ({
        ...prev,
        profilePicture: URL.createObjectURL(file),
        newProfileFile: file,
      }));
    }
  };

  return (
    <fieldset className="fieldset flex flex-col h-full bg-base-200 text-base-content p-4 rounded-box w-full gap-6">
      {/* Profile Picture */}
      <div>
        <label className="fieldset-label block mb-2">Profile Picture</label>
        <input type="file" accept="image/*" onChange={handleProfilePicture} className="input w-full" />
        {userDetails.profilePicture && (
          <img
            src={userDetails.profilePicture}
            alt="Profile"
            className="w-24 h-24 rounded-full mt-2 object-cover"
          />
        )}
      </div>

      {/* First Name */}
      <div>
        <label htmlFor="firstName" className="fieldset-label block mb-2">
          First Name
        </label>
        <input
          id="firstName"
          name="firstName"
          value={userDetails.firstName}
          onChange={handleChange}
          type="text"
          className="input w-1/2 bg-base-200 text-base-content border border-primary/50 focus:border-primary focus:outline-none"
          placeholder="John"
        />
      </div>

      {/* Last Name */}
      <div>
        <label htmlFor="lastName" className="fieldset-label block mb-2">
          Last Name
        </label>
        <input
          id="lastName"
          name="lastName"
          value={userDetails.lastName}
          onChange={handleChange}
          type="text"
          className="input w-1/2 bg-base-200 text-base-content border border-primary/50 focus:border-primary focus:outline-none"
          placeholder="Doe"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="fieldset-label block mb-2">
          Email
        </label>
        <input
          id="email"
          name="email"
          value={userDetails.email}
          onChange={handleChange}
          type="email"
          className="input w-1/2 bg-base-200 text-base-content border border-primary/50 focus:border-primary focus:outline-none"
          placeholder="john.doe@example.com"
        />
      </div>

      {/* Role */}
      <div>
        <label htmlFor="role" className="fieldset-label block mb-2">
          Role
        </label>
        <input
          id="role"
          name="role"
          value={userDetails.role}
          disabled
          type="text"
          className="input w-1/2 bg-base-200 text-base-content border border-primary/50 opacity-70 cursor-not-allowed"
          placeholder="USER"
        />
        <p className="text-xs text-accent/70 mt-1">Role cannot be changed from profile settings</p>
      </div>

      {/* Last Login Info */}
      {userDetails.lastLogin && (
        <p className="text-sm text-base-content/70">Last login: {new Date(userDetails.lastLogin).toLocaleString()}</p>
      )}

      {/* Buttons */}
      <div className="mt-4 gap-4 flex flex-wrap">
        <button onClick={onSave} disabled={isLoading} className="btn btn-soft btn-primary w-full sm:w-auto m-2">
          {isLoading ? "Saving..." : "Save Changes"}
        </button>

        {/* Delete Account */}
        <button
          className="btn btn-error btn-soft"
          onClick={() => document.getElementById("delete_account_modal").showModal()}
        >
          Delete Account
        </button>

        {/* Modal */}
        <dialog id="delete_account_modal" className="modal text-base-content">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete Account</h3>
            <p className="py-4">Are you sure you want to delete your account? This action is irreversible.</p>
            <div className="modal-action">
              <form method="dialog" className="flex gap-2">
                <button className="btn">Cancel</button>
                <button
                  onClick={async () => {
                    const { data, error } = await tuyau.auth.hardDelete[userDetails.id].$delete();
                    if (error) {
                      toast.error("Failed to delete account.");
                      console.error(error);
                      return;
                    }
                    toast.success("Account deleted successfully!");
                    localStorage.clear();
                    sessionStorage.clear();
                    setTimeout(() => (window.location.href = "/login"), 1500);
                  }}
                  className="btn btn-error"
                >
                  Yes, Delete
                </button>
              </form>
            </div>
          </div>
        </dialog>
      </div>
    </fieldset>
  );
};

const ChangePassword = () => {
  const updatePassword = async () => {
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const { data, error } = await tuyau.auth.changePassword.$post({ currentPassword, newPassword });
    if (error) {
      toast.error(error.message || "Password change failed");
    } else {
      toast.success("Password updated successfully!");
      document.getElementById("currentPassword").value = "";
      document.getElementById("newPassword").value = "";
      document.getElementById("confirmPassword").value = "";
    }
  };

  return (
    <fieldset className="fieldset flex flex-col h-full bg-base-200 text-base-content p-4 rounded-box w-full gap-6">
      <div>
        <label htmlFor="currentPassword" className="fieldset-label block mb-2">
          Current Password
        </label>
        <input id="currentPassword" type="password" className="input w-full bg-base-200 text-base-content border border-primary/50 focus:border-primary focus:outline-none" />
      </div>
      <div>
        <label htmlFor="newPassword" className="fieldset-label block mb-2">
          New Password
        </label>
        <input id="newPassword" type="password" className="input w-full bg-base-200 border border-primary/50 focus:border-primary focus:outline-none" />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="fieldset-label block mb-2">
          Confirm New Password
        </label>
        <input id="confirmPassword" type="password" className="input w-full bg-base-200 text-base-content border border-primary/50 focus:border-primary focus:outline-none" />
      </div>
      <div className="mt-4">
        <button onClick={updatePassword} className="btn btn-soft btn-primary w-full sm:w-auto">
          Update Password
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
    lastLogin: null,
  });
  const [originalDetails, setOriginalDetails] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Check if user made changes
  useEffect(() => {
    if (Object.keys(originalDetails).length) {
      const changed = Object.keys(userDetails).some(
        (key) => userDetails[key] !== originalDetails[key]
      );
      setHasChanges(changed);
    }
  }, [userDetails, originalDetails]);

  // Fetch user and role data
  const getUserDetails = async () => {
    setIsLoading(true);
    try {
      const { data: userData, error: userError } = await tuyau.auth.getLoggedInUser.$get();
      if (userError) throw new Error("User authentication failed");

      const { data: roles, error: roleError } = await tuyau.role.getAll.$get();
      if (roleError) throw new Error("Failed to fetch roles");

      const userRole = roles.find((role) => role.id === userData.roleId);
      const updatedDetails = {
        id: userData.id,
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        role: userRole?.roleName || "",
        profilePicture: userData.profilePicture || "",
        lastLogin: userData.lastLogin || null,
      };

      setUserDetails(updatedDetails);
      setOriginalDetails(updatedDetails);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch user data");
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile (save changes)
  const saveProfileChanges = async () => {
    if (!hasChanges) return;

    // Validation
    if (!userDetails.firstName || !userDetails.lastName) {
      toast.error("First and Last Name cannot be empty");
      return;
    }
    if (!userDetails.email.includes("@")) {
      toast.error("Invalid email address");
      return;
    }

    setIsLoading(true);
    try {
      const { firstName, lastName, email, newProfileFile } = userDetails;
      const updatedData = { firstName, lastName, email };

      // Handle profile picture upload if present
      if (newProfileFile) {
        const formData = new FormData();
        formData.append("profilePicture", newProfileFile);
        // send formData to backend
        await tuyau.auth.uploadProfilePicture.$post(formData);
      }

      const { data, error } = await tuyau.auth.update.$patch(updatedData);
      if (error) throw new Error(error.message || "Failed to save changes");

      toast.success("Profile updated successfully!");
      setOriginalDetails({ ...userDetails, newProfileFile: undefined });
      setHasChanges(false);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to save profile changes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getUserDetails();
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="text-3xl p-2 mt-2 font-semibold text-base-content">Profile Settings</div>
      <div className="divider m-2 w-3/4 before:bg-base-200/50 after:bg-base-200/50"></div>

      <div className="flex flex-col md:flex-row h-full">
        <div className="md:h-full mb-4 md:mb-0">
          <ul className="menu bg-base-200 w-full md:w-56 rounded-lg md:rounded-box h-full gap-2">
            <li>
              <a className={activeTab === "basic" ? "menu-active" : ""} onClick={() => setActiveTab("basic")}>
                Basic Details
              </a>
            </li>
            <li>
              <a className={activeTab === "password" ? "menu-active" : ""} onClick={() => setActiveTab("password")}>
                Change Password
              </a>
            </li>
          </ul>
        </div>

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

      {hasChanges && (
        <div className="fixed bottom-4 right-4 bg-warning text-warning-content p-4 rounded-box shadow-lg flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>You have unsaved changes</span>
        </div>
      )}
    </div>
  );
};

export default Profile;
