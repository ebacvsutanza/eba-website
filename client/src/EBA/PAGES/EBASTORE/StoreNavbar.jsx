import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { BiChevronLeft } from "react-icons/bi";

export default function StoreNavbar({ fetchCart, carts }) {
  const token = localStorage.getItem("token");
  useEffect(() => {
    if (!token) {
			alert("Please Login First");
      window.location.href = "/userlogin";
      return;
    }
    fetchCart();
  }, [token, fetchCart]);

  const handleNavigation = () => {
    if (window.location.pathname === "/ebastore") {
      window.location.href = "/";
      localStorage.removeItem("token");
    } else {
      window.location.href = "/ebastore";
    }
  };

  return (
    <header className="px-5">
      <nav className="w-full py-3 flex justify-between items-center">
        <div className="center-flex gap-5">
          <button onClick={handleNavigation} className="cursor-pointer">
            <BiChevronLeft className="text-3xl" />
          </button>
          <img src="logo.png" alt="" className="w-15 h-15" />
          <div className="text-left font-bold hidden md:block">
            <h3>Cavite State University - Tanza</h3>
            <p className="text-(--secondary-text)">EBA Store</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => (window.location.href = "/catalog")}
            className="w-[130px] p-2 text-white center-flex gap-2 bg-(--primary-btn) rounded-lg cursor-pointer"
          >
            <img src="catalog.png" alt="" style={{ width: 16 }} />
            Catalog
          </button>
          <button
            onClick={() => (window.location.href = "/ebacart")}
            className="w-[130px] p-2 text-white center-flex gap-2 bg-(--primary-btn) rounded-lg relative cursor-pointer"
          >
            <FontAwesomeIcon icon={faCartShopping} />
            My Cart
            <span className="w-5 h-5 bg-red-500 center-flex rounded-full text-white absolute -top-1 -right-1">
              {carts.length}
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
}
