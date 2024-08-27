import { cookies } from 'next/headers';
const cookieStore = cookies();
export const isAuthenticated = cookieStore.has('userSession'); //true;

// // Define isAuthenticated function
// export const isAuthenticated = () => {
//   const cookieStore = cookies();

//   if (typeof window !== 'undefined') {
//     // Check if there is a token in local storage
//     // const authToken = localStorage.getItem('authToken');
//     const authToken = cookieStore.get('authToken');
//     return true;
//     // return !!authToken; // Returns true if authToken is present, false otherwise
//   }

//   // If window is undefined (e.g., during server-side rendering), consider the user as not authenticated
//   return false;
// };
