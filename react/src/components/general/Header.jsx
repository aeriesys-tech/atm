import React, { useEffect, useState } from 'react'
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


function Header() {
    const [openMenu, setOpenMenu] = useState(null);

    const handleMenuToggle = (menuId) => {
        setOpenMenu(openMenu === menuId ? null : menuId);
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
        // Delay to ensure DOM is loaded
        setTimeout(handleSidebarToggle, 0);
        // Sticky navbar
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
                <div className="d-flex justify-content-between align-content-center flex-wrap navbar-1">
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
                        <div className="search-div">
                            <a href="Dashboard.html">
                                <img src={Navlogo} alt="Logo" />
                            </a>

                            <Search />
                        </div>
                    </div>
                    <div className="d-flex justify-content-between align-content-center flex-wrap">
                        <div className="bell-icon">
                            <img src={bellIcon} />{" "}
                            {/* Replace with your bell icon */}
                            <span className="notification-badge">2</span>{" "}
                            {/* Replace with the actual notification count */}
                        </div>
                        <img src={settings} className="settings" />
                        <li className="nav-item dropdown profile-btn">
                            <a
                                className="nav-link d-flex gap-btwn"
                                href="#"
                                id="navbarDropdown"
                                role="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <img src={fi_1946429} />
                                <span className="mble-hide">Profile Name</span>
                                <img src={ArrowDown} />
                            </a>
                            <ul
                                className="dropdown-menu menu-list profile-ul"
                                aria-labelledby="navbarDropdown"
                            >
                                <li>
                                    <a
                                        className="dropdown-item d-flex justify-content-start gap-3
              "
                                        href="profileSettings.html"
                                    >
                                        <img src={setting} />
                                        <p className="m-0">Profile Settings</p>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className="dropdown-item d-flex justify-content-start gap-3
              "
                                        href="globalSettings.html"
                                    >
                                        <img src={globe} />
                                        <p className="m-0">Global Settings</p>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className="dropdown-item d-flex justify-content-start gap-3
              "
                                        href="#"
                                    >
                                        <img src={sett} />
                                        <p className="m-0">Operational Settings</p>
                                    </a>
                                </li>
                            </ul>
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

                                <li className="nav-item dropdown">
                                    <a
                                        className="nav-link"
                                        href="#"
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
                                            <li className="menu-item">
                                                <button
                                                    className="dropdown-item d-flex justify-content-between align-items-center"
                                                    onClick={() => handleMenuToggle("lineage")}
                                                >
                                                    <div className="d-flex gap-3 align-items-center">
                                                        <img src={adjust1} alt="Lineage" />
                                                        <p className="m-0">Lineage Parameters</p>
                                                    </div>

                                                    <img className="icon" src={ArrowLineRight} alt="Arrow" />
                                                </button>
                                                {openMenu === "lineage" && (
                                                    <ul className="submenu">
                                                        <li><a href="newconfigureunit.html">Units</a></li>
                                                        <li><a href="secotrs.html">Sector</a></li>
                                                        <li><a href="#">Cluster</a></li>
                                                        <li><a href="#">Plant</a></li>
                                                        <li><a href="#">Line</a></li>
                                                        <li><a href="#">Section</a></li>
                                                        <li><button className="li-menu-btn">Add New</button></li>
                                                    </ul>
                                                )}
                                            </li>

                                            {/* Repeat similarly for other menus */}
                                            <li className="menu-item">
                                                <button
                                                    className="dropdown-item d-flex justify-content-between align-items-center"
                                                    onClick={() => handleMenuToggle("attribute")}
                                                >
                                                    <div className="d-flex gap-3 align-items-center">
                                                        <img src={tag} alt="Attribute" />
                                                        <p className="m-0">Attribute Parameters</p>
                                                    </div>
                                                    <img className="icon" src={ArrowLineRight} alt="Arrow" />
                                                </button>
                                                {openMenu === "attribute" && (
                                                    <ul className="submenu">
                                                        <li><a href="equipment-groups.html">Equipment Group</a></li>
                                                        <li><a href="equipment-types.html">Equipment Type</a></li>
                                                        <li><a href="#">Equipment Subtype</a></li>
                                                        <li><a href="#">Components</a></li>
                                                        <li><a href="#">Drive Type</a></li>
                                                        <li><a href="#">OEM List</a></li>
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

                                <li className="nav-item dropdown">
                                    <a
                                        className="nav-link"
                                        href="#"
                                        id="navbarDropdown"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        <img src={fi_1828824} />
                                        <span>TEMPLATES</span>
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
                                                href="lineage-templates.html"
                                            >
                                                <img src={IconSet} />
                                                <p className="m-0">Lineage Templates</p>
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                className="dropdown-item d-flex justify-content-start gap-3
                  "
                                                href="#"
                                            >
                                                <img src={bag1} />
                                                <p className="m-0">Asset Templates</p>
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                className="dropdown-item d-flex justify-content-start gap-3
                  "
                                                href="#"
                                            >
                                                <img src={layout1} />
                                                <p className="m-0">Variable Templates</p>
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                className="dropdown-item d-flex justify-content-start gap-3
                  "
                                                href="#"
                                            >
                                                <img src={box1} />
                                                <p className="m-0">Modal Templates</p>
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                className="dropdown-item d-flex justify-content-start gap-3
                  "
                                                href="#"
                                            >
                                                <img src={workschedule1} />
                                                <p className="m-0">Use Case Templates</p>
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                className="dropdown-item d-flex justify-content-start gap-3
                  "
                                                href="#"
                                            >
                                                <img src={graph1} />
                                                <p className="m-0">Analytics Templates</p>
                                            </a>
                                        </li>
                                    </ul>
                                </li>

                                <li className="nav-item dropdown">
                                    <a
                                        className="nav-link"
                                        href="#"
                                        id="navbarDropdown"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        <img src={fi_3388671} />
                                        <span>ASSETS</span>
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
                                                href="assetclass.html"
                                            >
                                                <img src={agenda1} />
                                                <p className="m-0">Asset Class</p>
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                className="dropdown-item d-flex justify-content-start gap-3
                  "
                                                href="assetgroup.html"
                                            >
                                                <img src={package1} />
                                                <p className="m-0">Asset Modal</p>
                                            </a>
                                        </li>
                                    </ul>
                                </li>

                                <li className="nav-item dropdown">
                                    <a
                                        className="nav-link"
                                        href="#"
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
                                        href="#"
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
                                        href="#"
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

                                <li className="nav-item dropdown">
                                    <a
                                        className="nav-link"
                                        href="#"
                                        id="navbarDropdown"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        <img src={fi_503849} />
                                        <span>UTILITIES</span>
                                        <img src={ArrowDown} />
                                    </a>
                                    <ul
                                        className="dropdown-menu menu-list dropdown-w"
                                        aria-labelledby="navbarDropdown"
                                    >
                                        <li>
                                            <a
                                                className="dropdown-item d-flex justify-content-start gap-3
                  "
                                                href="#"
                                            >
                                                <img src={hierachy1} />
                                                <p className="m-0">Asset Taxonomy</p>
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                className="dropdown-item d-flex justify-content-start gap-3
                  "
                                                href="#"
                                            >
                                                <img src={tag31} />
                                                <p className="m-0">Tag Structure</p>
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                className="dropdown-item d-flex justify-content-start gap-3
                  "
                                                href="#"
                                            >
                                                <img src={node1} />
                                                <p className="m-0">Modal Structure</p>
                                            </a>
                                        </li>
                                    </ul>
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

