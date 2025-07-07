import React from 'react'
import { useLocation } from 'react-router-dom';

function Search() {
    const location = useLocation();
    return (
        <>

            <input type="text" name="search" id="search" placeholder="Search" />
            {location.pathname === '/dashboard' && (<img className="search" src="/src/assets/icons/search1.svg" alt="search" />)}
        </>
    )
}

export default Search