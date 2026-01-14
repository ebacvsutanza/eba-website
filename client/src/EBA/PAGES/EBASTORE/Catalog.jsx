import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

import StoreNavbar from './StoreNavbar'


export default function Catalog() {
  const [open, setOpen] = useState(false);
  const option = [
    "Uniforms",
    "Department Shirts",
    "Organization Shirts",
    "Faculty",
  ];
  
  const [opens, setOpens] = useState(false);
  const options = [
    "Modules",
    "Capstone Manual",
  ];
  const [rotate, setRotate] = useState(false);

  return (
    <div className="h-screen">
      <StoreNavbar />

      <div class="p-5 h-[90vh] flex">
        <div class="w-1/4 p-3">
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
                {option.map((item) => (
                  <li
                    key={item}
                    className="cursor-pointer rounded-md px-4 py-2 hover:bg-(--accent)/25"
                  >
                    {item}
                  </li>
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
                {options.map((item) => (
                  <li
                    key={item}
                    className="cursor-pointer rounded-md px-4 py-2 hover:bg-(--accent)/25"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div class="w-3/4 p-3">
          <div class="flex item-center gap-5">
            <h1 className="text-2xl font-semibold">Catalog</h1>

            <div className="flex-1 relative">
              <input
                type="text"
                // placeholder={selectedCategory}
                // value={searchTerm}
                // onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 border border-gray-500 rounded-full p-2"
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
                onClick={() => setRotate(prev => !prev)}
                className="w-[180px] px-5 py-2 center-flex border border-gray-500 rounded-full appearance-none relative"
              >
                <option value="low-to-high">Price: Low to High</option>
                <option value="high-to-low">Price: High to Low</option>
                <option value="newest" selected>
                  Newest
                </option>
              </select>

              <div className='flex items-center gap-2 absolute right-2 top-1/2 -translate-y-1/2'>
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

          <div className="text-center py-12">
            <p className="text-gray-500">No products found</p>
          </div>
          {/* {filteredProducts.length === 0 && (
          )} */}
        </div>
      </div>
    </div>
  );
}
