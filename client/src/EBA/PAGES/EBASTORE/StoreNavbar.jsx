import React from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';
import "./CSS/Store.css";


export default function StoreNavbar({ carts }) {
  const handleNavigation = () => {
    if (window.location.pathname === "/ebastore") {
      window.location.href = "/eba";
      localStorage.removeItem("token");
    } else {
      window.location.href = "/ebastore";
    }
  };

  return (
    <header>
      <nav>
        <button onClick={handleNavigation}>
          <img src="logo.png" alt="" className="logo" />
          <div>
            <h3>Cavite State University - Tanza</h3>
            <p>EBA Store</p>
          </div>
        </button>

        <div className="group">
          <button onClick={() => window.location.href = '/catalog'} >
            <img src="catalog.png" alt="" style={{width: 16}} />
            Catalog
          </button>
          <button onClick={() => window.location.href = '/ebacart'} className="cart">
            <FontAwesomeIcon icon={faCartShopping} />
            Cart
            <span>{carts.length}</span>
          </button>
        </div>
      </nav>
    </header>
  )
}