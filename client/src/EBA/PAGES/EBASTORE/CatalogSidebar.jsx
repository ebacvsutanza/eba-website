import React, { useState } from 'react'

export default function CatalogSidebar({ categories, selectedCategory, setSelectedCategory }) {
  const [open, setOpen] = useState(true);
  const [opens, setOpens] = useState(false);

  const clothingCategories = categories.filter(
    (item) => !["Capstone Manual", "Module"].includes(item.Category)
  );
  const bookCategories = categories.filter((item) =>
    ["Capstone Manual", "Module"].includes(item.Category)
  );

  return (
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
  );
}
