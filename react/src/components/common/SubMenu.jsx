import React from 'react'
import TemplateIcon from "/src/assets/icons/fi_1828824.svg"
import TemplateIconHover from "/src/assets/icons/fi_1828824hover.svg"
import ArrowVector from "/src/assets/icons/arrow-Vector.svg"
import ArrowHover from "/src/assets/icons/heroicons_arrow-long-left1.svg"
import ModelIcon from "/src/assets/icons/models.svg"
import assetIcon from "/src/assets/icons/assets.svg"
import assetHover from "/src/assets/icons/fi_621995hover.svg"
import tagsIcon from "/src/assets/icons/tags.svg"
import tagsIconHover from "/src/assets/icons/fi_3388671hover.svg"
import masterIcons from "/src/assets/icons/masters.svg"
import masterIconsHover from "/src/assets/icons/fi_624727hover.svg"
import EquipmetIcons from "/src/assets/icons/models40.svg"
import EquipmentIconsHover from "/src/assets/icons/fi_624722hover.svg"
function SubMenu() {
    return (
        <>
            <div>
                <div className="row card-border">
                    <div className="col-md-4 col-lg-2 col-6 p-0 card-tab">
                        <div className="menu-card card1-border border-r border-btm">
                            <img
                                className="non-hover"
                                src={TemplateIcon}
                                height="28px"
                                width="28px"
                                alt="Templates Icon"
                            />
                            <img
                                className="on-hover"
                                src={TemplateIconHover}
                                height="28px"
                                width="28px"
                                alt="Templates Icon"
                            />
                            <h3>40 Users</h3>
                            <img
                                className="arrow-bg"
                                src={ArrowVector}
                                height="40px"
                                width="40px"
                                alt="Templates Icon"
                            />
                            <img
                                className="arrow-bg-hover"
                                src={ArrowHover}
                                alt="Templates Icon"
                            />
                        </div>
                    </div>
                    <div className="col-md-4 col-lg-2 col-6 p-0 card-tab ">
                        <div className="menu-card card1-border border-r border-btm">
                            <img
                                src={ModelIcon}
                                height="28px"
                                width="28px"
                                alt="Templates Icon"
                            />
                            <h3>80 Masters</h3>
                            <img
                                className="arrow-bg"
                                src={ArrowVector}
                                height="40px"
                                width="40px"
                                alt="Templates Icon"
                            />
                               <img
                                className="arrow-bg-hover"
                                src={ArrowHover}
                                alt="Templates Icon"
                            />
                        </div>
                    </div>
                    <div className="col-md-4 col-lg-2 col-6 p-0 card-tab">
                        <div className="menu-card card1-border border-r border-btm">
                            <img
                                className="non-hover"
                                src={assetIcon}
                                height="28px"
                                width="28px"
                                alt="Templates Icon"
                            />
                            <img
                                className="on-hover"
                                src={assetHover}
                                height="28px"
                                width="28px"
                                alt="Templates Icon"
                            />
                            <h3>220 Templates</h3>
                            <img
                                className="arrow-bg"
                                 src={ArrowVector}
                                height="40px"
                                width="40px"
                                alt="Templates Icon"
                            />
                            <img
                                className="arrow-bg-hover"
                                 src={ArrowHover}
                                alt="Templates Icon"
                            />
                        </div>
                    </div>
                    <div className="col-md-4 col-lg-2 col-6 p-0 card-tab">
                        <div className="menu-card border-r border-btm">
                            <img
                                className="non-hover"
                                src={tagsIcon}
                                height="28px"
                                width="28px"
                                alt="Templates Icon"
                            />
                            <img
                                className="on-hover"
                                src={tagsIconHover}
                                height="28px"
                                width="28px"
                                alt="Templates Icon"
                            />
                            <h3>4080 Assets</h3>
                            <img
                                className="arrow-bg"
                                 src={ArrowVector}
                                height="40px"
                                width="40px"
                                alt="Templates Icon"
                            />
                            <img
                                className="arrow-bg-hover"
                                 src={ArrowHover}
                                alt="Templates Icon"
                            />
                        </div>
                    </div>
                    <div className="col-md-4 col-lg-2 col-6 p-0 card-tab">
                        <div className="menu-card border-x border-r border-btm">
                            <img
                                className="non-hover"
                                src={masterIcons}
                                height="28px"
                                width="28px"
                                alt="Templates Icon"
                            />
                            <img
                                className="on-hover"
                                src={masterIconsHover}
                                height="28px"
                                width="28px"
                                alt="Templates Icon"
                            />
                            <h3>220 Models</h3>
                            <img
                                className="arrow-bg"
                                 src={ArrowVector}
                                height="40px"
                                width="40px"
                                alt=""
                            />
                            <img
                                className="arrow-bg-hover"
                                 src={ArrowHover}
                                alt="Templates Icon"
                            />
                        </div>
                    </div>
                    <div className="col-md-4 col-lg-2 col-6 p-0 card-tab">
                        <div className="menu-card border-l border-btm">
                            <img
                                className="non-hover"
                                src={EquipmetIcons}
                                height="28px"
                                width="28px"
                                alt="Templates Icon"
                            />
                            <img
                                className="on-hover"
                                src={EquipmentIconsHover}
                                height="28px"
                                width="28px"
                                alt="Templates Icon"
                            />
                            <h3>40 Equipments</h3>
                            <img
                                className="arrow-bg"
                                 src={ArrowVector}
                                height="40px"
                                width="40px"
                                alt=""
                            />
                            <img
                                className="arrow-bg-hover"
                                 src={ArrowHover}
                                alt="Templates Icon"
                            />
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default SubMenu
