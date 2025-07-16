import React from 'react'
import { useLocation } from 'react-router-dom';
import serachicon from '../../assets/icons/search1.svg'
function Search() {
    const location = useLocation();
    return (
        <>

            <input type="text" name="search" id="search" placeholder="Search" />
            {location.pathname === '/dashboard' && (<img className="search" src={serachicon} alt="search" />)}
        </>
    )
}

export default Search