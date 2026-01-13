import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
	const isActive = (path) => location.pathname === path;


  const [isOpen, setIsOpen] = useState(false);
  const [isAbout, setIsAbout] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const toggleAbout = () => {
    setIsAbout(!isAbout);
  };

  const toggleCheckStatus = () => {
    setOpenStatus(!openStatus);
  };

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      axios
        .get(`http://localhost:3000/search?q=${query}`)
        .then((res) => setResults(res.data))
        .catch((err) => console.error(err));
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const [selectedTransactions, setSelectedTransactions] = useState([]); // store multiple transactions

  const handleItemClick = (email) => {
    console.log("Clicked Email:", email);

    axios
      .get(`http://localhost:3000/searchtransactionsbyemail/${email}`)
      .then((res) => setSelectedTransactions(res.data))
      .catch((err) => console.error("Error fetching transactions:", err));
  };

  const handleCancelOrder = (email, orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    axios
      .post("http://localhost:3000/requestCancelOrder", { email, orderId })
      .then(() => {
        alert(
          "A cancellation verification email has been sent to your address."
        );
      })
      .catch((err) => console.error("Error sending cancel request:", err));
  };

  return (
    <div className="navbar">
      <nav>
        <div className="nav-links">
          <div className="logo">
            <img src="/logo.png" />
            <p>
              <span>Cavite State University - Tanza</span> <br /> External
              Business and Affairs
            </p>
          </div>

          <ul className="links">
            <Link to="/eba" className={isActive("/eba") ? "active" : ""}>
              Home
            </Link>
            <Link to="/userlogin">Store</Link>
            <button onClick={toggleAbout} style={{fontSize: '14px'}}>About</button>
            {isAbout && (
              <div className="about-dropdown">
                <Link to="/abouteba">Mission and Vision</Link>
                <Link to="/aboutdeveloper">About the Developer</Link>
              </div>
            )}
            <button onClick={toggleDropdown} className="toggle-btn">
              <FontAwesomeIcon icon={faBars} />
            </button>
            <button onClick={toggleCheckStatus} style={{fontSize: '14px'}}>Check Status</button>
          </ul>
        </div>

        {openStatus && (
          <div className="check-status-modal">
            <div className="check-status">
              <form action="">
                <h2>Check Status</h2>
                <small>Please input your CvSU email address</small>
                <button onClick={toggleCheckStatus}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>

                <div className="input-block">
                  <label htmlFor="studentNumber">CvSU Email Address:</label>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="CvSU email address"
                  />
                  <FontAwesomeIcon icon={faSearch} className="icon" />
                </div>

                {results.map((student) => (
                  <div key={student.ID} className="search-result">
                    <p onClick={() => handleItemClick(student.Email_Address)}>
                      {student.Customer_Name}
                    </p>
                  </div>
                ))}
              </form>

              <div className="result-container">
                <div className="result-block">
                  <h3>Order Details</h3>

                  {selectedTransactions.length > 0 ? (
                    selectedTransactions.map((transaction, index) => (
                      <div key={index} className="transaction">
                        <div className="result">
                          <p>Name:</p>
                          <span>{transaction.Customer_Name}</span>
                        </div>

                        <div className="result">
                          <p>Order #:</p>
                          <span>{transaction.OrderID}</span>
                        </div>

                        <div className="result">
                          <p>Items:</p>
                          <span>{transaction.Item_Name}</span>
                        </div>

                        <button
                          onClick={() =>
                            handleCancelOrder(
                              transaction.Email_Address,
                              transaction.OrderID
                            )
                          }
                        >
                          Cancel Order
                        </button>
                      </div>
                    ))
                  ) : (
                    <p>No transactions found.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="dropdown">
          {isOpen && (
            <ul className="dropdown-menu">
              <Link to="/">Home</Link>
              <Link to="/userlogin">Store</Link>
              <button onClick={toggleAbout}>About</button>
              {isAbout && (
                <div className="about-dropdown">
                  <Link to="/abouteba">Mission and Vision</Link>
                  <Link to="/aboutdeveloper">About the Developer</Link>
                </div>
              )}
              <button onClick={toggleCheckStatus}>Check Status</button>
            </ul>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
