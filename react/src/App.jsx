import { useEffect, useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Loader from "./components/general/LoaderAndSpinner/Loader.jsx";
import MainLayout from "./layout/MainLayout";
import publicRoutes from "../routes/PublicRoutes.jsx";
import protectedRoutes from "../routes/ProtectedRoutes.jsx";
import PrivateRoute from "../routes/PrivateRoute.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) return <Loader />;

  return (
    <HashRouter>
      <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      <Routes>
        {/* Public Routes */}
        {publicRoutes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}

        {/* Protected Routes with PrivateRoute and Layout */}
        {protectedRoutes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={
              <MainLayout>
                <PrivateRoute element={route.element} />
              </MainLayout>
            }
          />
        ))}
      </Routes>
    </HashRouter>
  );
}

export default App;
