import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

import StoreNavbar from "./StoreNavbar";


const Store = () => {
  const navigate = useNavigate();

  const [carts, setCart] = useState([]);
  const fetchCart = () => {
    axios
      .get("https://capstone-cxej.onrender.com/cartItem", {
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

  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      id: 1,
      image: 'unif.jpg'
    },
    {
      id: 2,
      image: 'maleunif.png'
    },
    {
      id: 3,
      image: 'femaleunif.jpg'
    },
    {
      id: 4,
      image: 'cvsuback.jpg'
    },
  ];
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };
  

  const token = localStorage.getItem("token");
  useEffect(() => {
    if (!token) {
			alert("Please Login First");
      window.location.href = '/userlogin';
      return;
    }
  
    fetchProduct();
  }, [token]);
  
  
  const [products, setProducts] = useState([]);
  const fetchProduct = async () => {
    const res1 = await axios.get("https://capstone-cxej.onrender.com/top-selling-product");
    setProducts(res1.data);
  };

	
	return (
    <div className="lg:px-[1.3in]">
      <StoreNavbar carts={carts} fetchCart={fetchCart} />

      <div className="w-full h-[450px] mt-5 px-3 rounded-lg bg-gray-100 relative">
        <div className="relative w-full h-full overflow-hidden rounded-lg">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute w-full h-full transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <div
                className={`w-full h-full flex flex-col items-center justify-center text-white`}
              >
                <img
                  src={slide.image}
                  alt="Carousel Image"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-3 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentSlide
                  ? "bg-white w-8"
                  : "bg-white bg-opacity-50 w-3 hover:bg-opacity-75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <section className="mt-20">
        <div className="px-3 flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold">Featured Items</h1>
          <a href="/catalog" className="text-(--secondary-text) font-bold">
            View All
          </a>
        </div>

        <div className="mb-10 mt-3 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 md:gap-5">
          {products.map((product, index) => (
            <div
              key={index}
              onClick={() =>
                navigate("/catalog", {
                  state: { selectedCategory: product.category },
                })
              }
              className="p-3 rounded-lg border-2 border-transparent hover:border-(--primary-btn) transition-all"
            >
              <div className="img-block">
                <img
                  src={`https://capstone-cxej.onrender.com/ITEMS/${product.image}`}
                  alt="Item Image"
                  className="aspect-square p-5 border border-gray-400 rounded-lg"
                />
              </div>
              <div className="h-[150px] p-3 flex flex-col justify-between">
                <h3 className="text-lg font-semibold">{product.item_name}</h3>
                <p>Starts at PHP {product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Store