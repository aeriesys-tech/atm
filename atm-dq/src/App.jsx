// import React from "react";
// import { HashRouter, Routes, Route } from "react-router-dom";

// import PrivateRoute from "../routes/PrivateRoute";
// import LoginPage from "./auth/LoginPage";
// import PublicRoute from "../routes/PublicRoute";
// import ProtectedRoute from "../routes/ProtectedRoute";

// function App() {
//   return (
//     <HashRouter>
//       <Routes>
//         {/* Public */}
//         {PublicRoute.map(({ path, element }, idx) => (
//           <Route key={`pub-${idx}`} path={path} element={element} />
//         ))}

//         {/* Protected: wrap each element with PrivateRoute */}
//         {ProtectedRoute.map(({ path, element }, idx) => (
//           <Route
//             key={`prot-${idx}`}
//             path={path}
//             element={<PrivateRoute element={element} />}
//           />
//         ))}

//         {/* optional: catch-all redirect to login */}
//         <Route path="/" element={<LoginPage />} />
//       </Routes>
//     </HashRouter>
//   );
// }

// export default App;


import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PrivateRoute from "../routes/PrivateRoute";
import LoginPage from "./auth/LoginPage";
import PublicRoute from "../routes/PublicRoute";
import ProtectedRoute from "../routes/ProtectedRoute";

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public */}
        {PublicRoute.map(({ path, element }, idx) => (
          <Route key={`pub-${idx}`} path={path} element={element} />
        ))}

        {/* Protected: wrap each element with PrivateRoute */}
        {ProtectedRoute.map(({ path, element }, idx) => (
          <Route
            key={`prot-${idx}`}
            path={path}
            element={<PrivateRoute element={element} />}
          />
        ))}

        {/* Optional: catch-all redirect to login */}
        <Route path="/" element={<LoginPage />} />
      </Routes>

      {/* Toast container (global) */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </HashRouter>
  );
}

export default App;
