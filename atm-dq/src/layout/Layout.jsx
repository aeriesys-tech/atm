import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/common/Footer";

function Layout({ children, header }) {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Fixed Navbar */}
      <Navbar />

      {/* Scrollable Main Content */}
      <div className="flex-1 overflow-y-auto">
        {header && (
          <div className="sticky top-0 z-10 bg-gray-100">{header}</div>
        )}

        <div className="bg-white shadow-md md:mx-10 rounded-md h-[calc(100vh-180px)] overflow-y-auto">
          <main className="border-t border-gray-200 p-4 min-h-full">
            {children}
          </main>
        </div>
      </div>

      {/* Fixed Footer */}
      <Footer />
    </div>
  );
}

export default Layout;
