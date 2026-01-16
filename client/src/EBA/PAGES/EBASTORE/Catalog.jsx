import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faChevronLeft, faChevronRight, faSearch, faShoppingCart } from '@fortawesome/free-solid-svg-icons';

import StoreNavbar from './StoreNavbar'
import axios from 'axios';


export default function Catalog() {
  const [open, setOpen] = useState(true);  
  const [opens, setOpens] = useState(false);
  const [rotate, setRotate] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openToast, setOpenToast] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, []);  
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const fetchProduct = async () => {
    const res1 = await axios.get("http://localhost:3000/inventory");
    setProducts(res1.data);
    const res2 = await axios.get("http://localhost:3000/categories");
    setCategories(res2.data);
  }


  const [selectedCategory, setSelectedCategory] = useState("Student Uniform");
  const [searchTerm, setSearchTerm] = useState("");
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

  const clothingCategories = categories.filter(
    (item) => !["Capstone Manual", "Module"].includes(item.Category)
  );
  const bookCategories = categories.filter((item) =>
    ["Capstone Manual", "Module"].includes(item.Category)
  );

  const [selectedProduct, setSelectedProduct] = useState(null);
  const handleOpenModal = (e, product) => {
    e.stopPropagation();
    setOpenModal(true);
    setSelectedProduct(product);
  }
  
  return (
    <div className="h-screen">
      <StoreNavbar />

      <div className="p-5 h-[90vh] flex">
        <div className="w-1/4 p-3">
          <h1 className="mb-10 text-2xl font-semibold">Category</h1>

          <div>
            <button
              onClick={() => setOpen(!open)}
              className={`flex w-full items-center justify-between rounded-lg px-4 py-3 ${
                open && "bg-(--accent)/65 hover:bg-(--accent)/65 text-white"
              } hover:bg-(--accent)/25 transition-all`}
            >
              <span className="font-medium text-lg">Clothing</span>

              <div className="flex items-center gap-2">
                <svg
                  className={`h-4 w-4 transition-transform ${
                    open ? "rotate-180" : ""
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
            </button>
            {open && (
              <ul className="mt-2 space-y-1">
                {clothingCategories.map((item, index) => (
                  <button
                    key={index}
                    className={`
                      w-full text-left cursor-pointer rounded-md px-4 py-2 hover:bg-(--accent)/25
                      ${
                        selectedCategory === item.Category &&
                        "bg-(--accent)/65 hover:bg-(--accent)/65 text-white"
                      }
                    `}
                    onClick={() => setSelectedCategory(item.Category)}
                  >
                    {item.Category}
                  </button>
                ))}
              </ul>
            )}

            <button
              onClick={() => setOpens(!opens)}
              className={`mt-5 flex w-full items-center justify-between rounded-lg px-4 py-3 ${
                opens && "bg-(--accent)/65 hover:bg-(--accent)/65 text-white"
              } hover:bg-(--accent)/25 transition-all`}
            >
              <span className="font-medium text-lg">Books</span>

              <div className="flex items-center gap-2">
                <svg
                  className={`h-4 w-4 transition-transform ${
                    opens ? "rotate-180" : ""
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
            </button>
            {opens && (
              <ul className="mt-2 space-y-1">
                {bookCategories.map((item, index) => (
                  <button
                    key={index}
                    className={`
                      w-full text-left cursor-pointer rounded-md px-4 py-2 hover:bg-(--accent)/25
                      ${
                        selectedCategory === item.Category &&
                        "bg-(--accent)/65 hover:bg-(--accent)/65 text-white"
                      }
                    `}
                    onClick={() => setSelectedCategory(item.Category)}
                  >
                    {item.Category}
                  </button>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="w-3/4 p-3">
          <div className="flex item-center gap-5">
            <h1 className="text-2xl font-semibold">Catalog</h1>

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

          <p className="text-sm my-6">
            Listing <span className="font-bold">{filteredProducts.length}</span>{" "}
            items for "{selectedCategory}"
          </p>

          <div className="grid grid-cols-4 gap-4">
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
                      src={`http://localhost:3000/ITEMS/${product.Image}`}
                      alt={product.Item_Name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="h-[130px] py-2 relative flex flex-col justify-between">
                    <h3 className="font-bold text-lg mb-5 line-clamp-2">
                      {product.Item_Name}
                    </h3>

                    <div className="flex items-center justify-between">
                      <p>Starts at PHP {product.Price}</p>

                      <button
                        onClick={(e) => handleOpenModal(e, product)}
                        className={`
                          bg-(--primary-btn) px-5 py-1 rounded-full absolute bottom-0 right-0 cursor-pointer
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
        <CartModal setOpenModal={setOpenModal} setOpenToast={setOpenToast} product={selectedProduct} />
      )}

      {openToast && (
        <p className="bg-(--primary-bg) center-flex gap-2 px-10 py-3 shadow-md rounded-lg fixed left-1/2 -translate-x-1/2 bottom-10">
          <FontAwesomeIcon
            icon={faCheck}
            color="var(--primary-btn)"
            size="2x"
          />
          Item has been added to cart
        </p>
      )}
    </div>
  );
}


const CartModal = ({ setOpenModal, setOpenToast, product }) => {
  const handleAddToCart = () => {
    setOpenToast(true);
    setOpenModal(false);
  }
  const handleBuyNow = () => {
    setOpenModal(false);
    window.location.href = '/cart'
  }

  return (
    <div className="w-full h-full bg-black/20 fixed top-0 left-0 center-flex">
      <div className="bg-(--primary-bg) w-3/5 h-3/5 rounded-lg p-5">
        <button
          className="ml-5 bg-transparent hover:bg-transparent hover:text-primary-foreground font-bold cursor-pointer flex items-center gap-1"
          onClick={() => setOpenModal(false)}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
          Back
        </button>

        <div className="h-full p-5 flex gap-5">
          <aside className="w-[350px] my-auto">
            <img
              src={`http://localhost:3000/ITEMS/${product.Image}`}
              alt={product.Item_Name}
              className="aspect-square w-full"
            />
          </aside>

          <main className="p-3 flex-1 flex flex-col justify-between">
            <div>
              <h1 className="flex justify-between items-center font-bold text-2xl font-heading">
                {product.Item_Name}
                <span className="font-family text-2xl">PHP {product.Price}</span>
              </h1>
              <p className="text-[#7d7d7d]">{product.Variant}</p>
            </div>

            <div>
              <p className="mt-10">Select Size</p>
              <div className="mt-3 flex gap-2">
                {["XS", "S", "M", "L", "XL", "2XL"].map((sizes) => (
                  <button className="px-8 py-2 rounded-lg cursor-pointer bg-transparent hover:bg-(--primary-btn) hover:text-white">
                    {sizes}
                  </button>
                ))}
              </div>

              <div className="my-5 flex gap-3">
                <button
                  className="py-2 center-flex gap-1 flex-1 rounded-lg border border-(--accent) cursor-pointer"
                  onClick={handleAddToCart}
                >
                  <FontAwesomeIcon
                    icon={faShoppingCart}
                    color="var(--primary-btn)"
                    size="lg"
                  />
                  Add to Cart
                </button>
                <button
                  className="flex-1 rounded-lg text-white bg-(--primary-btn) cursor-pointer"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </button>
              </div>
            </div>

            <footer>
              <h3 className="font-medium text-lg">Don’t know your size?</h3>
              <p>
                Check out the AR Try-on application in the campus kiosk to see
                your estimated size
              </p>
              <p className="flex items-center gap-2 text-(--secondary-text)">
                See how <FontAwesomeIcon icon={faChevronRight} />
              </p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
};