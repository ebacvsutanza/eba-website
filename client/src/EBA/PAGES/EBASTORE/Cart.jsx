import React, { useEffect, useState } from "react";
import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

import StoreNavbar from "./StoreNavbar";

const Cart = () => {
  const [orderSummary, setOrderSummary] = useState(false);
  const toggleOrderSummary = () => {
    setOrderSummary(!orderSummary);
  };

  const [carts, setCart] = useState([]);

  const [totalSum, setTotalSum] = useState(null);
  const [totalQuantity, setTotalQuantity] = useState(null);

  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      window.location.href = "/userlogin";
      return;
    }

    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    setUserId(decodedToken.id);

    fetchCart();
  }, []);

  const fetchCart = () => {
    axios
      .get("http://localhost:3000/cartItem", {
        headers: {
          Authorization: token,
        },
      })
      .then((response) => {
        setCart(response.data.cartItems);
        getTotal(response.data.cartItems);
        getQuantity(response.data.cartItems);
      })
      .catch((err) => {
        alert(err.response ? err.response.data.message : "An error occurred");
        window.location.href = "/userlogin";
      });
  };

  const getTotal = (data) => {
    const sum = data.reduce(
      (acc, item) => acc + item.Amount * item.Quantity,
      0,
    );
    setTotalSum(sum);
  };
  const getQuantity = (data) => {
    const sum = data.reduce((acc, item) => acc + item.Quantity, 0);
    setTotalQuantity(sum);
  };

  const handleCheckout = async () => {
    if (!userId) {
      setMessage("User not found. Please log in.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:3000/checkout", {
        userId,
      });

      if (response.data.Status === "Success") {
        setMessage("Checkout successful!");
        fetchCart();

        setTimeout(() => {
          setMessage("");
        }, 2000);
      } else {
        setMessage("Checkout failed. Please try again.");
      }
    } catch (error) {
      setMessage("Your cart is empty", error);

      setTimeout(() => {
        setMessage("");
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (id) => {
    await axios.delete(`http://localhost:3000/cart/${id}`);
    setCart(carts.filter((cart) => cart.ID !== id));

    setMessage("Cart item deleted successfully");
    setTimeout(() => {
      setMessage("");
    }, 2000);

    fetchCart();
  };

  const updateCartQuantity = async (cartId, newQuantity) => {
    try {
      await axios.put(`http://localhost:3000/cart/${cartId}`, {
        Quantity: newQuantity,
      });
      fetchCart(); // refresh cart after update
    } catch (err) {
      console.error("Failed to update quantity", err);
    }
  };

  const groupedCarts = carts.reduce((acc, item) => {
    const key = `${item.Item_Name}-${item.Variant}`;

    if (!acc[key]) {
      acc[key] = {
        Item_Name: item.Item_Name,
        Variant: item.Variant,
        Category: item.Category,
        totalQuantity: 0,
        sizes: {},
      };
    }

    acc[key].totalQuantity += item.Quantity;

    if (!acc[key].sizes[item.Size]) {
      acc[key].sizes[item.Size] = 0;
    }

    acc[key].sizes[item.Size] += item.Quantity;

    return acc;
  }, {});

  return (
    <div className="h-screen bg-(--primary-bg) relative">
      <div className="lg:px-[1.3in]">
        <StoreNavbar fetchCart={fetchCart} carts={carts} />
      </div>

      <div className="p-5 h-[90vh] flex gap-3 flex-col lg:flex-row overflow-y-auto">
        <div className="lg:w-3/4 xl:w-3/4 overflow-auto">
          <h1 className="mb-5 font-heading text-3xl font-bold">My Cart</h1>
          <div className="space-y-5">
            {carts.length === 0 ? (
              <div className="text-center">
                <h2>Your cart is empty</h2>
              </div>
            ) : (
              <>
                {carts.map((cart, index) => {
                  const handleDecrease = (cartId, currentQty) => {
                    if (currentQty > 1) {
                      updateCartQuantity(cartId, currentQty - 1);
                    }
                  };

                  const handleIncrease = (cartId, currentQty) => {
                    updateCartQuantity(cartId, currentQty + 1);
                  };

                  return (
                    <div
                      className="h-[180px] p-3 lg:p-5 bg-[#f5f5f5] rounded-lg flex gap-5 border-2 border-gray-300 relative"
                      key={index}
                    >
                      <div className="h-full aspect-square bg-white rounded-lg p-2 center-flex">
                        <img
                          src={`http://localhost:3000/ITEMS/${cart.Image}`}
                          alt="Item Image"
                          className="w-3/4 m-auto object-contain"
                        />
                      </div>

                      <div className="flex-1 flex gap-3 flex-col justify-between md:flex-row">
                        <div className="flex flex-col justify-between flex-1">
                          <div>
                            <p className="text-(--secondary-text) font-semibold md:text-lg line-clamp-2">
                              {cart.Item_Name}

                              {cart.Variant && " - "}
                              {cart.Variant}
                            </p>

                            <p className="text-gray-500 hidden md:block">
                              {cart.Category === "Capstone Manual" ||
                              cart.Category === "Module" ? (
                                ""
                              ) : (
                                <>Size: {cart.Size}</>
                              )}
                            </p>
                          </div>

                          <p className="text-gray-500 lg:text-lg">
                            PHP {cart.Amount * cart.Quantity}
                          </p>
                        </div>

                        <div className="flex md:flex-col items-center justify-between flex-1">
                          <p className="text-(--secondary-text) font-semibold lg:text-lg">
                            Quantity
                          </p>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                handleDecrease(cart.ID, cart.Quantity)
                              }
                              className="cursor-pointer"
                            >
                              <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                            <p className="py-1 px-4 border border-gray-300 rounded-md">
                              {cart.Quantity}
                            </p>
                            <button
                              onClick={() =>
                                handleIncrease(cart.ID, cart.Quantity)
                              }
                              className="cursor-pointer"
                            >
                              <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <p className="text-gray-500 md:hidden">
                            {cart.Category === "Capstone Manual" ||
                            cart.Category === "Module" ? (
                              ""
                            ) : (
                              <>Size: {cart.Size}</>
                            )}
                          </p>

                          <button
                            onClick={() => handleRemove(cart.ID)}
                            className="text-(--error) mt-auto text-lg cursor-pointer lg:relative"
                          >
                            {<FontAwesomeIcon icon={faTrash} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            <button
              onClick={toggleOrderSummary}
              className="w-full py-3 bg-(--primary-btn) hover:bg-(--accent) transition-all text-white rounded-lg lg:hidden"
            >
              Proceed
            </button>

            {message && (
              <div className="shadow-[0_0_5px_#acacac] py-2 px-10 rounded-lg absolute bottom-5 left-1/2 -translate-x-1/2">
                {message}
              </div>
            )}
          </div>
        </div>

        {orderSummary && (
          <div
            className="w-full h-full bg-[rgba(0,0,0,0.5)] absolute top-0 left-0 lg:hidden"
            onClick={toggleOrderSummary}
          />
        )}

        <div
          className={`
            w-full lg:w-1/3 xl:w-1/4 p-5 flex flex-col justify-between lg:border-2 lg:border-gray-300 absolute left-0 bottom-0 shadow-lg bg-(--primary-bg) lg:bg-transparent lg:shadow-0 lg:relative lg:flex
            ${!orderSummary && "hidden"} 
          `}
        >
          <div>
            <h1 className="font-heading font-bold text-3xl">Order Summary</h1>

            <div className="mt-8 flex items-center justify-between text-lg">
              <p>Total Item:</p>
              <span>{totalQuantity}</span>
            </div>

            <div className="my-5 space-y-4">
              {Object.values(groupedCarts).map((item, index) => (
                <div key={index} className="pb-2">
                  <div className="flex justify-between font-semibold">
                    <p>
                      {item.Item_Name} {item.Variant && "-"} {item.Variant}
                    </p>
                    <p>{item.totalQuantity}</p>
                  </div>

                  <div
                    className={`ml-4 mt-1 space-y-1 text-sm text-gray-600 ${item.Category === "Capstone Manual" || item.Category === "Module" ? "hidden" : ""}`}
                  >
                    {Object.entries(item.sizes).map(([size, qty]) => (
                      <div key={size} className="flex gap-1 max-w-xs">
                        <span>{size}:</span>
                        <span>{qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full border-t">
            <p className="mt-3 flex items-center justify-between">
              Total
              <span className="font-semibold">PHP {totalSum}</span>
            </p>

            <button
              type="button"
              onClick={handleCheckout}
              className="w-full mt-10 py-3 rounded-lg cursor-pointer text-white bg-(--primary-btn)"
            >
              {isLoading ? (
                <div className="loading">
                  <div className="sending">
                    Placing Order<span className="dot">.</span>
                    <span className="dot">.</span>
                    <span className="dot">.</span>
                  </div>
                </div>
              ) : (
                <span>Checkout</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
