import React from 'react'

function Button({ name }) {
    return (
        <>
            <button type="button" id="openPopup" className="btn-bg">
                {name}{" "}
                <span className="arrow-white">
                    {" "}
                    <img src="assets/icons/majesticons_arrow-right.svg" alt="" />
                </span>
            </button>
        </>

    )
}

export default Button