import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tuyau } from "../lib/Tuyau";
import { loggedInUserQueryKey, useLoggedInUserQuery } from "../hooks/useLoggedInUserQuery";
import { useRolesQuery } from "../hooks/useRolesQuery";

const ChangePasswordPlaceholder = () => (
  <div className="p-4 text-base-content/70 rounded-box border border-base-content/10 bg-base-200">
    Password change is not available yet.
  </div>
);

/* eslint-disable react/prop-types -- legacy JSX form; props are stable */
const BasicDetails = ({ userDetails, setUserDetails, onSave, isLoading }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <fieldset className="fieldset flex flex-col h-full bg-base-200 text-base-content p-4 md:p-6 rounded-box w-full gap-6 border border-base-content/10">
      <legend className="fieldset-legend text-base-content text-base md:text-lg font-semibold mb-2">
        Basic Details
      </legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full min-w-0">
        <div>
          <label htmlFor="firstName" className="fieldset-label text-base-content block mb-2">
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            value={userDetails.firstName}
            onChange={handleChange}
            type="text"
            className="input input-bordered w-full bg-base-100 text-base-content border border-primary/50 focus:border-primary focus:outline-none"
            placeholder="John"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="fieldset-label text-base-content block mb-2">
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            value={userDetails.lastName}
            onChange={handleChange}
            type="text"
            className="input input-bordered w-full bg-base-100 text-base-content border border-primary/50 focus:border-primary focus:outline-none"
            placeholder="Doe"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full min-w-0">
        <div>
          <label htmlFor="email" className="fieldset-label text-base-content block mb-2">
            Email
          </label>
          <input
            id="email"
            name="email"
            value={userDetails.email}
            onChange={handleChange}
            type="email"
            className="input input-bordered w-full bg-base-100 text-base-content border border-primary/50 focus:border-primary focus:outline-none"
            placeholder="john.doe@example.com"
          />
        </div>
        <div>
          <label htmlFor="role" className="fieldset-label text-base-content block mb-2">
            Role
          </label>
          <input
            id="role"
            name="role"
            value={userDetails.role}
            disabled
            type="text"
            className="input input-bordered w-full bg-base-100 text-base-content border border-primary/50 opacity-70 cursor-not-allowed"
            placeholder="USER"
          />
          <p className="text-xs md:text-sm text-base-content/60 mt-1">Role cannot be changed from profile settings</p>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button onClick={onSave} disabled={isLoading} className="btn btn-primary w-full sm:w-auto">
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
        <button
          className="btn btn-error btn-outline w-full sm:w-auto"
          onClick={() => document.getElementById("delete_account_modal").showModal()}
        >
          Delete Account
        </button>
      </div>

      {/* Delete Account */}
      <dialog id="delete_account_modal" className="modal text-base-content">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Delete Account?</h3>
          <p className="py-4">This action is irreversible. Are you sure you want to continue?</p>
          <div className="modal-action">
            <form method="dialog" className="flex gap-2">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn">Close</button>
              <button
                onClick={async () => {
                  
                  const { error } = await tuyau.auth.hardDelete[userDetails.id].$delete();
                  if (error) {
                    toast.error("Failed to delete account.");
                 

                    return;
                  } else {
                  
                    toast.success(`Account deleted successfully!`);
                    localStorage.clear();
                    sessionStorage.clear();
                    // add a small delay to ensure the toast message is visible
                    setTimeout(() => {
                      window.location.href = "/login";
                    }, 1500);
                  }
                }}
                className="btn btn-error"
              >
                Yes, I&apos;m sure
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </fieldset>
  );
};
/* eslint-enable react/prop-types */

const Profile = () => {
  const queryClient = useQueryClient();
  const { data: userData, isLoading: userQueryLoading, isError: userQueryError } = useLoggedInUserQuery();
  const { data: roles, isLoading: rolesLoading } = useRolesQuery();

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

  useEffect(() => {
    if (!userData || !roles) return;
    const userRole = roles.find((role) => role.id === userData.roleId);
    const updatedDetails = {
      id: userData.id,
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      email: userData.email || "",
      role: userRole?.roleName || "",
      profilePicture: userData.profilePicture || "",
    };
    setUserDetails(updatedDetails);
    setOriginalDetails(updatedDetails);
  }, [userData, roles]);

  useEffect(() => {
    if (userQueryError) {
      toast.error("Failed to fetch user data");
    }
  }, [userQueryError]);

  // Update profile (save changes)
  const saveProfileChanges = async () => {
    if (!hasChanges) return;

    setIsLoading(true);
    try {
      // Extract only the fields that can be updated
      const { firstName, lastName, email } = userDetails;
      const updatedData = { firstName, lastName, email };

      // Send updated data to backend
      const { error } = await tuyau.auth.update.$patch(updatedData);
      if (error) {
        throw new Error(error.message || "Failed to save changes");
      }

      toast.success("Profile updated successfully!");
      await queryClient.invalidateQueries({ queryKey: loggedInUserQueryKey });
      // Update original details to match current details
      setOriginalDetails({ ...userDetails });
      setHasChanges(false);
    } catch (error) {
   
      
      toast.error(error.message || "Failed to save profile changes.");
    } finally {
      setIsLoading(false);
    }
  };

  // Password change component (placeholder for now)
  // const ChangePassword = () => (
  //   <fieldset className="fieldset flex flex-col h-full bg-base-200 text-base-content p-4 rounded-box w-full gap-6">
  //     <div>
  //       <label htmlFor="currentPassword" className="fieldset-label text-base-content block mb-2">
  //         Current Password
  //       </label>
  //       <input
  //         id="currentPassword"
  //         type="password"
  //         className="input w-full bg-base-200 text-base-content border border-primary/50 focus:border-primary focus:outline-none"
  //       />
  //     </div>
  //     <div>
  //       <label htmlFor="newPassword" className="fieldset-label text-base-content block mb-2">
  //         New Password
  //       </label>
  //       <input
  //         id="newPassword"
  //         type="password"
  //         className="input w-full bg-base-200 border border-primary/50 focus:border-primary focus:outline-none"
  //       />
  //     </div>
  //     <div>
  //       <label htmlFor="confirmPassword" className="fieldset-label text-base-content block mb-2">
  //         Confirm New Password
  //       </label>
  //       <input
  //         id="confirmPassword"
  //         type="password"
  //         className="input w-full bg-base-200 text-base-content border border-primary/50 focus:border-primary focus:outline-none"
  //       />
  //     </div>
  //     <div className="mt-4">
  //       <button
  //         className="btn btn-soft btn-primary w-full sm:w-auto"
  //         onClick={() => {
  //           toast.info("Not implemented yet");
  //         }}
  //       >
  //         Update Password
  //       </button>
  //     </div>
  //   </fieldset>
  // );

  const profileDataLoading = userQueryLoading || rolesLoading;

  return (
    <div className="h-full w-full flex flex-col gap-3 overflow-x-hidden px-4 py-4 md:px-6 md:py-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-semibold leading-tight text-base-content">Profile Settings</h1>
      </div>

      {/* Bottom section will have a sidebar and a space to display  */}
      <div className="flex flex-col lg:flex-row gap-3 flex-1 min-h-0">
        {/* SIDEBAR */}
        <div className="w-full lg:w-72 shrink-0">
          <ul className="menu bg-base-200 rounded-box border border-base-content/10 gap-1 p-2 w-full">
            <li>
              <a
                className={`w-full ${activeTab === "basic" ? "menu-active" : ""}`}
                onClick={() => setActiveTab("basic")}
              >
                Basic Details
              </a>
            </li>
            {/* <li className="w-full">
              <a className={activeTab === "password" ? "menu-active" : ""} onClick={() => setActiveTab("password")}>
                Change Password
              </a>
            </li> */}
          </ul>
        </div>

        {/* Content Space */}
        <div className="flex-1 min-h-0 w-full">
          {activeTab === "basic" ? (
            <BasicDetails
              userDetails={userDetails}
              setUserDetails={setUserDetails}
              onSave={saveProfileChanges}
              isLoading={isLoading || profileDataLoading}
            />
          ) : (
            <ChangePasswordPlaceholder />
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
              strokeLinejoin="round"
            >
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
