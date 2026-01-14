import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";

export default function StoreNavbar({ carts = [] }) {
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
      <nav className="w-full py-3 flex justify-between items-center">
        <button
          onClick={handleNavigation}
          className="center-flex gap-5 cursor-pointer"
        >
          <img src="logo.png" alt="" className="w-15 h-15" />
          <div className="text-left font-bold">
            <h3>Cavite State University - Tanza</h3>
            <p className="text-(--secondary-text)">EBA Store</p>
          </div>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => (window.location.href = "/catalog")}
            className="w-[150px] p-2 text-white center-flex gap-2 bg-(--primary-btn) rounded-lg cursor-pointer"
          >
            <img src="catalog.png" alt="" style={{ width: 16 }} />
            Catalog
          </button>
          <button
            onClick={() => (window.location.href = "/ebacart")}
            className="w-[150px] p-2 text-white center-flex gap-2 bg-(--primary-btn) rounded-lg relative cursor-pointer"
          >
            <FontAwesomeIcon icon={faCartShopping} />
            Cart
            <span className="w-5 h-5 bg-red-500 center-flex rounded-full text-white absolute -top-1 -right-1">
              {carts.length}
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
}
