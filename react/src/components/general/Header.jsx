import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import Search from '../common/Search'
import Breadcrum from './Breadcrum'
import Component2 from "../../../src/assets/icons/component2.svg"
import logom from "../../../src/assets/icons/logo-m.svg"
import Navlogo from "../../../src/assets/icons/Navlogo.svg"
import bellIcon from "../../../src/assets/icons/bellIcon.svg"
import settings from "../../../src/assets/icons/settings.svg"
import fi_1946429 from "../../../src/assets/icons/fi_1946429.svg"
import ArrowDown from "../../../src/assets/icons/ArrowDown.svg"
import setting from "../../../src/assets/icons/setting(2)1.svg"
import globe from "../../../src/assets/icons/globe(1)1.svg"
import sett from "../../../src/assets/icons/setting(3)1.svg"
import home from "../../../src/assets/icons/home (3) 1.svg"
import layout from "../../../src/assets/icons/layout-1.svg"
import graph from "../../../src/assets/icons/graph-1.svg"
import wrench1 from "../../../src/assets/icons/wrench1.svg"
import adjust1 from "../../../src/assets/icons/adjust(1)1.svg"
import ArrowLineRight from "../../../src/assets/icons/ArrowLineRight.svg"
import tag from "../../../src/assets/icons/tag(2)1.svg"
import flag1 from "../../../src/assets/icons/flag1.svg"
import bigdata from "../../../src/assets/icons/big-data1.svg"
import verified1 from "../../../src/assets/icons/verified1.svg"
import ddd from "../../../src/assets/icons/3d1.svg"
import thinking1 from "../../../src/assets/icons/thinking1.svg"
import fi_1828824 from "../../../src/assets/icons/fi_1828824.svg"
import IconSet from "../../../src/assets/icons/IconSet.svg"
import bag1 from "../../../src/assets/icons/bag1.svg"
import layout1 from "../../../src/assets/icons/layout1.svg"
import box1 from "../../../src/assets/icons/box(4)1.svg"
import workschedule1 from "../../../src/assets/icons/work-schedule1.svg"
import graph1 from "../../../src/assets/icons/graph(1)1.svg"
import fi_3388671 from "../../../src/assets/icons/fi_3388671.svg"
import agenda1 from "../../../src/assets/icons/agenda1.svg"
import package1 from "../../../src/assets/icons/package1.svg"
import fi_3199725 from "../../../src/assets/icons/fi_3199725.svg"
import block1 from "../../../src/assets/icons/block1.svg"
import fi_621995 from "../../../src/assets/icons/fi_621995.svg"
import categories1 from "../../../src/assets/icons/categories(1)1.svg"
import fi_2326145 from "../../../src/assets/icons/fi_2326145.svg"
import question1 from "../../../src/assets/icons/question1.svg"
import fi_503849 from "../../../src/assets/icons/fi_503849.svg"
import hierachy1 from "../../../src/assets/icons/hierachy1.svg"
import tag31 from "../../../src/assets/icons/tag(3)1.svg"
import node1 from "../../../src/assets/icons/node1.svg"
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { clearAllStorage } from '../../../services/TokenService';
import { clearUser, setNotificationCount, setUser } from '../../redux/user/UserSlice';
import axiosWrapper from '../../../services/AxiosWrapper';


function Header() {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [openMenu, setOpenMenu] = useState(null);
    const [openSubMenu, setOpenSubMenu] = useState(null);
    // const [notificationCount, setNotificationCount] = useState(null);
    const location = useLocation();
    const dropdownRef = useRef(null);
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);
    const navigate = useNavigate();
    const assetsRef = useRef();
    const notificationCount = useSelector((state) => state.user.notificationCount);
    // console.log(notificationCount)
    const [parameterTypes, setParameterTypes] = useState([]);
    const menuWrapperRef = useRef(null);

    useEffect(() => {
        const stored = sessionStorage.getItem("parameterTypes");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setParameterTypes(parsed);
            } catch (err) {
                console.error("Invalid parameterTypes in sessionStorage", err);
            }
        }
        getNotificationCount();
    }, []);


    useEffect(() => {
        setOpenMenu(null);
        setOpenSubMenu(null);
        setShowProfileMenu(false);
    }, [location]);
    useEffect(() => {
        const handleClickOutside = (e) => {
            const clickedInside = dropdownRef.current?.contains(e.target);
            const isLogoutButton = e.target.closest("button.dropdown-item");

            if (!clickedInside && !isLogoutButton) {
                setShowProfileMenu(false);
            }
            const clickedProfile = dropdownRef.current?.contains(e.target);

            if (!clickedProfile && !isLogoutButton) {
                setShowProfileMenu(false);
            }

            // For main and sub menus
            const clickedInsideMenu = menuWrapperRef.current?.contains(e.target);

            if (!clickedInsideMenu) {
                setOpenMenu(null);
                setOpenSubMenu(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);



    const handleMenuToggle = (menuId) => {
        setOpenSubMenu(openSubMenu === menuId ? null : menuId);
    };

    const getNotificationCount = async () => {
        try {
            const response = await axiosWrapper(
                `api/v1/notifications/countUnreadNotifications`,
                { method: 'POST' }
            );
            dispatch(setNotificationCount(response.data))

        } catch (error) {
            console.error("Failed to fetch roles:", error.message || error);
        }
    };

    const handleLogout = () => {
        dispatch(setUser({ user: null, token: null, _persist: null }));
        clearAllStorage(); // ✅ clears sessionStorage and localStorage
        navigate("/");
    };

    useEffect(() => {
        const handleSidebarToggle = () => {
            const bars = document.querySelector(".menu-icon");
            const sidebar = document.querySelector(".sidebar");
            const closingButton = document.querySelector(".close-icon");
            if (bars && sidebar) {
                bars.addEventListener("click", () => {
                    sidebar.classList.toggle("show-sidebar");
                });
            }
            if (closingButton && sidebar) {
                closingButton.addEventListener("click", () => {
                    sidebar.classList.remove("show-sidebar");
                });
            }
        };

        setTimeout(handleSidebarToggle, 0);

        const handleScroll = () => {
            const navbar = document.getElementById("navbar");
            if (navbar) {
                if (window.scrollY > 0) {
                    navbar.classList.add("fixed");
                } else {
                    navbar.classList.remove("fixed");
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);
    return (
        <>

            <div className="nav-container">
                <div className="d-flex justify-content-between align-content-center flex-wrap navbar-1" >
                    <div className="pl-60 d-flex">
                        <img
                            src={Component2}

                            style={{ marginRight: 12 }}
                            className="menu-icon"
                        />
                        <div className="logo-m">
                            <a href="Dashboard.html">
                                <img src={logom} width="46px" height="29.86px" />
                            </a>
                        </div>
                        {/* <div className="search-div">
                            <a href="Dashboard.html">
                                <img src={Navlogo} alt="Logo" />
                            </a>

                            <Search />
                        </div> */}

                        <div className="search-div">
                            <Link to="/dashboard">
                                <img src={Navlogo} alt="Logo" />
                            </Link>
                            {location.pathname === '/dashboard' && (
                                <Search />)}
                        </div>

                    </div>
                    <div className="d-flex justify-content-between align-content-center flex-wrap">
                        <Link to="/notifications" className="bell-icon me-2" style={{ textDecoration: 'none' }}>
                            <img src={bellIcon} alt="Notifications" />
                            {notificationCount > 0 && (
                                <span className="notification-badge">{notificationCount}</span>
                            )}
                        </Link>

                        {location.pathname === '/dashboard' && (
                            <img src={settings} className="settings" />)}


                        <li className="nav-item dropdown profile-btn" ref={dropdownRef} style={{ position: 'relative', zIndex: 9999 }}>
                            <div
                                className="nav-link d-flex gap-btwn"
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                role="button"
                            >
                                <img src={fi_1946429} alt="Profile" />
                                <span className="mble-hide">{user?.name || "Profile Name"}</span>
                                <img src={ArrowDown} alt="Arrow" style={{ transform: showProfileMenu ? "rotate(180deg)" : "rotate(0deg)" }} />
                            </div>

                            {showProfileMenu && (
                                <ul className="dropdown-menu menu-list profile-ul show" style={{ display: "block" }}>
                                    <li>
                                        <a className="dropdown-item d-flex justify-content-start gap-3" href="/profileSettings">
                                            <img src={setting} alt="Settings" />
                                            <p className="m-0">Profile Settings</p>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="dropdown-item d-flex justify-content-start gap-3" href="/globalSettings">
                                            <img src={globe} alt="Global" />
                                            <p className="m-0">Global Settings</p>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="dropdown-item d-flex justify-content-start gap-3" href="/operationalSettings">
                                            <img src={sett} alt="Operational" />
                                            <p className="m-0">Operational Settings</p>
                                        </a>
                                    </li>
                                    <li>
                                        <button className="dropdown-item d-flex justify-content-start gap-3" onClick={handleLogout}>
                                            <img src={sett} alt="Logout" />
                                            <p className="m-0">Logout</p>
                                        </button>
                                    </li>
                                </ul>
                            )}
                        </li>
                    </div>
                </div>
                {/* Header Menu */}
                <nav id="navbar" className="navbar navbar-expand-lg navbar-light navbar-2">
                    <div className="container-fluid p-0">
                        <div className="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul className="navbar-nav navbar w-100 mb-2 mb-lg-0 dropdown-text">
                                <li className="nav-item dropdown topnav">
                                    <a
                                        className="nav-link active"
                                        href="Dashboard.html"
                                        id="navbarDropdown"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        <img src={home} />
                                        <span>HOME</span>
                                    </a>
                                    <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                                        <li>
                                            <a className="link d-flex gap-2" href="#">
                                                <img src={layout} />
                                                <p className="m-0">Dashboard</p>
                                            </a>
                                        </li>
                                        <li>
                                            <a className="link d-flex gap-2" href="#">
                                                <img src={graph} />
                                                <p className="m-0">Analytics</p>
                                            </a>
                                        </li>
                                    </ul>
                                </li>

                                <li className="nav-item dropdown" ref={menuWrapperRef}>
                                    <a
                                        className="nav-link"
                                        id="navbarDropdown"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                        onClick={() => setOpenMenu(openMenu === "main" ? null : "main")}
                                    >
                                        <img src={fi_1828824} />
                                        <span>CONFIGURE</span>
                                        <img src={ArrowDown} />
                                    </a>

                                    {openMenu === "main" && (
                                        <ul className="dropdown-menu show">
                                            {/* Lineage Parameters */}
                                            {parameterTypes.map(pt => (
                                                <li key={pt._id} className="position-relative">
                                                    <button className="dropdown-item d-flex justify-content-between align-items-center" onClick={() => setOpenSubMenu(openSubMenu === pt._id ? null : pt._id)}>
                                                        <div className="d-flex gap-3 align-items-center">            <img src={adjust1} alt="Lineage" /><p className="m-0">{pt.parameter_type_name}</p></div>
                                                        <img className="icon" src={ArrowLineRight} style={{ transform: openSubMenu === pt._id ? 'rotate(90deg)' : 'rotate(0deg)' }} alt="Toggle Submenu" />
                                                    </button>
                                                    {openSubMenu === pt._id && (
                                                        <ul className="submenu position-absolute" style={{ left: '100%', top: 0 }}>
                                                            {pt.masterDetails?.length
                                                                ? pt.masterDetails.map(md => (
                                                                    <li key={md.masterId}>
                                                                        <button className="dropdown-item gap-3" onClick={() => {
                                                                            navigate(`/masters/${md.masterId}`);
                                                                            setOpenMenu(null);
                                                                            setOpenSubMenu(null);
                                                                        }}>
                                                                            <img className="icon" src={ArrowLineRight} alt="Toggle Submenu" />
                                                                            {md.masterName}
                                                                        </button>
                                                                    </li>
                                                                ))
                                                                : <li><span className="dropdown-item">— No items —</span></li>
                                                            }
                                                        </ul>
                                                    )}
                                                </li>
                                            ))}


                                            {/* Repeat similarly for other menus */}
                                            <li className="menu-item">
                                                <button
                                                    className="dropdown-item d-flex justify-content-between align-items-center"
                                                    onClick={() => handleMenuToggle("attribute")}
                                                >
                                                    <div className="d-flex gap-3 align-items-center">
                                                        <img src={tag} alt="Attribute" />
                                                        <p className="m-0">Users Settings</p>
                                                    </div>
                                                    <img className="icon" src={ArrowLineRight} alt="Arrow" />
                                                </button>
                                                {openSubMenu === "attribute" && (
                                                    <ul className="submenu">
                                                        {/* <li><a href="equipment-groups.html">Equipment Group</a></li>
                                                        <li><a href="equipment-types.html">Equipment Type</a></li>
                                                        <li><a href="#">Equipment Subtype</a></li>
                                                        <li><a href="#">Components</a></li> */}
                                                        <li><img src={tag} alt="Lineage" /><Link to="/roleGroup">Role Group</Link></li>
                                                        <li><img src={tag} alt="Lineage" /><Link to="/roles">Role</Link></li>
                                                        <li><img src={tag} alt="Lineage" /><Link to="/departments">Department</Link></li>
                                                        <li><img src={adjust1} alt="Lineage" /><Link to="/users">Users</Link></li>

                                                    </ul>
                                                )}
                                            </li>
                                            {/* <li className="btn-group dropend d-flex">
                                                <Link
                                                    className="dropdown-item d-flex justify-content-start gap-3"
                                                    to="/master"
                                                >
                                                    <div className="d-flex gap-3">
                                                        <img
                                                            src={tag}

                                                            alt="Masters"
                                                        />
                                                        <p className="m-0">Masters</p>
                                                    </div>
                                                </Link >
                                            </li> */}

                                            <li className="btn-group dropend d-flex">
                                                <Link
                                                    className="dropdown-item d-flex justify-content-start gap-3"
                                                    to="/master"
                                                >
                                                    <div className="d-flex gap-3">
                                                        <img src={tag} alt="Masters" />
                                                        <p className="m-0">Masters</p>
                                                    </div>
                                                </Link>
                                            </li>

                                            {/* Add other sections like Variable, Data Source, General, Modal, User similarly */}
                                        </ul>
                                    )}
                                </li>

                                <li className="nav-item dropdown position-relative">
                                    <a
                                        type="button"
                                        className="nav-link d-flex align-items-center gap-2"
                                        onClick={() => setOpenMenu(openMenu === "templates" ? null : "templates")}
                                    >
                                        <img src={fi_1828824} alt="Templates" />
                                        <span>TEMPLATES</span>
                                        <img src={ArrowDown} alt="Dropdown" />
                                    </a>

                                    {openMenu === "templates" && (
                                        <ul className="dropdown-menu show">
                                            <li className="menu-item">
                                                <button
                                                    className="dropdown-item d-flex justify-content-start gap-3 align-items-center"
                                                    onClick={() => window.location.href = 'lineage-templates.html'}
                                                >
                                                    <img src={IconSet} alt="Lineage Templates" />
                                                    <p className="m-0">Lineage Templates</p>
                                                </button>
                                            </li>
                                            <li className="menu-item">
                                                <button className="dropdown-item d-flex justify-content-start gap-3 align-items-center">
                                                    <img src={bag1} alt="Asset Templates" />
                                                    <p className="m-0">Asset Templates</p>
                                                </button>
                                            </li>
                                            <li className="menu-item">
                                                <button className="dropdown-item d-flex justify-content-start gap-3 align-items-center">
                                                    <img src={layout1} alt="Variable Templates" />
                                                    <p className="m-0">Variable Templates</p>
                                                </button>
                                            </li>
                                            <li className="menu-item">
                                                <button className="dropdown-item d-flex justify-content-start gap-3 align-items-center">
                                                    <img src={box1} alt="Modal Templates" />
                                                    <p className="m-0">Modal Templates</p>
                                                </button>
                                            </li>
                                            <li className="menu-item">
                                                <button className="dropdown-item d-flex justify-content-start gap-3 align-items-center">
                                                    <img src={workschedule1} alt="Use Case Templates" />
                                                    <p className="m-0">Use Case Templates</p>
                                                </button>
                                            </li>
                                            <li className="menu-item">
                                                <button className="dropdown-item d-flex justify-content-start gap-3 align-items-center">
                                                    <img src={graph1} alt="Analytics Templates" />
                                                    <p className="m-0">Analytics Templates</p>
                                                </button>
                                            </li>
                                        </ul>
                                    )}
                                </li>


                                <li className="nav-item dropdown" ref={assetsRef}>
                                    <a
                                        type="button"
                                        className="nav-link d-flex align-items-center gap-2"
                                        onClick={() => setOpenMenu(openMenu === "assets" ? null : "assets")}
                                    >
                                        <img src={fi_3388671} alt="Assets" />
                                        <span>ASSETS</span>
                                        <img src={ArrowDown} alt="Dropdown" />
                                    </a>

                                    {openMenu === "assets" && (
                                        <ul className="dropdown-menu show">
                                            {/* ✅ Use Link here */}
                                            <li className="menu-item">
                                                <Link
                                                    to="/assets"
                                                    className="dropdown-item d-flex justify-content-start gap-3 align-items-center"
                                                    style={{ textDecoration: "none", color: "inherit" }}
                                                >
                                                    <img src={package1} alt="Asset" />
                                                    <p className="m-0">Asset</p>
                                                </Link>
                                            </li>

                                            {/* Rest unchanged buttons */}
                                            <li className="menu-item">
                                                <button
                                                    className="dropdown-item d-flex justify-content-start gap-3 align-items-center"
                                                    onClick={() => (window.location.href = "assetclass.html")}
                                                >
                                                    <img src={agenda1} alt="Asset Class" />
                                                    <p className="m-0">Asset Class</p>
                                                </button>
                                            </li>
                                            <li className="menu-item">
                                                <button
                                                    className="dropdown-item d-flex justify-content-start gap-3 align-items-center"
                                                    onClick={() => (window.location.href = "assetgroup.html")}
                                                >
                                                    <img src={package1} alt="Asset Modal" />
                                                    <p className="m-0">Asset Modal</p>
                                                </button>
                                            </li>
                                        </ul>
                                    )}

                                </li>


                                <li className="nav-item dropdown">
                                    <a
                                        className="nav-link"
                                        id="navbarDropdown"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        <img src={fi_3199725} />
                                        <span>MODELS</span>
                                        <img src={ArrowDown} />
                                    </a>
                                    <ul
                                        className="dropdown-menu menu-list"
                                        aria-labelledby="navbarDropdown"
                                    >
                                        <li>
                                            <a
                                                className="dropdown-item d-flex justify-content-start gap-3
                  "
                                                href="modelclass.html"
                                            >
                                                <img src={block1} />
                                                <p className="m-0">Modal Class</p>
                                            </a>
                                        </li>
                                    </ul>
                                </li>

                                <li className="nav-item dropdown">
                                    <a
                                        className="nav-link"
                                        id="navbarDropdown"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        <img src={fi_621995} />
                                        <span>MY ASSETS</span>
                                        <img src={ArrowDown} />
                                    </a>
                                    <ul
                                        className="dropdown-menu menu-list"
                                        aria-labelledby="navbarDropdown"
                                    >
                                        <li>
                                            <a
                                                className="dropdown-item d-flex justify-content-start gap-3
                  "
                                                href="my-assets.html"
                                            >
                                                <img src={categories1} />
                                                <p className="m-0">All Assets</p>
                                            </a>
                                        </li>
                                    </ul>
                                </li>

                                <li className="nav-item dropdown">
                                    <a
                                        className="nav-link"
                                        id="navbarDropdown"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        <img src={fi_2326145} />
                                        <span>REVIEW</span>
                                        <img src={ArrowDown} />
                                    </a>
                                    <ul
                                        className="dropdown-menu menu-list"
                                        aria-labelledby="navbarDropdown"
                                    >
                                        <li>
                                            <a
                                                className="dropdown-item d-flex justify-content-start gap-3
                  "
                                                href="reviews.html"
                                            >
                                                <img src={agenda1} />
                                                <p className="m-0">List of Assets</p>
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                className="dropdown-item d-flex justify-content-start gap-3
                  "
                                                href="#"
                                            >
                                                <img src={flag1} />
                                                <p className="m-0">List of Variable</p>
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                className="dropdown-item d-flex justify-content-start gap-3
                  "
                                                href="#"
                                            >
                                                <img src={ddd} />
                                                <p className="m-0">List of Modals</p>
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                className="dropdown-item d-flex justify-content-start gap-3
                  "
                                                href="#"
                                            >
                                                <img src={question1} />
                                                <p className="m-0">Special Query</p>
                                            </a>
                                        </li>
                                    </ul>
                                </li>

                                <li className="nav-item dropdown" ref={dropdownRef}>
                                    <a
                                        className="nav-link"
                                        id="navbarDropdown"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                        onClick={() => setOpenMenu(openMenu === "utility" ? null : "utility")}
                                    >
                                        <img src={fi_503849} />
                                        <span>UTILITIES</span>
                                        <img src={ArrowDown} />
                                    </a>

                                    {openMenu === "utility" && (
                                        <ul className="dropdown-menu show">
                                            {/* Lineage Parameters */}
                                            <li className="btn-group dropend d-flex">
                                                <Link
                                                    className="dropdown-item d-flex justify-content-start gap-3"
                                                    to="/notifications"
                                                >
                                                    <div className="d-flex gap-3">
                                                        <img src={tag} alt="Masters" />
                                                        <p className="m-0">Notifications</p>
                                                    </div>
                                                </Link>
                                            </li>
                                        </ul>
                                    )}
                                </li>

                            </ul>
                        </div>
                    </div>
                </nav>
            </div>
        </>

    )
}

export default Header

