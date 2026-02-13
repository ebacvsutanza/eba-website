import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faSearch } from '@fortawesome/free-solid-svg-icons';

import StoreNavbar from './StoreNavbar'
import CatalogSidebar from './CatalogSidebar';
import CartModal from './CartModal';


export default function Catalog() {
  const [rotate, setRotate] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openToast, setOpenToast] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  const [carts, setCart] = useState([]);
  const fetchCart = () => {
    axios
      .get("http://localhost:3000/cartItem", {
        headers: {
          Authorization: token,
        },
      })
      .then((response) => {
        const cartItems = response.data.cartItems || [];
        setCart(cartItems);
      })
      .catch((err) => {
        alert(err.response ? err.response.data.message : "An error occurred");
        window.location.href = "/userlogin";
      });
  };

	const token = localStorage.getItem("token");
  const [userId, setUserId] = useState('');
  const [fullName, setFullName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  useEffect(() => {
    if (!token) {
      window.location.href = '/userlogin';
      return;
    }
  
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    setFullName(decodedToken.fullname);
    setEmailAddress(decodedToken.email);
    setUserId(decodedToken.id);

    fetchProduct();
  }, [token]);
  
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const fetchProduct = async () => {
    const res1 = await axios.get("http://localhost:3000/storeinventory");
    setProducts(res1.data);
    const res2 = await axios.get("http://localhost:3000/categories");
    setCategories(res2.data);
  }


  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("Student Uniform");
  useEffect(() => {
    if (location.state?.selectedCategory) {
      setSelectedCategory(location.state.selectedCategory);
    }
  }, [location.state]);  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("Newest");
  const filteredProducts = products
    .filter(
      (product) =>
        product.Category === selectedCategory &&
        product.Item_Name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "low-to-high") return a.Price - b.Price;
      if (sortBy === "high-to-low") return b.Price - a.Price;
      return 0;
    });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const handleOpenModal = (e, product) => {
    e.stopPropagation();
    setOpenModal(true);
    setSelectedProduct(product);
  }
  
  return (
    <div className="h-screen">
      <div className="lg:px-[1.3in]">
        <StoreNavbar carts={carts} fetchCart={fetchCart} />
      </div>

      <div className="py-5 h-[90vh] flex flex-col md:flex-row">
        <CatalogSidebar
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        <div className="md:w-3/4 p-3 overflow-auto">
          <div className="flex item-center md:gap-5 flex-col md:flex-row">
            <h1 className="text-xl md:text-2xl font-semibold">Catalog</h1>

            <div className="flex flex-col-reverse flex-1">
              <div className="flex flex-row-reverse md:flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder={selectedCategory}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-5 border border-gray-500 rounded-full p-2"
                  />
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                </div>

                <div className="flex items-center gap-3 relative">
                  Sort By
                  <select
                    name=""
                    id=""
                    onClick={() => setRotate((prev) => !prev)}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-[180px] px-5 py-2 center-flex border border-gray-500 rounded-full appearance-none relative"
                  >
                    <option value="low-to-high">Price: Low to High</option>
                    <option value="high-to-low">Price: High to Low</option>
                    <option value="newest" selected>
                      Newest
                    </option>
                  </select>
                  <div className="flex items-center gap-2 absolute right-2 top-1/2 -translate-y-1/2">
                    <svg
                      className={`h-4 w-4 transition-transform ${
                        rotate ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <p className="text-sm my-3 md:hidden">
                Listing{" "}
                <span className="font-bold">{filteredProducts.length}</span>{" "}
                items for "{selectedCategory}"
              </p>
            </div>
          </div>

          <p className="text-sm my-6 hidden md:block">
            Listing <span className="font-bold">{filteredProducts.length}</span>{" "}
            items for "{selectedCategory}"
          </p>

          <div className="my-3 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product, index) => {
              const isActive = activeIndex === index;

              return (
                <div
                  key={product.id ?? index}
                  onClick={() => setActiveIndex(index)}
                  className={`
                    p-2 rounded-lg overflow-hidden cursor-pointer border-2
                    ${
                      isActive
                        ? "border-(--accent) bg-(--primary-btn)/15"
                        : "border-transparent"
                    }
                  `}
                >
                  <div className="aspect-square rounded-xl bg-gray-200 overflow-hidden flex items-center justify-center">
                    <img
                      src={`http://localhost:3000/ITEMS/${product.image}`}
                      alt={product.item_name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="h-[130px] py-2 relative flex flex-col justify-between">
                    <h3 className="font-bold text-lg mb-5 line-clamp-2">
                      {product.item_name}
                    </h3>

                    <div className="flex items-center justify-between">
                      <p className="mr-18">Starts at PHP {product.price}</p>

                      <button
                        onClick={(e) => handleOpenModal(e, product)}
                        className={`
                          bg-(--primary-btn) px-5 py-1 rounded-full absolute md:bottom-0 right-0 cursor-pointer
                          ${isActive ? "visible" : "invisible"}
                        `}
                      >
                        <img src="addtocart.png" alt="" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </div>
      </div>

      {openModal && selectedProduct && (
        <CartModal
          fetchCart={fetchCart}
          setOpenModal={setOpenModal}
          setOpenToast={setOpenToast}
          product={selectedProduct}
          userId={userId}
          fullName={fullName}
          emailAddress={emailAddress}
        />
      )}

      {openToast && (
        <div className="w-3/4 md:w-auto bg-(--primary-bg) center-flex gap-2 px-10 py-3 shadow-md rounded-lg fixed left-1/2 -translate-x-1/2 bottom-10">
          <FontAwesomeIcon
            icon={faCheck}
            color="var(--primary-btn)"
            size="2x" 
          />
          <p>Item has been added to cart</p>
        </div>
      )}
    </div>
  );
}