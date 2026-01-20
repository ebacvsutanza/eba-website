import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

const CartModal = ({
  fetchCart,
  setOpenModal,
  setOpenToast,
  product,
  userId,
  fullName,
  emailAddress,
}) => {
  const [size, setSize] = useState("");
  const [message, setMessage] = useState("");

  const handleAddToCart = () => {
    if (size.length === 0) {
      setMessage("Select Size");
      if (
        product.Category === "Capstone Manual" ||
        product.Category === "Module"
      ) {
        addToCartItem();
        setOpenToast(true);
        setTimeout(() => {
          setOpenToast(false);
        }, 2000);
        setOpenModal(false);
      }
    } else {
      addToCart();
      setOpenToast(true);
      setTimeout(() => {
        setOpenToast(false);
      }, 2000);
      setOpenModal(false);
    }
  };
  const handleBuyNow = () => {
    if (size.length === 0) {
      setMessage("Select Size");
      if (
        product.Category === "Capstone Manual" ||
        product.Category === "Module"
      ) {
        addToCartItem();
        window.location.href = "/ebacart";
      }
    } else {
      setOpenModal(false);
      addToCart();
      window.location.href = "/ebacart";
    }
  };

  const addToCart = async () => {
    try {
      const response = await fetch("http://localhost:3000/addToCart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction: product.Image,
          UserID: userId,
          Category: product.Category,
          ItemName: product.Item_Name,
          Variant: product.Variant,
          Size: size,
          Quantity: 1,
          CustomerName: fullName,
          EmailAddress: emailAddress,
          Amount: product.Price,
        }),
      });

      if (response.ok) {
        setSize("");
        fetchCart();
      } else {
        console.log("failed submit");
      }
    } catch (error) {
      console.log("error submitting", error);
    }
  };
  const addToCartItem = async () => {
    try {
      const response = await fetch("http://localhost:3000/addToCart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction: product.Image,
          UserID: userId,
          Category: product.Category,
          ItemName: product.Item_Name,
          Quantity: 1,
          CustomerName: fullName,
          EmailAddress: emailAddress,
          Amount: product.Price,
        }),
      });

      if (response.ok) {
        setSize("");
        fetchCart();
      } else {
        console.log("failed submit");
      }
    } catch (error) {
      console.log("error submitting", error);
    }
  };

  return (
    <div className="w-full h-full py-3 bg-black/20 fixed top-0 left-0 center-flex">
      <div className="w-full lg:w-3/4 xl:w-3/5 max-h-3/5 h-full p-3 bg-(--primary-bg) rounded-xl overflow-y-auto">
        <button
          className="md:ml-5 mb-3 bg-transparent hover:bg-transparent hover:text-primary-foreground font-bold cursor-pointer flex items-center gap-1"
          onClick={() => setOpenModal(false)}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
          Back
        </button>

        <div className="w-full h-auto md:h-[90%] md:px-5 flex gap-5 flex-col md:flex-row">
          <aside className="md:w-[300px] h-full md:my-auto bg-gray-200 center-flex rounded-lg">
            <img
              src={`http://localhost:3000/ITEMS/${product.Image}`}
              alt={product.Item_Name}
              className="aspect-square w-full"
            />
          </aside>

          <main className="h-auto flex-1 flex flex-col justify-between space-y-3">
            <div>
              <h1 className="flex justify-between font-bold text-2xl font-heading">
                <span className="flex-1">{product.Item_Name}</span>
                <span className="font-family text-2xl">
                  PHP {product.Price}
                </span>
              </h1>
              <p className="text-[#7d7d7d]">{product.Variant}</p>
            </div>

            <div>
              {product.Variant && (
                <>
                  <p className="mt-10">Select Size</p>
                  <div className="mt-3 relative">
                    <div className="w-full flex gap-2 overflow-x-auto">
                      {product.Sizes.map(({ Size, Quantity }, index) => (
                        <button
                          key={index}
                          onClick={() => setSize(Size)}
                          disabled={Quantity === 0}
                          className={`
                            px-8 py-2 rounded-lg cursor-pointer hover:bg-(--primary-btn) hover:text-white disabled:opacity-50 transition-all
                            ${size === Size && "bg-(--primary-btn) text-white"}
                          `}
                        >
                          {Size}
                        </button>
                      ))}
                    </div>
                    {message && (
                      <span className="text-(--error)">{message}</span>
                    )}
                  </div>
                </>
              )}

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

            {product.Variant && (
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
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CartModal;
