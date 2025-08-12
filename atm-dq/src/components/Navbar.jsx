import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
	FiBell,
	FiSettings,
	FiUser,
	FiChevronDown,
	FiMenu,
	FiX,
	FiHome,
	FiList,
} from "react-icons/fi";
import logo from "../assets/logo.svg";

const menuItems = [
	{
		label: "Home",
		icon: <FiHome className="h-4 w-4" />,
		children: [
			{
				label: "DQ for Time Series Data",
				icon: <FiList className="h-4 w-4" />,
				href: "/dq-time-series",
			},
			{
				label: "DQ for Static Data",
				icon: <FiList className="h-4 w-4" />,
				href: "/dq-static",
			},
		],
	},
	{
		label: "Configuration",
		icon: <FiSettings className="h-4 w-4" />,
		children: [
			{
				label: "Data Source Configuration",
				icon: <FiList className="h-4 w-4" />,
				href: "/data-source",
			},
		],
	},
];

export default function Navbar() {
	const [isOpen, setIsOpen] = useState(false);
	const [openMenu, setOpenMenu] = useState("");
	const location = useLocation();

	const isParentActive = (parent) => {
		return parent.children?.some((child) => location.pathname.startsWith(child.href));
	};

	return (
		<nav className="bg-white shadow-md">
			<div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div className="flex items-center space-x-8">
						<div className="flex items-center space-x-2">
							<img src={logo} alt="Logo" className="h-8 w-auto" />
							<span className="font-bold text-xl">ADITYA BIRLA</span>
						</div>

						<div className="hidden md:flex items-center space-x-6">
							{menuItems.map((item) =>
								item.children ? (
									<div key={item.label} className="relative group">
										<button
											className={`flex items-center space-x-1 ${isParentActive(item)
												? "text-blue-600 font-medium"
												: "text-gray-600 hover:text-blue-600"
												}`}
										>
											{item.icon}
											<span>{item.label}</span>
											<FiChevronDown className="h-4 w-4 ml-1" />
										</button>
										<div className="absolute hidden group-hover:block bg-white shadow-lg rounded-md z-50 py-2 min-w-max whitespace-nowrap">
											{item.children.map((sub) => (
												<NavLink
													key={sub.label}
													to={sub.href}
													className={({ isActive }) =>
														`flex items-center gap-2 px-4 py-2 ${isActive
															? "text-blue-600 font-medium"
															: "text-gray-600"
														} hover:text-blue-600 hover:bg-gray-100`
													}
												>
													{sub.icon}
													<span>{sub.label}</span>
												</NavLink>
											))}
										</div>
									</div>
								) : (
									<NavLink
										key={item.label}
										to={item.href}
										className={({ isActive }) =>
											`flex items-center space-x-1 ${isActive
												? "text-blue-600 font-medium"
												: "text-gray-600 hover:text-blue-600"
											}`
										}
									>
										{item.icon}
										<span>{item.label}</span>
									</NavLink>
								)
							)}
						</div>
					</div>

					<div className="hidden md:flex items-center space-x-2">
						<div className="relative bg-blue-50 p-2 rounded-lg cursor-pointer">
							<FiBell className="h-5 w-5 text-blue-600" />
							<span className="absolute -top-1 -right-1 bg-red-600 text-xs text-white rounded-full px-1">2</span>
						</div>
						<div className="bg-blue-50 p-2 rounded-lg cursor-pointer">
							<FiSettings className="h-5 w-5 text-blue-600" />
						</div>
						<div className="flex items-center bg-blue-50 px-3 py-2 rounded-lg cursor-pointer">
							<FiUser className="h-5 w-5 text-blue-600" />
							<span className="ml-2 font-medium text-blue-600">Bharatesh</span>
							<FiChevronDown className="h-4 w-4 ml-1 text-blue-600" />
						</div>
					</div>

					<div className="md:hidden flex items-center">
						<button onClick={() => setIsOpen(!isOpen)}>
							{isOpen ? (
								<FiX className="h-6 w-6 text-gray-700" />
							) : (
								<FiMenu className="h-6 w-6 text-gray-700" />
							)}
						</button>
					</div>
				</div>
			</div>

			{isOpen && (
				<div className="md:hidden px-4 pt-4 pb-3 space-y-2">
					{menuItems.map((item) =>
						item.children ? (
							<div key={item.label}>
								<button
									onClick={() => setOpenMenu(openMenu === item.label ? "" : item.label)}
									className={`flex items-center w-full space-x-1 ${isParentActive(item)
										? "text-blue-600 font-medium"
										: "text-gray-600 hover:text-blue-600"
										}`}
								>
									{item.icon}
									<span>{item.label}</span>
									<FiChevronDown className="h-4 w-4 ml-1" />
								</button>

								{openMenu === item.label && (
									<div className="pl-6 pt-1 space-y-1">
										{item.children.map((sub) => (
											<NavLink
												key={sub.label}
												to={sub.href}
												className={({ isActive }) =>
													`flex items-center gap-2 ${isActive
														? "text-blue-600 font-medium"
														: "text-gray-600"
													}`
												}
											>
												{sub.icon}
												<span>{sub.label}</span>
											</NavLink>
										))}
									</div>
								)}
							</div>
						) : (
							<NavLink
								key={item.label}
								to={item.href}
								className={({ isActive }) =>
									`flex items-center space-x-1 ${isActive
										? "text-blue-600 font-medium"
										: "text-gray-600 hover:text-blue-600"
									}`
								}
							>
								{item.icon}
								<span>{item.label}</span>
							</NavLink>
						)
					)}
				</div>
			)}
		</nav>
	);
}
