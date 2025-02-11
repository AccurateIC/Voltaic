// // // /src/components/Profile.jsx

// // const Profile = () => {
// //     return (
// //         <div className="dropdown dropdown-end">
// //             <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
// //                 <div className="w-10 rounded-full">
// //                     <img
// //                         alt="Tailwind CSS Navbar component"
// //                         src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
// //                 </div>
// //             </div>
// //             <ul
// //                 tabIndex={0}
// //                 className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
// //                 <li>
// //                     <a className="justify-between">
// //                         Profile
// //                         <span className="badge">New</span>
// //                     </a>
// //                 </li>
// //                 <li><a>Settings</a></li>
// //                 <li>
// //                     <a onClick={() => navigate("/login")} className="cursor-pointer">Logout</a>
// //                 </li>
// //             </ul>
// //         </div>
// //     );
// // };

// // export default Profile;

// import { useNavigate } from "react-router-dom"; // Import navigate to handle redirect
// import { useState } from "react"; // Import useState to manage loading state

// const Profile = () => {
//   const navigate = useNavigate();
//   const [isLoggingOut, setIsLoggingOut] = useState(false); // Track logout loading state


//   const handleLogout = async () => {
//     setIsLoggingOut(true); 
//     const token = sessionStorage.getItem('token'); 
//     const url = "http://localhost:3333/auth/logout";
//     try {
//       const response = await fetch(url, {
//         method: "POST",
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         credentials: 'same-origin',
//       });
//       const data = await response.json();
// console.log(data);
//       if (response.ok) {
//         // After successful logout, redirect the user to the login page
//         navigate("/login");
       
//       } else {
//         alert('Logout failed!');
//       }
//     } catch (error) {
//       console.error('Error logging out:', error);
//       alert('Logout failed!');
//     } finally {
//       setIsLoggingOut(false); // Set loading state to false after the request
//     }
//   };

//   return (
//     <div className="dropdown dropdown-end">
//       <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
//         <div className="w-10 rounded-full">
//           <img
//             alt="User Avatar"
//             src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
//         </div>
//       </div>
//       <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
//         <li>
//           <a className="justify-between">
//             Profile
//             <span className="badge">New</span>
//           </a>
//         </li>
//         <li><a>Settings</a></li>
//         <li>
//           {/* Show "Logging out..." if the user is logging out */}
//           <a 
//             onClick={handleLogout} 
//             className="cursor-pointer"
//           >
//             Logout
//           </a>
//         </li>
//       </ul>
//     </div>
//   );
// };

// export default Profile;


import { isCookie, useNavigate } from "react-router-dom"; // Import navigate to handle redirect
import { useState } from "react"; // Import useState to manage loading state

const Profile = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Track logout loading state

  // Handle the logout process
  const handleLogout = async () => {
    setIsLoggingOut(true); // Set loading state to true
    
    try {
      const response = await fetch('http://localhost:3333/auth/logout', {
        method: 'POST',
        // headers: {
        //   'Content-Type': 'application/json',
        // },
        credentials: 'include', // Ensure cookies/session are sent with the request
      });

    //   const data = await response.json();
      if (response.ok) {
       console.log('Cookies before logout:', document.cookie);
       setTimeout(() => {
        console.log('Cookies after logout:', document.cookie);  // Print cookies to the console after the logout
      }, 500);
        navigate("/login");
      } else {
        alert(`Logout failed}`);
      }
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Logout failed!');
    } finally {
      setIsLoggingOut(false); // Set loading state to false after the request
    }
  };

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
        <div className="w-10 rounded-full">
          <img
            alt="User Avatar"
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
        </div>
      </div>
      <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
        <li>
          <a className="justify-between">
            Profile
            <span className="badge">New</span>
          </a>
        </li>
        <li><a>Settings</a></li>
        <li>
          {/* Show "Logging out..." if the user is logging out */}
          <a 
            onClick={handleLogout} 
            className="cursor-pointer"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </a>
        </li>
      </ul>
    </div>
  );
};

export default Profile;
