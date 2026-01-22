require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const salt = 10;
const port = 3000;
const app = express();

// Google OAuth configuration
if (!process.env.GOOGLE_CLIENT_ID) {
  console.error("GOOGLE_CLIENT_ID environment variable is not set");
  process.exit(1);
}
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token =
    req.headers["authorization"]?.split(" ")[1] || req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.userId = decoded.id; // For compatibility with existing cart functionality
    next();
  } catch (err) {
    return res
      .status(403)
      .json({ message: "Login expired, please login again" });
  }
};

// Test endpoint for JWT
app.post("/api/test-jwt", (req, res) => {
  try {
    const testUser = { id: 1, email: "test@cvsu.edu.ph" };
    const token = jwt.sign(testUser, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error generating token", error: error.message });
  }
});

// Protected test endpoint
app.get("/api/protected", verifyToken, (req, res) => {
  res.json({
    message: "You have access to this protected route",
    user: req.user,
  });
});

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "capstone",
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL Database");
});

const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/UPLOADS");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});
const itemStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/ITEMS");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: uploadStorage });
const itemupload = multer({ storage: itemStorage });


// EBA Store User Login and Signup
app.post("/userlogin", async (req, res) => {
  console.log("Login request body:", req.body);
  const { googleToken } = req.body;
  if (!googleToken) {
    console.log("No token provided");
    return res
      .status(400)
      .json({ message: "Google authentication is required" });
  }

  try {
    console.log(
      "Attempting to verify token with client ID:",
      process.env.GOOGLE_CLIENT_ID,
    );
    const ticket = await googleClient.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email } = ticket.getPayload();

    if (!email.endsWith("@cvsu.edu.ph")) {
      return res
        .status(403)
        .json({ message: "Only @cvsu.edu.ph emails are allowed" });
    }

    db.query(
      "SELECT * FROM user_account WHERE Email_Address = ?",
      [email],
      (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database error occurred" });
        }
        if (result.length === 0) {
          return res.status(404).json({ message: "Please register first" });
        }

        const user = result[0];
        const token = jwt.sign(
          {
            id: user.ID,
            fullname: user.Full_Name,
            email: user.Email_Address,
          },
          process.env.JWT_SECRET,
          { expiresIn: "1h" },
        );
        res.json({ token });
      },
    );
  } catch (err) {
    console.error("Google token verification failed:", err);
    res.status(400).json({ message: "Invalid Google authentication" });
  }
});
app.post("/usersignup", async (req, res) => {
  const { email, password } = req.body;

  // Validate email domain
  if (!email.endsWith("@cvsu.edu.ph")) {
    return res.json({
      Status: "Error",
      Message: "Only @cvsu.edu.ph email addresses are allowed",
    });
  }

  try {
    // Check if email already exists
    const checkEmail = "SELECT * FROM user_account WHERE Email_Address = ?";
    db.query(checkEmail, [email], async (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.json({
          Status: "Error",
          Message: "Database error occurred",
        });
      }

      if (result.length > 0) {
        return res.json({ Status: "Email address already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, salt);

      const insertUser = `
        INSERT INTO user_account (
            Email_Address,
            Password,
            Username,
            Account_Status,
            Is_Email_Verified
        ) VALUES (?, ?, ?, 'active', false)
      `;

      const username = email.split("@")[0];

      db.query(insertUser, [email, hashedPassword, username], (err, result) => {
        if (err) {
          console.error("Insert error:", err);
          return res.json({
            Status: "Error",
            Message: "Failed to create account",
          });
        }

        const token = jwt.sign(
          { id: result.insertId, email: email },
          process.env.JWT_SECRET,
          { expiresIn: "1h" },
        );

        res.json({ Status: "Success", token });
      });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.json({ Status: "Error", Message: "Server error occurred" });
  }
});

// EBA Store Page
app.get("/storeinventory", (req, res) => {
  const sql = "SELECT * FROM inventory";

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).send(err);

    const SIZE_ORDER = ["Xtra Small", "Small", "Medium", "Large", "Xtra Large"];

    const products = {};

    rows.forEach((row) => {
      const key = `${row.Item_Name}-${row.Variant}`;

      if (!products[key]) {
        products[key] = {
          Item_Name: row.Item_Name,
          Category: row.Category,
          Variant: row.Variant,
          Image: row.Image,
          Price: row.Price,
          Sizes: [],
        };
      }

      products[key].Sizes.push({
        Size: row.Size.trim(),
        Quantity: row.Quantity,
      });
    });

    Object.values(products).forEach((product) => {
      product.Sizes.sort(
        (a, b) => SIZE_ORDER.indexOf(a.Size) - SIZE_ORDER.indexOf(b.Size),
      );
    });

    res.json(Object.values(products));
  });
});
app.get("/top-selling-product", (req, res) => {
  const sql = `
    SELECT 
      i.*,
      t.total_sold
    FROM inventory i
    JOIN (
        SELECT 
          Item_Name,
          Variant,
          Size,
          SUM(Quantity) AS total_sold
        FROM transaction
        GROUP BY Item_Name, Variant, Size
        ORDER BY total_sold DESC
        LIMIT 4
    ) t
    ON i.Item_Name = t.Item_Name
    AND i.Variant = t.Variant
    AND i.Size = t.Size
    ORDER BY t.total_sold DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// EBA Cart Page
app.post("/addToCart", upload.single("transaction"), (req, res) => {
  const {
    UserID,
    Category,
    transaction,
    ItemName,
    Variant = "",
    Size = "",
    Quantity,
    Amount,
  } = req.body;

  try {
    let checkQuery = `
      SELECT * FROM item_cart 
      WHERE User_ID = ? AND Category = ? AND Item_Name = ? AND Variant = ? AND Size = ?
    `;

    let checkParams = [UserID, Category, ItemName, Variant, Size];

    db.query(checkQuery, checkParams, (err, results) => {
      if (err) {
        console.error("Error checking item:", err);
        return res.status(500).json({ Message: "Database error" });
      }

      if (results.length > 0) {
        let existingItem = results[0];
        let newQuantity = existingItem.Quantity + parseInt(Quantity, 10);

        let updateQuery = `
          UPDATE item_cart 
          SET Quantity = ? 
          WHERE User_ID = ? AND Category = ? AND Item_Name = ? AND Variant = ? AND Size = ?
        `;

        let updateParams = [
          newQuantity,
          UserID,
          Category,
          ItemName,
          Variant,
          Size,
        ];

        db.query(updateQuery, updateParams, (err, result) => {
          if (err) {
            console.error("Error updating quantity:", err);
            return res.status(500).json({ Message: "Failed to update cart" });
          }

          return res.json({ Status: "Updated", UpdatedQuantity: newQuantity });
        });
      } else {
        let insertQuery = `
					INSERT INTO item_cart 
					(User_ID, Category, Image, Item_Name, Variant, Size, Quantity, Amount) 
					VALUES (?, ?, ?, ?, ?, ?, ?, ?)
				`;

        let values = [
          UserID,
          Category,
          transaction,
          ItemName,
          Variant || "",
          Size || "",
          Quantity,
          Amount,
        ];

        db.query(insertQuery, values, (err, result) => {
          if (err) {
            console.error("Error inserting new item:", err);
            return res.status(500).json({ Message: "Error inserting data" });
          }

          return res.json({ Status: "Inserted" });
        });
      }
    });
  } catch (error) {
    console.error("Error processing form data:", error);
    res.status(500).send("Internal server error");
  }
});

// Admin Dashboard
app.get("/api/best-seller", (req, res) => {
  const sql = `
    SELECT Item_Name, Variant, Size, SUM(Quantity) AS total_quantity
    FROM transaction
    GROUP BY Item_Name, Variant, Size
    ORDER BY total_quantity DESC
    LIMIT 1
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
});

app.get("/api/least-purchased", (req, res) => {
  const sql = `
    SELECT Item_Name, Variant, Size, SUM(Quantity) AS total_quantity
    FROM transaction
    GROUP BY Item_Name, Variant, Size
    ORDER BY total_quantity ASC
    LIMIT 1
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
});






// BULLETIN PAGE
// DISPLAY EVENT AND ANNOUNCEMENT
app.get("/bulletin", (req, res) => {
  db.query("SELECT * FROM bulletin", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.get("/search", (req, res) => {
  const searchTerm = req.query.q || "";
  const sql = `SELECT * FROM transaction WHERE Email_Address LIKE ? LIMIT 10`;
  db.query(sql, [`%${searchTerm}%`], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.get("/searchtransactionsbyemail/:email", (req, res) => {
  const email = req.params.email;
  db.query(
    "SELECT * FROM transaction WHERE Email_Address = ?",
    [email],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
    }
  );
});

// EBA STORE
// CHECK AND LOGIN THE USER TO ACCESS EBA STORE - Google Auth Only








app.get("/exclusive", (req, res) => {
  db.query("SELECT * FROM exclusive", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});
app.get("/categories", (req, res) => {
  db.query("SELECT * FROM categories", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});
app.get("/search", (req, res) => {
  const search = req.query.q;
  const sql = `SELECT * FROM store WHERE Item_Name LIKE ?`;

  db.query(sql, [`%${search}%`], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
app.get("/store", (req, res) => {
  db.query("SELECT * FROM store", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});
app.get("/store/:itemId/variant", (req, res) => {
  const itemId = req.params.itemId;

  db.query(
    "SELECT * FROM store_variant WHERE Store_ID = ?",
    [itemId],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    }
  );
});

// EBA CART PAGE
// FETCH ALL DATA IN CART AND DISPLAY TO CART PAGE
app.get("/cartItem", verifyToken, (req, res) => {
  const userId = req.userId;

  db.query(
    "SELECT * FROM item_cart WHERE User_ID = ?",
    [userId],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ cartItems: result.length ? result : [] });
    }
  );
});

// EBA STORE PAGE
// NOTICED THE CUSTOMER THROUGH EMAIL AFTER THE ORDER HAS BEEN CONFIRMED

// ADD CUSTOMER'S ORDER TO THE CART

app.put("/cart/:id", (req, res) => {
  const { id } = req.params;
  const { Quantity } = req.body;
  const sql = `UPDATE item_cart SET Quantity = ? WHERE ID = ?`;
  db.query(sql, [Quantity, id], (err, result) => {
    if (err) return res.status(500).json({ Message: "Failed to update" });
    res.json({ Status: "Success" });
  });
});
app.delete("/cart/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM item_cart WHERE ID = ?", [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Cart deleted successfully." });
  });
});
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "cvsutanzaeba@gmail.com",
    pass: "thai euuc ller olga",
  },
});
app.post("/checkout", (req, res) => {
  const { userId } = req.body;

  db.beginTransaction((err) => {
    if (err) {
      console.error("Transaction Error:", err);
      return res.status(500).json({ error: "Transaction failed" });
    }

    const combineQuery = `
      SELECT
        ic.Image,
        ic.Item_Name,
        ic.Variant,
        ic.Size,
        ic.Quantity,
        ic.Amount,
        ic.Date,
        ua.Full_Name,
        ua.Email_Address
      FROM 
        user_account ua
      LEFT JOIN
        item_cart ic
      ON
        ua.ID = ic.User_ID
      WHERE
        ua.ID = ?;
    `;

    db.query(combineQuery, [userId], (err, results) => {
      if (err) {
        console.error("Query Error:", err);
        return db.rollback(() =>
          res.status(500).json({ error: "Query failed" })
        );
      }

      const cartItems = results.filter((row) => row.Item_Name !== null);

      if (cartItems.length === 0) {
        console.log("Your cart is empty");
        return db.rollback(() =>
          res.status(400).json({ error: "Your cart is empty" })
        );
      }

      const Pending = "Pending";

      // First insert placeholder without OrderID to get insertId
      const tempInsertQuery = `
        INSERT INTO transaction 
        (OrderID, Image, Item_Name, Variant, Size, Quantity, Amount, Customer_Name, Email_Address, Date, Status) 
        VALUES ?
      `;

      // Temporarily put a placeholder for OrderID (will be updated after insertId is known)
      const values = cartItems.map((row) => [
        null, // placeholder for OrderID
        row.Image,
        row.Item_Name,
        row.Variant,
        row.Size,
        row.Quantity,
        row.Amount * row.Quantity,
        row.Full_Name,
        row.Email_Address,
        row.Date,
        Pending,
      ]);

      db.query(tempInsertQuery, [values], async (err, insertResult) => {
        if (err) {
          console.error("Insert Error:", err);
          return db.rollback(() =>
            res.status(500).json({ error: "Insert failed" })
          );
        }

        // Generate order ID now (YearNow + 0 + transactionNumber)
        const orderID = `${new Date().getFullYear()}0${insertResult.insertId}`;

        // Update all inserted rows with the generated order ID
        db.query(
          `UPDATE transaction SET OrderID = ? WHERE id >= ? AND id < ?`,
          [
            orderID,
            insertResult.insertId,
            insertResult.insertId + cartItems.length,
          ],
          async (err) => {
            if (err) {
              console.error("OrderID Update Error:", err);
              return db.rollback(() =>
                res.status(500).json({ error: "OrderID update failed" })
              );
            }

            const currentDate = new Date();
            const year = currentDate.getFullYear().toString().slice(-2);
            const month = (currentDate.getMonth() + 1)
              .toString()
              .padStart(2, "0");
            const day = currentDate.getDate().toString().padStart(2, "0");
            const formattedDate = `${month}-${day}-${year}`;

            try {
              const itemRowsHTML = cartItems
                .map((row) => {
                  const variantDisplay = row.Variant?.trim() ? row.Variant : "";
                  const sizeDisplay = row.Size?.trim() ? row.Size : "";
                  const productDisplay = [
                    row.Item_Name,
                    variantDisplay,
                    sizeDisplay,
                  ]
                    .filter((part) => part)
                    .join(" - ");

                  return `
                                    <tr>
                                        <td style="border: 1px solid gray; padding: 8px; text-align: center;">${productDisplay}</td>
                                        <td style="border: 1px solid gray; padding: 8px; text-align: center;">₱${
                                          row.Amount
                                        } x ${row.Quantity} = ₱${
                    row.Amount * row.Quantity
                  }</td>
                                    </tr>
                                `;
                })
                .join("");

              const totalAmount = cartItems.reduce(
                (sum, row) => sum + row.Amount * row.Quantity,
                0
              );
              const user = cartItems[0];

              const mailOptions = {
                from: "cvsutanzaeba@gmail.com",
                to: user.Email_Address,
                subject: "Order Details",
                html: `
                                    <header style='height: 150px; background: #c1ff72; display: flex; flex-direction: column; gap: 10px;'>
                                        <img src="https://res.cloudinary.com/dfmnlcvbe/image/upload/v1744102780/logo_qy0g8a.png" style='width: 80px; height: 80px;'/>
                                        <h2>External Business and<br>Affairs</h2>
                                    </header>

                                    <br>

                                    <h3>Thank you for your order!</h3>
                                    <p>${user.Full_Name}</p>
                                    <p>Your order was received! We're working to get it processed and ready to claim.</p>

                                    <br>

                                    <div style='display: flex; align-items: center;'>
                                        <div style="margin-right: 30px;">
                                            <p>Order Number:</p>
                                            <span>#${orderID}</span>
                                        </div>
                                        <div>
                                            <p>Order Date:</p>
                                            <span>${formattedDate}</span>
                                        </div>
                                    </div>

                                    <br>

                                    <table style="border: 1px solid gray; border-collapse: collapse; width: 100%; text-align: left;">
                                        <tr>
                                            <th style="border: 1px solid gray; padding: 8px; text-align: center;">PRODUCT</th>
                                            <th style="border: 1px solid gray; padding: 8px; text-align: center;">PRICE</th>
                                        </tr>
                                        ${itemRowsHTML}
                                        <tr>
                                            <td style="border: 1px solid gray; padding: 8px; text-align: center;"></td>
                                            <td style="border: 1px solid gray; padding: 8px; text-align: center;"><strong>Total: P${totalAmount}</strong></td>
                                        </tr>
                                    </table>

                                    <p>Thank you for your purchase!</p>
                                    <p>Cavite State University - Tanza Campus</p>
                                `,
              };

              await transporter.sendMail(mailOptions);

              db.query(
                "DELETE FROM item_cart WHERE User_ID = ?",
                [userId],
                (err) => {
                  if (err) {
                    console.error("Cart Clear Error:", err);
                    return db.rollback(() =>
                      res.status(500).json({ error: "Failed to clear cart" })
                    );
                  }

                  db.commit((err) => {
                    if (err) {
                      console.error("Commit Error:", err);
                      return db.rollback(() =>
                        res
                          .status(500)
                          .json({ error: "Transaction commit failed" })
                      );
                    }

                    res.json({ Status: "Success" });
                  });
                }
              );
            } catch (emailError) {
              console.error("Email Error:", emailError);
              return db.rollback(() =>
                res.status(500).json({ error: "Email sending failed" })
              );
            }
          }
        );
      });
    });
  });
});
app.post("/requestCancelOrder", (req, res) => {
  const { email, orderId } = req.body;

  // Generate a verification token
  const token = jwt.sign({ email, orderId }, "yourSecretKey", {
    expiresIn: "1h",
  });

  const cancelLink = `http://localhost:3000/verifyCancelOrder/${token}`;

  const mailOptions = {
    from: "your_email@gmail.com",
    to: email,
    subject: "Order Cancellation Verification",
    html: `
            <p>We received a request to cancel your order <strong>${orderId}</strong>.</p>
            <p>If this was you, please confirm by clicking the link below:</p>
            <a href="${cancelLink}">Confirm Cancellation</a>
        `,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to send email" });
    }
    res.json({ message: "Verification email sent" });
  });
});
app.get("/verifyCancelOrder/:token", (req, res) => {
  const { token } = req.params;

  jwt.verify(token, "yourSecretKey", (err, decoded) => {
    if (err) return res.status(400).send("Invalid or expired token.");

    const { email, orderId } = decoded;

    // Update DB to set status to "Cancelled"
    db.query(
      "UPDATE transaction SET status = 'Cancelled' WHERE OrderID = ? AND Email_Address = ?",
      [orderId, email],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Failed to cancel order.");
        }
        res.send("Your order has been successfully cancelled.");
      }
    );
  });
});

// ADMINPANEL
// CHECK AND LOGIN THE ADMIN TO ACCESS ADMIN PANEL
app.post("/adminlogin", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM admin_account WHERE Email_Address = ?",
    [email],
    (err, result) => {
      if (err) throw err;
      if (result.length === 0)
        return res.status(404).json({ message: "Email address doesn't exist" });

      const user = result[0];

      bcrypt.compare(password, user.Password, (err, isMatch) => {
        if (err) throw err;
        if (!isMatch)
          return res.status(400).json({ message: "Incorrect password" });

        const token = jwt.sign(
          {
            id: user.ID,
            role: user.Role,
            image: user.Image,
            username: user.Username,
            email: user.Email_Address,
          },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
        res.json({ token });
      });
    }
  );
});

app.post("/adminchangepass", async (req, res) => {
  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({ message: "Missing ID or password" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = "UPDATE admin_account SET Password = ? WHERE ID = ?";

    db.query(query, [hashedPassword, id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error updating password" });
      }
      return res.status(200).json({ message: "Password updated" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// NOTIFICATION
app.get("/notifications", (req, res) => {
  const query = `
		SELECT 
		'transaction' AS type, 
		ID, 
		Item_Name, 
		Variant, 
		Size, 
		Quantity, 
		created_At AS time, 
		Status 
		FROM transaction 
		WHERE Status = 'Pending'
		
		UNION ALL
		
		SELECT 
		'low_stock' AS type, 
		ID, 
		Item_Name, 
		Variant, 
		Size, 
		Quantity, 
		NULL AS time, 
		NULL AS Status 
		FROM inventory 
		WHERE Quantity <= 5
		ORDER BY time DESC;
	`;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching notifications:", err);
      return res.status(500).json({ error: "Database query error" });
    }
    res.json(results);
  });
});

// DASHBOARD PAGE
app.get("/api/dashboard/all", (req, res) => {
  const queries = {
    totalSales: `
            SELECT COALESCE(SUM(Amount), 0) as total_sales 
            FROM transaction
            WHERE Status IS NULL OR Status != 'Cancelled'
        `,
    totalOrders: `
            SELECT COUNT(*) as total_orders 
            FROM transaction
            WHERE Status IS NULL OR Status != 'Cancelled'
        `,
    lowStock: `
            SELECT COUNT(*) as low_stock 
            FROM inventory 
            WHERE Quantity < 10 AND Quantity > 0
        `,
    availableStocks: `
            SELECT COALESCE(SUM(Quantity), 0) as total_stocks 
            FROM inventory
            WHERE Quantity > 0
        `,
    newOrders: `
            SELECT COUNT(*) as new_orders 
            FROM transaction 
            WHERE Date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            AND (Status IS NULL OR Status != 'Cancelled')
        `,
    fastMovingItems: `
            SELECT 
                Item_Name,
                COUNT(*) as order_count
            FROM transaction
            WHERE Status IS NULL OR Status != 'Cancelled'
            GROUP BY Item_Name
            ORDER BY order_count DESC
            LIMIT 5
        `,
    salesData: `
            SELECT 
                DATE_FORMAT(Date, '%M') AS month, 
                Item_Name as category, 
                SUM(Amount) AS total_sales 
            FROM transaction 
            WHERE Status IS NULL OR Status != 'Cancelled'
            GROUP BY month, Item_Name 
            ORDER BY MONTH(Date)
        `,
    ordersData: `
            SELECT 
                DATE_FORMAT(Date, '%M') AS month, 
                Item_Name as category, 
                COUNT(*) AS total_orders 
            FROM transaction 
            WHERE Status IS NULL OR Status != 'Cancelled'
            GROUP BY month, Item_Name 
            ORDER BY MONTH(Date)
        `,
  };

  const results = {};
  let completedQueries = 0;
  const totalQueries = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, query]) => {
    db.query(query, (err, result) => {
      if (err) {
        console.error(`Error in ${key} query:`, err);
        return res.status(500).json({ error: err.message });
      }

      if (key === "salesData" || key === "ordersData") {
        const formattedData = {
          labels: [...new Set(result.map((row) => row.month))],
          datasets: [],
        };

        const categories = [...new Set(result.map((row) => row.category))];

        categories.forEach((category) => {
          formattedData.datasets.push({
            label: category,
            data: result
              .filter((row) => row.category === category)
              .map((row) =>
                key === "salesData" ? row.total_sales : row.total_orders
              ),
          });
        });

        results[key] = formattedData;
      } else {
        results[key] = result[0];
      }

      completedQueries++;
      if (completedQueries === totalQueries) {
        res.json(results);
      }
    });
  });
});
app.get("/api/sales-data", (req, res) => {
  const query = `
		SELECT 
			DATE_FORMAT(Date, '%M') AS month, 
			Item_Name as category, 
			SUM(Amount) AS total_sales 
		FROM transaction 
		GROUP BY month, Item_Name 
		ORDER BY MONTH(Date);
	`;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const formattedData = {
      labels: [...new Set(results.map((row) => row.month))],
      datasets: [],
    };

    const categories = [...new Set(results.map((row) => row.category))];

    categories.forEach((category) => {
      formattedData.datasets.push({
        label: category,
        data: results
          .filter((row) => row.category === category)
          .map((row) => row.total_sales),
      });
    });

    res.json(formattedData);
  });
});

app.get("/api/orders-data", (req, res) => {
  const query = `
		SELECT 
			DATE_FORMAT(Date, '%M') AS month, 
			Item_Name as category, 
			COUNT(*) AS total_orders 
		FROM transaction 
		GROUP BY month, Item_Name 
		ORDER BY MONTH(Date);
	`;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const formattedData = {
      labels: [...new Set(results.map((row) => row.month))],
      datasets: [],
    };

    const categories = [...new Set(results.map((row) => row.category))];

    categories.forEach((category) => {
      formattedData.datasets.push({
        label: category,
        data: results
          .filter((row) => row.category === category)
          .map((row) => row.total_orders),
      });
    });

    res.json(formattedData);
  });
});

app.get("/api/test/transaction", (req, res) => {
  db.query("DESCRIBE transaction", (err, result) => {
    if (err) {
      console.error("Error describing transaction table:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

app.get("/api/dashboard/total-sales", (req, res) => {
  const query = `
        SELECT COALESCE(SUM(Amount), 0) as total_sales 
        FROM transaction
        WHERE Status IS NULL OR Status != 'Cancelled'
    `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("Error in total sales query:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(result[0]);
  });
});

app.get("/api/dashboard/total-orders", (req, res) => {
  const query = `
        SELECT COUNT(*) as total_orders 
        FROM transaction
        WHERE Status IS NULL OR Status != 'Cancelled'
    `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("Error in total orders query:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(result[0]);
  });
});

app.get("/api/dashboard/low-stock", (req, res) => {
  const query = `
        SELECT COUNT(*) as low_stock 
        FROM inventory 
        WHERE Quantity < 10 AND Quantity > 0
    `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("Error in low stock query:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(result[0]);
  });
});

app.get("/api/dashboard/available-stocks", (req, res) => {
  const query = `
        SELECT COALESCE(SUM(Quantity), 0) as total_stocks 
        FROM inventory
        WHERE Quantity > 0
    `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("Error in available stocks query:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(result[0]);
  });
});

app.get("/api/dashboard/new-orders", (req, res) => {
  const query = `
        SELECT COUNT(*) as new_orders 
        FROM transaction 
        WHERE Date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        AND (Status IS NULL OR Status != 'Cancelled')
    `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("Error in new orders query:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(result[0]);
  });
});

app.get("/api/dashboard/fast-moving-items", (req, res) => {
  const query = `
        SELECT 
            Item_Name,
            COUNT(*) as order_count
        FROM transaction
        WHERE Status IS NULL OR Status != 'Cancelled'
        GROUP BY Item_Name
        ORDER BY order_count DESC
        LIMIT 5
    `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("Error in fast moving items query:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

// TRANSACTION PAGE
// FETCH AND DISPLAY THE DATA
app.get("/transaction", (req, res) => {
  const order = req.query.order === "ASC" ? "ASC" : "DESC";
  db.query(
    `SELECT * FROM transaction ORDER BY created_At ${order}`,
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    }
  );
});
// EDIT TRANSACTIOn
app.put("/transaction/:id", (req, res) => {
  const { id } = req.params;
  const {
    itemName,
    variant,
    size,
    quantity,
    name,
    email,
    phone,
    payment,
    amount,
  } = req.body;

  db.query(
    "UPDATE transaction SET Item_Name = ?, Variant = ?, Size = ?, Quantity = ?, Customer_Name = ?, Email_Address = ?, Payment_Method = ?, Amount = ? WHERE ID = ?",
    [
      itemName,
      variant,
      size,
      quantity,
      name,
      email,
      phone,
      payment,
      amount,
      id,
    ],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json({ message: "Transaction updated successfully." });
    }
  );
});
// DELETE TRANSACTION
app.delete("/transaction/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM transaction WHERE ID = ?", [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Transaction deleted successfully." });
  });
});
// CONFIRM OR CANCEL ORDER
app.post("/confirm-order", (req, res) => {
  const { orderId, name, customerEmail } = req.body;

  const getTransactionQuery =
    "SELECT Item_Name, Variant, Size, Quantity FROM transaction WHERE ID = ?";

  db.query(getTransactionQuery, [orderId], (err, transactionResult) => {
    if (err || transactionResult.length === 0) {
      return res
        .status(500)
        .json({ message: "Failed to retrieve order details" });
    }

    const { Item_Name, Variant, Size, Quantity } = transactionResult[0];

    const getInventoryQuery = `
			SELECT Quantity FROM inventory 
			WHERE Item_Name = ? AND Variant = ? AND Size = ?
		`;

    db.query(
      getInventoryQuery,
      [Item_Name, Variant, Size],
      (err, inventoryResult) => {
        if (err || inventoryResult.length === 0) {
          return res
            .status(500)
            .json({ message: "Item not found in inventory" });
        }

        const currentStock = inventoryResult[0].Quantity;

        if (currentStock < Quantity) {
          return res.status(400).json({ message: "This item is out of stock" });
        }

        const updateInventoryQuery = `
				UPDATE inventory 
				SET Quantity = Quantity - ? 
				WHERE Item_Name = ? AND Variant = ? AND Size = ?
			`;

        db.query(
          updateInventoryQuery,
          [Quantity, Item_Name, Variant, Size],
          (err, updateResult) => {
            if (err || updateResult.affectedRows === 0) {
              return res
                .status(500)
                .json({ message: "Failed to update inventory" });
            }

            db.query(
              "UPDATE transaction SET Status = ? WHERE ID = ?",
              ["Confirmed", orderId],
              (err, result) => {
                if (err)
                  return res
                    .status(500)
                    .json({ message: "Failed to update order status" });

                const mailOptions = {
                  from: "cvsutanzaeba@gmail.com",
                  to: customerEmail,
                  subject: "Your Order Has Been Confirmed",
                  text: `Hello ${name}! Your order has been confirmed. We appreciate your purchase!`,
                };

                transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                    console.error(error);
                    return res.status(500).json({
                      message: "Order confirmed but failed to send email",
                    });
                  }

                  res
                    .status(200)
                    .json({ message: "Order confirmed and inventory updated" });
                });
              }
            );
          }
        );
      }
    );
  });
});
app.post("/cancel-order", (req, res) => {
  const { orderId, name, customerEmail } = req.body;

  db.query(
    "UPDATE transaction SET Status = ? WHERE ID = ?",
    ["Cancelled", orderId],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Failed to update order status" });

      const mailOptions = {
        from: "cvsutanzaeba@gmail.com",
        to: customerEmail,
        subject: "Your Order Has Been Confirmed",
        text: `Hello ${name}! Your order has been cancelled. We appreciate your purchase!`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          return res
            .status(500)
            .json({ message: "Failed to send email notification" });
        }
        res.status(200).json({ message: "Order cancelled" });
      });
    }
  );
});

// EVENTS & ANNOUNCEMENT PAGE
// ADD EVENT/ANNOUNCEMENT
app.post("/announcement", (req, res) => {
  const { Title, Details, Faculty, FacultyName, announcementDate } = req.body;

  const insertQuery =
    "INSERT INTO bulletin (Title, Details, Faculty, Faculty_Staff, announcementDate) VALUES (?, ?, ?, ?, ?)";
  db.query(
    insertQuery,
    [Title, Details, Faculty, FacultyName, announcementDate],
    (err, result) => {
      if (err) {
        console.error("Error inserting data:", err);
        return res.status(500).json({ Message: "Error inserting data" });
      }

      return res.json({ Status: "Success" });
    }
  );
});
// EDIT EVENT/ANNOUNCEMENT
app.put("/announcement/:id", (req, res) => {
  const { id } = req.params;
  const { Title, Details, Faculty, FacultyName, announcementDate } = req.body;

  db.query(
    "UPDATE bulletin SET Title = ?, Details = ?, Faculty = ?, Faculty_Staff = ?, announcementDate = ? WHERE ID = ?",
    [Title, Details, Faculty, FacultyName, announcementDate, id],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json({ message: "Announcement updated successfully." });
    }
  );
});
// DELETE EVENT/ANNOUNCEMENT
app.delete("/announcement/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM bulletin WHERE ID = ?", [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Announcement deleted successfully." });
  });
});

// INVENTORY PAGE
// FETCH AND DISPLAY THE DATA
app.get("/inventory", (req, res) => {
  db.query("SELECT * FROM inventory", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});
// ADD INVENTORY
app.post("/inventory", itemupload.single("inventory"), (req, res) => {
  const image = req.file.filename;
  const { Category, ItemName, Variant, Size, Quantity, Price } = req.body;
  const insertQuery =
    "INSERT INTO inventory (Image, Category, Item_Name, Variant, Size, Quantity, Price) VALUES ( ?, ?, ?, ?, ?, ?, ?)";

  db.query(
    insertQuery,
    [image, Category, ItemName, Variant, Size, Quantity, Price],
    (err, result) => {
      if (err) {
        console.error("Error inserting data:", err);
        return res.status(500).json({ Message: "Error inserting data" });
      }

      return res.json({ Status: "Success" });
    }
  );
});
// EDIT INVENTORY
app.put("/inventory/:id", itemupload.single("inventory"), (req, res) => {
  const { id } = req.params;

  let image = null;
  if (req.file) {
    image = req.file.filename;
  }
  const { category, itemName, variant, size, quantity, price } = req.body;

  if (image) {
    db.query(
      "UPDATE inventory SET Image = ?, Category = ?, Item_Name = ?, Variant = ?, Size = ?, Quantity = ?, Price = ? WHERE ID = ?",
      [image, category, itemName, variant, size, quantity, price, id],
      (err, results) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Inventory updated successfully." });
      }
    );
  } else {
    db.query(
      "UPDATE inventory SET Category = ?, Item_Name = ?, Variant = ?, Size = ?, Quantity = ?, Price = ? WHERE ID = ?",
      [category, itemName, variant, size, quantity, price, id],
      (err, results) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Inventory updated successfully." });
      }
    );
  }
});
// DELETE INVENTORY
app.delete("/inventory/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM inventory WHERE ID = ?", [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Inventory deleted successfully." });
  });
});

// ADMIN ACCOUNT PAGE
// FETCH AND DISPLAY THE DATA
app.get("/admin", (req, res) => {
  db.query("SELECT * FROM admin_account", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});
// ADD NEW ADMIN
app.post("/addnewadmin", upload.single("admin"), (req, res) => {
  const image = req.file.filename;
  const { Username, Role, Email, Password } = req.body;
  const checkQuery =
    "SELECT * FROM admin_account WHERE Username = ? OR Email_Address = ?";

  db.query(checkQuery, [Username, Email], (err, result) => {
    if (err) {
      console.error("Error checking existing users:", err);
      res.status(500).send("Server error");
      return;
    }

    if (result.length > 0) {
      return res.json({ Status: "Username or Email already exists" });
    }

    const insertQuery =
      "INSERT INTO admin_account (Image, Username, Role, Email_Address, Password) VALUES (?, ?, ?, ?, ?)";
    bcrypt.hash(Password.toString(), salt, (err, hash) => {
      if (err) return res.json("Error");

      db.query(
        insertQuery,
        [image, Username, Role, Email, hash],
        (err, result) => {
          if (err) {
            console.error("Error inserting data:", err);
            return res.status(500).json({ Message: "Error inserting data" });
          }

          return res.json({ Status: "Success" });
        }
      );
    });
  });
});
// EDIT ADMIN
app.put("/addnewadmin/:id", upload.single("admin"), (req, res) => {
  const { id } = req.params;
  const { Username, Role, Email, Password } = req.body;

  let image = null;
  if (req.file) {
    image = req.file.filename;
  }

  db.query("SELECT * FROM admin_account WHERE ID = ?", [id], (err, result) => {
    const currentPassword = result[0].Password;

    if (currentPassword === Password) {
      if (image) {
        db.query(
          "UPDATE admin_account SET Image = ?, Username = ?, Role = ?, Email_Address = ? WHERE ID = ?",
          [image, Username, Role, Email, id],
          (err, result) => {
            if (err) {
              console.error("Error inserting data:", err);
              return res.status(500).json({ Message: "Error inserting data" });
            }

            return res.json({ Status: "Success" });
          }
        );
      } else {
        db.query(
          "UPDATE admin_account SET Username = ?, Role = ?, Email_Address = ? WHERE ID = ?",
          [Username, Role, Email, id],
          (err, result) => {
            if (err) {
              console.error("Error inserting data:", err);
              return res.status(500).json({ Message: "Error inserting data" });
            }

            return res.json({ Status: "Success" });
          }
        );
      }
    } else {
      bcrypt.hash(Password.toString(), salt, (err, hash) => {
        if (err) return res.json("Error");

        if (image) {
          db.query(
            "UPDATE admin_account SET Image = ?, Username = ?, Role = ?, Email_Address = ?, Password = ? WHERE ID = ?",
            [image, Username, Role, Email, hash, id],
            (err, result) => {
              if (err) {
                console.error("Error inserting data:", err);
                return res
                  .status(500)
                  .json({ Message: "Error inserting data" });
              }

              return res.json({ Status: "Success" });
            }
          );
        } else {
          db.query(
            "UPDATE admin_account SET Username = ?, Role = ?, Email_Address = ?, Password = ? WHERE ID = ?",
            [Username, Role, Email, hash, id],
            (err, result) => {
              if (err) {
                console.error("Error inserting data:", err);
                return res
                  .status(500)
                  .json({ Message: "Error inserting data" });
              }

              return res.json({ Status: "Success" });
            }
          );
        }
      });
    }
  });
});
// DELETE ADMIN
app.delete("/addnewadmin/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM admin_account WHERE ID = ?", [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Admin deleted successfully." });
  });
});

// MANAGE PAGES
app.post("/addexclusive", itemupload.single("store"), (req, res) => {
  const image = req.file.filename;
  const { ItemName } = req.body;
  const insertQuery = "INSERT INTO exclusive (Image, Item_Name) VALUES ( ?, ?)";

  db.query(insertQuery, [image, ItemName], (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(500).json({ Message: "Error inserting data" });
    }

    return res.json({ Status: "Success" });
  });
});
app.post("/addcategories", itemupload.single("store"), (req, res) => {
  const image = req.file.filename;
  const { ItemName } = req.body;
  const insertQuery =
    "INSERT INTO categories (Image, Item_Name) VALUES ( ?, ?)";

  db.query(insertQuery, [image, ItemName], (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(500).json({ Message: "Error inserting data" });
    }

    return res.json({ Status: "Success" });
  });
});
app.post("/addstore", itemupload.single("store"), (req, res) => {
  const image = req.file.filename;
  const { ItemName, Price } = req.body;
  const insertQuery =
    "INSERT INTO store (Image, Item_Name, Price) VALUES ( ?, ?, ?)";

  db.query(insertQuery, [image, ItemName, Price], (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(500).json({ Message: "Error inserting data" });
    }

    return res.json({ Status: "Success" });
  });
});
// EDIT ITEM
app.put("/exclusive/:id", itemupload.single("store"), (req, res) => {
  const { id } = req.params;

  let image = null;
  if (req.file) {
    image = req.file.filename;
  }
  const { itemName } = req.body;

  if (image) {
    db.query(
      "UPDATE exclusive SET Image = ?, Item_Name = ? WHERE ID = ?",
      [image, itemName, id],
      (err, results) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Item updated successfully." });
      }
    );
  } else {
    db.query(
      "UPDATE exclusive SET Item_Name = ? WHERE ID = ?",
      [itemName, id],
      (err, results) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Item updated successfully." });
      }
    );
  }
});
app.put("/categories/:id", itemupload.single("store"), (req, res) => {
  const { id } = req.params;

  let image = null;
  if (req.file) {
    image = req.file.filename;
  }
  const { itemName } = req.body;

  if (image) {
    db.query(
      "UPDATE categories SET Image = ?, Item_Name = ? WHERE ID = ?",
      [image, itemName, id],
      (err, results) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Item updated successfully." });
      }
    );
  } else {
    db.query(
      "UPDATE categories SET Item_Name = ? WHERE ID = ?",
      [itemName, id],
      (err, results) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Item updated successfully." });
      }
    );
  }
});
app.put("/store/:id", itemupload.single("store"), (req, res) => {
  const { id } = req.params;

  let image = null;
  if (req.file) {
    image = req.file.filename;
  }
  const { itemName, price } = req.body;

  if (image) {
    db.query(
      "UPDATE store SET Image = ?, Item_Name = ?, Price = ? WHERE ID = ?",
      [image, itemName, price, id],
      (err, results) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Item updated successfully." });
      }
    );
  } else {
    db.query(
      "UPDATE store SET Item_Name = ?, Price = ? WHERE ID = ?",
      [itemName, price, id],
      (err, results) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Item updated successfully." });
      }
    );
  }
});
// DELETE ITEM
app.delete("/exclusive/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM exclusive WHERE ID = ?", [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Item deleted successfully." });
  });
});
app.delete("/categories/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM categories WHERE ID = ?", [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Item deleted successfully." });
  });
});
app.delete("/store/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM store WHERE ID = ?", [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Item deleted successfully." });
  });
});

// Google OAuth authentication endpoint
app.post("/auth/google", async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture, sub: googleId } = ticket.getPayload();

    if (!email.endsWith("@cvsu.edu.ph")) {
      return res
        .status(403)
        .json({ message: "Only @cvsu.edu.ph emails are allowed" });
    }

    // Check if user exists
    db.query(
      "SELECT * FROM user_account WHERE Email_Address = ?",
      [email],
      async (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Database error" });
        }

        let userId;
        if (result.length === 0) {
          // Create new user
          const username = email.split("@")[0];
          const insertQuery = `
                    INSERT INTO user_account (
                        Email_Address,
                        Username,
                        Full_Name,
                        Profile_Picture,
                        Google_ID,
                        Is_Email_Verified,
                        Account_Status
                    ) VALUES (?, ?, ?, ?, ?, true, 'active')
                `;

          db.query(
            insertQuery,
            [email, username, name, picture, googleId],
            (err, result) => {
              if (err) {
                console.error("Insert error:", err);
                return res
                  .status(500)
                  .json({ message: "Could not create user" });
              }
              userId = result.insertId;

              // Generate JWT token
              const token = jwt.sign(
                { id: userId, email, name },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
              );

              res.json({
                Status: "Success",
                token,
                user: { id: userId, email, name, picture },
              });
            }
          );
        } else {
          // Update existing user's information
          userId = result[0].ID;
          const updateQuery = `
                    UPDATE user_account 
                    SET Full_Name = ?,
                        Profile_Picture = ?,
                        Last_Login = CURRENT_TIMESTAMP,
                        Is_Email_Verified = true
                    WHERE ID = ?
                `;

          db.query(updateQuery, [name, picture, userId], (err) => {
            if (err) {
              console.error("Update error:", err);
              return res.status(500).json({ message: "Could not update user" });
            }

            // Generate JWT token
            const token = jwt.sign(
              { id: userId, email, name },
              process.env.JWT_SECRET,
              { expiresIn: "1h" }
            );

            res.json({
              Status: "Success",
              token,
              user: { id: userId, email, name, picture },
            });
          });
        }
      }
    );
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(401).json({ message: "Invalid Google token" });
  }
});

// Set password for Google-authenticated users
app.post("/set-password", verifyToken, async (req, res) => {
  const { password } = req.body;
  const userId = req.user.id;

  try {
    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({
        Status: "Error",
        Message: "Password must be at least 6 characters long",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user's password
    const updateQuery = `
            UPDATE user_account 
            SET Password = ?
            WHERE ID = ?
        `;

    db.query(updateQuery, [hashedPassword, userId], (err, result) => {
      if (err) {
        console.error("Password update error:", err);
        return res.status(500).json({
          Status: "Error",
          Message: "Failed to update password",
        });
      }

      res.json({
        Status: "Success",
        Message: "Password set successfully",
      });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      Status: "Error",
      Message: "Server error occurred",
    });
  }
});

// Add login endpoint that supports both Google and password authentication
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    db.query(
      "SELECT * FROM user_account WHERE Email_Address = ?",
      [email],
      async (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ Status: "Error", Message: "Database error" });
        }

        if (result.length === 0) {
          return res
            .status(401)
            .json({ Status: "Error", Message: "User not found" });
        }

        const user = result[0];

        // If user has no password set (Google-only account)
        if (!user.Password) {
          return res.status(401).json({
            Status: "Error",
            Message: "Please use Google Sign-In or set a password first",
          });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.Password);
        if (!validPassword) {
          return res
            .status(401)
            .json({ Status: "Error", Message: "Invalid password" });
        }

        // Generate JWT token
        const token = jwt.sign(
          { id: user.ID, email: user.Email_Address },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        // Update last login
        db.query(
          "UPDATE user_account SET Last_Login = CURRENT_TIMESTAMP WHERE ID = ?",
          [user.ID]
        );

        res.json({
          Status: "Success",
          token,
          user: {
            id: user.ID,
            email: user.Email_Address,
            name: user.Full_Name,
            picture: user.Profile_Picture,
          },
        });
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ Status: "Error", Message: "Server error occurred" });
  }
});
