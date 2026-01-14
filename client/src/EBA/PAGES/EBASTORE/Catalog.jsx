import React, { useState, useMemo } from "react";
import "./CSS/Store.css";
import StoreNavbar from "./StoreNavbar";

const PRODUCTS = [
  {
    id: 1,
    name: "Female Uniform - Top",
    category: "Uniforms",
    price: 250,
    image: "/ITEMS/female-top.jpg",
  },
  {
    id: 2,
    name: "Female Uniform - Pants",
    category: "Uniforms",
    price: 350,
    image: "/ITEMS/female-pants.jpg",
  },
  {
    id: 3,
    name: "Male Uniform - Top",
    category: "Uniforms",
    price: 250,
    image: "/ITEMS/male-top.jpg",
  },
  {
    id: 4,
    name: "Female Uniform - Skirt",
    category: "Uniforms",
    price: 250,
    image: "/ITEMS/female-skirt.jpg",
  },
  {
    id: 5,
    name: "Male Uniform - Pants",
    category: "Uniforms",
    price: 350,
    image: "/ITEMS/male-pants.jpg",
  },
  {
    id: 6,
    name: "Department Shirts",
    category: "Department Shirts",
    price: 180,
    image: "/ITEMS/dept-shirts.jpg",
  },
  {
    id: 7,
    name: "Organization Shirts",
    category: "Organization Shirts",
    price: 200,
    image: "/ITEMS/org-shirts.jpg",
  },
  {
    id: 8,
    name: "Faculty Shirt",
    category: "Faculty",
    price: 220,
    image: "/ITEMS/faculty-shirt.jpg",
  },
  {
    id: 9,
    name: "Modules",
    category: "Modules",
    price: 150,
    image: "/ITEMS/modules.jpg",
  },
  {
    id: 10,
    name: "Capstone Manual",
    category: "Capstone Manual",
    price: 300,
    image: "/ITEMS/capstone.jpg",
  },
];

export default function Catalog() {
  const [selectedCategory, setSelectedCategory] = useState("Uniforms");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("price-low-high");
  const [cart, setCart] = useState([]);

  const categories = {
    Clothing: [
      "Uniforms",
      "Department Shirts",
      "Organization Shirts",
      "Faculty",
    ],
    Books: ["Modules", "Capstone Manual"],
  };

  // Filter products based on selected category and search
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesCategory =
        !selectedCategory || product.category === selectedCategory;
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case "price-low-high":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high-low":
        return sorted.sort((a, b) => b.price - a.price);
      case "name-a-z":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  }, [filteredProducts, sortBy]);

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    alert(`${product.name} added to cart!`);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="catalog-container px-[30px]"> 
      {/* Header */}
      <StoreNavbar />

      <div className="catalog-content">
        {/* Sidebar - Categories */}
        <aside className="sidebar">
          <div className="category-section">
            <h3 className="category-title">Clothing</h3>
            <div className="category-icon">👕</div>
            {categories.Clothing.map((cat) => (
              <button
                key={cat}
                className={`category-btn ${
                  selectedCategory === cat ? "active" : ""
                }`}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSearchQuery("");
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="category-section">
            <h3 className="category-title">Books</h3>
            {categories.Books.map((cat) => (
              <button
                key={cat}
                className={`category-btn ${
                  selectedCategory === cat ? "active" : ""
                }`}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSearchQuery("");
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {/* Search and Sort Controls */}
          <div className="controls-section">
            <div className="search-box">
              <input
                type="text"
                placeholder={selectedCategory || "Search products..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button className="search-btn">🔍</button>
            </div>

            <div className="sort-controls">
              <label>Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="name-a-z">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Products Listing Info */}
          <div className="listing-info">
            <h2>Catalog</h2>
            <p className="item-count">
              Listing {sortedProducts.length} items for "
              {selectedCategory || "All"}"
            </p>
          </div>

          {/* Product Grid */}
          <div className="products-grid">
            {sortedProducts.length > 0 ? (
              sortedProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                  </div>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-price">Starts at PHP {product.price}</p>
                  <button
                    className="add-to-cart-btn"
                    onClick={() => addToCart(product)}
                  >
                    🛒 Add to Cart
                  </button>
                </div>
              ))
            ) : (
              <div className="no-products">
                No products found in this category
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
