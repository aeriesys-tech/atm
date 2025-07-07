import React from "react";
import Footer from "../components/general/Footer";
import Header from "../components/general/Header";

const MainLayout = ({ children }) => {
	return (
		<>
			<div className="nav-container">
				<Header />
			</div>
			<div className="container" style={{ height: "auto", backgroundColor: "#F9F9F9" }}>
				{children}
				<Footer />
			</div>
		</>

	);
};

export default MainLayout;
