const db = require("./db");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { Resend } = require("resend");
const sgMail = require('@sendgrid/mail');

// Set API key from environment variable
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const salt = 10;
const app = express();

app.use(express.json());
app.use(cors(
  {
    origin: "https://capstone-eba.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }
));
app.use(bodyParser.json());
app.use(express.static("public"));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const { processPhotoRequest, validateEmail } = require('./arSendCopyImageMailer');
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb' }));


const resend = new Resend(process.env.RESEND_API_KEY);

const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/UPLOADS");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname),
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
      file.fieldname + "_" + Date.now() + path.extname(file.originalname),
    );
  },
});
const upload = multer({ storage: uploadStorage });
const itemupload = multer({ storage: itemStorage });


// Google OAuth configuration
if (!process.env.GOOGLE_CLIENT_ID) {
  console.error("GOOGLE_CLIENT_ID environment variable is not set");
  process.exit(1);
}
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware to verify JWT token
const verifyToken =
  (allowedRoles = []) =>
  (req, res, next) => {
    const token =
      req.headers["authorization"]?.split(" ")[1] ||
      req.headers["authorization"];

    if (!token) return res.status(403).json({ message: "No token provided" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      req.userId = decoded.id;

      if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

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

    const query = `SELECT * FROM user_account WHERE email_address = $1`;
    const result = await db.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Please register first" });
    }

    const user = result.rows[0];
    const token = jwt.sign(
      {
        id: user.id,
        role: "user",
        fullname: user.full_name,
        email: user.email_address,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.json({ token });
  } catch (err) {
    console.error("Google token verification failed:", err);
    res.status(400).json({ message: "Invalid Google authentication" });
  }
});

app.post("/usersignup", async (req, res) => {
  const { email, password } = req.body;

  if (!email.endsWith("@cvsu.edu.ph")) {
    return res.json({
      Status: "Error",
      Message: "Only @cvsu.edu.ph email addresses are allowed",
    });
  }

  try {
    // Check if email already exists
    const checkEmailQuery = `SELECT * FROM user_account WHERE email_address = $1`;
    const checkEmailResult = await db.query(checkEmailQuery, [email]);

    if (checkEmailResult.rows.length > 0) {
      return res.json({ Status: "Email address already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, salt);
    const username = email.split("@")[0];

    const insertQuery = `
      INSERT INTO user_account (email_address, password, username, account_status, is_email_verified)
      VALUES ($1, $2, $3, 'active', false)
      RETURNING id
    `;
    const insertResult = await db.query(insertQuery, [
      email,
      hashedPassword,
      username,
    ]);

    const token = jwt.sign(
      { id: insertResult.rows[0].id, role: "user", email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.json({ Status: "Success", token });
  } catch (error) {
    console.error("Server error:", error);
    res.json({ Status: "Error", Message: "Server error occurred" });
  }
});

// EBA Store Page
app.get("/storeinventory", async (req, res) => {
  try {
    const sql = `
      SELECT item_name, category, variant, image, price, "size", quantity
      FROM inventory
    `;

    const { rows } = await db.query(sql);

    const SIZE_ORDER = ["Xtra Small", "Small", "Medium", "Large", "Xtra Large"];
    const products = {};

    rows.forEach((row) => {
      const key = `${row.item_name}-${row.variant}`;

      if (!products[key]) {
        products[key] = {
          item_name: row.item_name,
          category: row.category,
          variant: row.variant,
          image: row.image,
          price: row.price,
          Sizes: [],
        };
      }

      products[key].Sizes.push({
        Size: row.size?.trim(),
        Quantity: row.quantity,
      });
    });

    Object.values(products).forEach((product) => {
      product.Sizes.sort((a, b) => {
        const aIndex = SIZE_ORDER.indexOf(a.Size);
        const bIndex = SIZE_ORDER.indexOf(b.Size);
        return aIndex - bIndex;
      });
    });

    res.json(Object.values(products));
  } catch (err) {
    console.error("Store inventory fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});


app.get("/top-selling-product", async (req, res) => {
  try {
    const sql = `
      SELECT 
        i.*,
        t.total_sold
      FROM inventory i
      JOIN (
          SELECT 
            item_name,
            variant,
            size,
            SUM(quantity) AS total_sold
          FROM transaction
          GROUP BY item_name, variant, size
          ORDER BY total_sold DESC
          LIMIT 4
      ) t
      ON i.item_name = t.item_name
      AND i.variant = t.variant
      AND i.size = t.size
      ORDER BY t.total_sold DESC
    `;

    const result = await db.query(sql);
    res.json(result.rows);
  } catch (err) {
    console.error("Top-selling product query failed:", err);
    res.status(500).json({ error: "Failed to fetch top-selling products" });
  }
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
      WHERE user_id = $1 AND category = $2 AND item_name = $3 AND variant = $4 AND size = $5
    `;

    let checkParams = [UserID, Category, ItemName, Variant, Size];

    db.query(checkQuery, checkParams, (err, results) => {
      if (err) {
        console.error("Error checking item:", err);
        return res.status(500).json({ Message: "Database error" });
      }

      if (results.length > 0) {
        let existingItem = results[0];
        let newQuantity = existingItem.quantity + parseInt(Quantity, 10);

        let updateQuery = `
          UPDATE item_cart 
          SET quantity = $1 
          WHERE user_id = $2 AND category = $3 AND item_name = $4 AND variant = $5 AND size = $6
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
          (user_id, category, image, item_name, variant, size, quantity, amount) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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
// Best seller
app.get("/api/best-seller", async (req, res) => {
  try {
    const sql = `
      SELECT item_name, variant, size, SUM(quantity) AS total_quantity
      FROM "transaction"
      GROUP BY item_name, variant, size
      ORDER BY total_quantity DESC
      LIMIT 1
    `;

    const result = await db.query(sql);
    res.json(result.rows[0] || {}); // return empty object if no data
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch best seller" });
  }
});

// Least purchased
app.get("/api/least-purchased", async (req, res) => {
  try {
    const sql = `
      SELECT item_name, variant, size, SUM(quantity) AS total_quantity
      FROM "transaction"
      GROUP BY item_name, variant, size
      ORDER BY total_quantity ASC
      LIMIT 1
    `;

    const result = await db.query(sql);
    res.json(result.rows[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch least purchased item" });
  }
});


// BULLETIN PAGE
// DISPLAY EVENT AND ANNOUNCEMENT
// Get total count of bulletins
app.get("/bulletin/count", async (req, res) => {
  try {
    const result = await db.query("SELECT COUNT(*) AS count FROM bulletin");
    res.json({ total: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    console.error("Database query failed:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Get paginated bulletins
app.get("/bulletin", async (req, res) => {
  try {
    // Flip order for demonstration
    const order = req.query.order === "DESC" ? "ASC" : "DESC";
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 4;
    const offset = (page - 1) * limit;

    const sql = `
      SELECT * FROM bulletin
      ORDER BY announcementdate ${order}
      LIMIT $1 OFFSET $2
    `;

    const result = await db.query(sql, [limit, offset]);
    res.json(result.rows);
  } catch (err) {
    console.error("Database query failed:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

app.get("/searchcustomer", async (req, res) => {
  const searchTerm = req.query.q || "";

  const sql = `
    SELECT *
    FROM transaction
    WHERE email_address ILIKE $1
    ORDER BY customer_name
  `;

  try {
    const result = await db.query(sql, [`%${searchTerm}%`]); // $1 replaced by parameter
    const results = result.rows;

    const grouped = {};

    results.forEach((row) => {
      const email = row.email_address;

      if (!grouped[email]) {
        grouped[email] = {
          Customer_Name: row.customer_name,
          Email_Address: row.email_address,
          Username: row.username,
          transaction: [],
        };
      }

      grouped[email].transaction.push({
        ID: row.id,
        OrderID: row.orderid,
        Customer_Name: row.customer_name,
        Email_Address: row.email_address,
        Item_Name: row.item_name,
        Quantity: row.quantity,
        Variant: row.variant,
        Status: row.status,
      });
    });

    res.json(Object.values(grouped));
  } catch (err) {
    console.error("Database query failed:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

app.get("/searchtransactionbyemail/:email", (req, res) => {
  const email = req.params.email;
  db.query(
    "SELECT * FROM transaction WHERE email_address = $1",
    [email],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
    },
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
app.get("/categories", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM categories");
    res.json(result.rows); // ✅ send only the array
  } catch (err) {
    console.error("Categories fetch error:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

app.get("/search", (req, res) => {
  const search = req.query.q;
  const sql = `SELECT * FROM store WHERE item_name ILIKE $1`;

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
    "SELECT * FROM store_variant WHERE store_id = $1",
    [itemId],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    },
  );
});

// EBA CART PAGE
// FETCH ALL DATA IN CART AND DISPLAY TO CART PAGE

app.get("/cartItem", verifyToken("user"), async (req, res) => {
  try {
    const userId = req.userId;

    const { rows } = await db.query(
      "SELECT * FROM item_cart WHERE user_id = $1 ORDER BY id ASC",
      [userId],
    );

    res.json({ cartItems: rows });
  } catch (err) {
    console.error("Cart fetch error:", err);
    res.status(500).json({ error: "Database error" });
  }
});



// EBA STORE PAGE
// NOTICED THE CUSTOMER THROUGH EMAIL AFTER THE ORDER HAS BEEN CONFIRMED

// ADD CUSTOMER'S ORDER TO THE CART
app.put("/cart/:id", (req, res) => {
  const { id } = req.params;
  const { Quantity } = req.body;
  const sql = `UPDATE item_cart SET quantity = $1 WHERE id = $2`;
  db.query(sql, [Quantity, id], (err, result) => {
    if (err) return res.status(500).json({ Message: "Failed to update" });
    res.json({ Status: "Success" });
  });
});
app.delete("/cart/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM item_cart WHERE id = $1", [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Cart deleted successfully." });
  });
});

app.post("/checkout", async (req, res) => {
  const { userId } = req.body;
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const combineQuery = `
      SELECT
        ic.image,
        ic.item_name,
        ic.variant,
        ic.size,
        ic.quantity,
        ic.amount,
        ic.date,
        ua.full_name,
        ua.email_address
      FROM 
        user_account ua
      LEFT JOIN
        item_cart ic
      ON
        ua.id = ic.user_id
      WHERE
        ua.id = $1;
    `;

    const { rows } = await client.query(combineQuery, [userId]);
    const cartItems = rows.filter((row) => row.item_name !== null);

    if (cartItems.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Your cart is empty" });
    }

    const Pending = "Pending";

    const tempInsertQuery = `
      INSERT INTO transaction 
      (orderid, image, item_name, variant, size, quantity, amount, customer_name, email_address, date, status) 
      VALUES
    `;

    const values = cartItems.map((row) => [
      null,
      row.image,
      row.item_name,
      row.variant,
      row.size,
      row.quantity,
      row.amount * row.quantity,
      row.full_name,
      row.email_address,
      row.date,
      Pending,
    ]);

    const placeholders = values
      .map((_, i) => {
        const offset = i * 11;
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4},
                 $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8},
                 $${offset + 9}, $${offset + 10}, $${offset + 11})`;
      })
      .join(",");

    const flatValues = values.flat();

    const insertResult = await client.query(
      tempInsertQuery + placeholders + " RETURNING id",
      flatValues,
    );

    const firstId = insertResult.rows[0].id;
    const orderID = `${new Date().getFullYear()}0${firstId}`;

    await client.query(
      `UPDATE transaction SET orderid = $1 WHERE id >= $2 AND id < $3`,
      [orderID, firstId, firstId + cartItems.length],
    );

    const currentDate = new Date();
    const year = currentDate.getFullYear().toString().slice(-2);
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const day = currentDate.getDate().toString().padStart(2, "0");
    const formattedDate = `${month}-${day}-${year}`;

    // Compose email HTML
    const itemRowsHTML = cartItems
      .map((row) => {
        const variantDisplay = row.variant?.trim() ? row.variant : "";
        const sizeDisplay = row.size?.trim() ? row.size : "";
        const productDisplay = [row.item_name, variantDisplay, sizeDisplay]
          .filter(Boolean)
          .join(" - ");

        return `
          <tr>
            <td style="border: 1px solid gray; padding: 8px; text-align: center;">
              ${productDisplay}
            </td>
            <td style="border: 1px solid gray; padding: 8px; text-align: center;">
              ₱${row.amount} x ${row.quantity} = ₱${row.amount * row.quantity}
            </td>
          </tr>
        `;
      })
      .join("");

    const totalAmount = cartItems.reduce(
      (sum, row) => sum + row.amount * row.quantity,
      0,
    );

    const user = cartItems[0];

    // Send email using SendGrid
    const msg = {
      to: user.email_address,
      from: "ebacvsutanza@gmail.com", // Must be verified in SendGrid
      subject: "Order Details",
      html: `
        <header style='height: 150px; background: #c1ff72; display: flex; flex-direction: column; gap: 10px;'>
          <img src="https://res.cloudinary.com/dfmnlcvbe/image/upload/v1744102780/logo_qy0g8a.png" style='width: 80px; height: 80px;'/>
          <h2>External Business and<br>Affairs</h2>
        </header>

        <h3>Thank you for your order!</h3>
        <p>${user.full_name}</p>
        <p>Your order was received! We're working to get it processed and ready to claim.</p>

        <div>
          <p>Order Number: #${orderID}</p>
          <p>Order Date: ${formattedDate}</p>
        </div>

        <table style="border: 1px solid gray; border-collapse: collapse; width: 100%;">
          <tr>
            <th style="border: 1px solid gray; padding: 8px;">PRODUCT</th>
            <th style="border: 1px solid gray; padding: 8px;">PRICE</th>
          </tr>
          ${itemRowsHTML}
          <tr>
            <td></td>
            <td><strong>Total: ₱${totalAmount}</strong></td>
          </tr>
        </table>
      `,
    };

    await sgMail.send(msg);

    // Clear the cart
    await client.query("DELETE FROM item_cart WHERE user_id = $1", [userId]);
    await client.query("COMMIT");

    res.json({ Status: "Success" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Checkout Error:", err);
    res
      .status(500)
      .json({ error: "Transaction failed or email sending failed" });
  } finally {
    client.release();
  }
});


app.post("/requestCancelOrder", async (req, res) => {
  const { email, orderId, item, variant } = req.body;

  
  try {
    const checkOrder = await db.query(
      "SELECT * FROM transaction WHERE orderid = $1 AND email_address = $2",
      [orderId, email],
    );
  
    if (checkOrder.rowCount === 0) {
      return res.status(404).send("Order not found.");
    }

    // Generate a verification token
    const token = jwt.sign(
      { email, orderId, item, variant },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    const cancelLink = `https://capstone-cxej.onrender.com/verifyCancelOrder/${token}`;

    // Compose the email
    const msg = {
      to: email,
      from: "ebacvsutanza@gmail.com",
      subject: "Order Cancellation Verification",
      html: `
        <p>We received a request to cancel your order number 
        <strong>${orderId}, ${item} ${variant ? `- ${variant}` : ""}</strong></p>

        <p>If this was you, please confirm by clicking the link below:</p>

        <a href="${cancelLink}">Confirm Cancellation</a>
      `,
    };

    // Send the email
    await sgMail.send(msg);

    console.log("SendGrid email sent to:", email);
    res.json({ message: "Verification email sent" });
  } catch (err) {
    console.error("Failed to send cancellation email:", err);
    res.status(500).json({ message: "Failed to send email" });
  }
});
app.get("/verifyCancelOrder/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email, orderId } = decoded;

    const updateQuery = `
      UPDATE transaction
      SET status = 'Cancelled'
      WHERE orderid = $1 AND email_address = $2
    `;

    await db.query(updateQuery, [orderId, email]);

    // ✅ Redirect to your frontend Thank You page
    res.redirect("https://capstone-eba.vercel.app/verifycancelorder");
  } catch (err) {
    console.error("Verification failed:", err);
    res.status(400).send("Invalid or expired token.");
  }
});



// ADMINPANEL
// CHECK AND LOGIN THE ADMIN TO ACCESS ADMIN PANEL
app.post("/adminlogin", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if admin exists
    const query = `
      SELECT * 
      FROM admin_account 
      WHERE email_address = $1
    `;

    const result = await db.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Email address doesn't exist",
      });
    }

    const admin = result.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect password",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: admin.id,
        role: admin.role,
        image: admin.image,
        username: admin.username,
        email: admin.email_address,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.json({ token });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({
      message: "Server error occurred",
    });
  }
});


app.get(
  "/adminpanel",
  verifyToken(["DEAN", "EBA Staff", "Admin"]),
  async (req, res) => {
    const adminID = req.user.id;

    try {
      const sql = `
        SELECT image, username, role, email_address
        FROM admin_account
        WHERE id = $1
      `;

      const result = await db.query(sql, [adminID]);

      if (result.rows.length === 0) {
        return res.sendStatus(404);
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Admin panel fetch error:", err);
      res.status(500).json({ error: "Failed to fetch admin data" });
    }
  },
);

app.post("/adminchangepass", async (req, res) => {
  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({ message: "Missing ID or password" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = "UPDATE admin_account SET password = $1 WHERE id = $2";

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
app.get("/notifications", async (req, res) => {
  try {
    const query = `
      SELECT 
        'transaction' AS type, 
        id, 
        item_name, 
        variant, 
        size, 
        quantity, 
        created_at AS time, 
        status 
      FROM transaction 
      WHERE status = 'Pending'
      
      UNION ALL
      
      SELECT 
        'low_stock' AS type, 
        id, 
        item_name, 
        variant, 
        size, 
        quantity, 
        NULL AS time, 
        NULL AS status 
      FROM inventory 
      WHERE quantity <= 5
      
      ORDER BY time DESC NULLS LAST;
    `;

    const result = await db.query(query);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Database query error" });
  }
});

// DASHBOARD PAGE
app.get("/api/dashboard/all", (req, res) => {
  const queries = {
    totalSales: `
            SELECT COALESCE(SUM(amount), 0) as total_sales 
            FROM transaction
            WHERE status IS NULL OR status != 'Cancelled'
        `,
    totalOrders: `
            SELECT COUNT(*) as total_orders 
            FROM transaction
            WHERE status IS NULL OR status != 'Cancelled'
        `,
    lowStock: `
            SELECT COUNT(*) as low_stock 
            FROM inventory 
            WHERE quantity < 10 AND quantity > 0
        `,
    availableStocks: `
            SELECT COALESCE(SUM(quantity), 0) as total_stocks 
            FROM inventory
            WHERE quantity > 0
        `,
    newOrders: `
            SELECT COUNT(*) as new_orders 
            FROM transaction 
            WHERE date >= CURRENT_DATE - INTERVAL '7 days'
            AND (status IS NULL OR status != 'Cancelled')
        `,
    fastMovingItems: `
            SELECT 
                item_name,
                COUNT(*) as order_count
            FROM transaction
            WHERE status IS NULL OR status != 'Cancelled'
            GROUP BY item_name
            ORDER BY order_count DESC
            LIMIT 5
        `,
    salesData: `
            SELECT 
                TO_CHAR(date, 'Month') AS month, 
                item_name as category, 
                SUM(amount) AS total_sales 
            FROM transaction 
            WHERE status IS NULL OR status != 'Cancelled'
            GROUP BY TO_CHAR(date, 'Month'), item_name 
            ORDER BY MIN(EXTRACT(MONTH FROM date))
        `,
    ordersData: `
            SELECT 
                TO_CHAR(date, 'Month') AS month, 
                item_name as category, 
                COUNT(*) AS total_orders 
            FROM transaction 
            WHERE status IS NULL OR status != 'Cancelled'
            GROUP BY TO_CHAR(date, 'Month'), item_name 
            ORDER BY MIN(EXTRACT(MONTH FROM date))
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
                key === "salesData" ? row.total_sales : row.total_orders,
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

app.get("/api/sales-data", async (req, res) => {
  try {
    const query = `
      SELECT 
        EXTRACT(MONTH FROM date) AS month_number,
        TO_CHAR(date, 'Month') AS month,
        item_name AS category,
        SUM(amount) AS total_sales
      FROM transaction
      GROUP BY month_number, month, item_name
      ORDER BY month_number;
    `;

    const result = await db.query(query);
    const rows = result.rows;

    // Remove padded spaces from month names
    rows.forEach((row) => {
      row.month = row.month.trim();
      row.total_sales = parseFloat(row.total_sales);
    });

    const formattedData = {
      labels: [...new Set(rows.map((row) => row.month))],
      datasets: [],
    };

    const categories = [...new Set(rows.map((row) => row.category))];

    categories.forEach((category) => {
      formattedData.datasets.push({
        label: category,
        data: formattedData.labels.map((month) => {
          const found = rows.find(
            (row) => row.month === month && row.category === category,
          );
          return found ? found.total_sales : 0;
        }),
      });
    });

    res.json(formattedData);
  } catch (err) {
    console.error("Sales data fetch error:", err);
    res.status(500).json({ error: "Failed to fetch sales data" });
  }
});
app.get("/api/orders-data", async (req, res) => {
  try {
    const query = `
      SELECT
        EXTRACT(MONTH FROM created_at) AS month_number,
        TO_CHAR(created_at, 'Month') AS month,
        item_name AS category,
        COUNT(*) AS total_orders
      FROM transaction
      GROUP BY month_number, month, item_name
      ORDER BY month_number;
    `;

    const result = await db.query(query);
    const rows = result.rows;

    // Remove extra spaces from month names
    rows.forEach((row) => (row.month = row.month.trim()));

    const labels = [...new Set(rows.map((row) => row.month))];
    const categories = [...new Set(rows.map((row) => row.category))];

    const datasets = categories.map((category) => ({
      label: category,
      data: labels.map((month) => {
        const found = rows.find(
          (row) => row.month === month && row.category === category,
        );
        return found ? parseInt(found.total_orders, 10) : 0;
      }),
    }));

    res.json({ labels, datasets });
  } catch (err) {
    console.error("Orders data fetch error:", err);
    res.status(500).json({ error: "Failed to fetch orders data" });
  }
});

app.get("/api/test/transaction", (req, res) => {
  db.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'transaction'",
    (err, result) => {
      if (err) {
        console.error("Error describing transaction table:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json(result);
    },
  );
});

app.get("/api/dashboard/total-sales", (req, res) => {
  const query = `
        SELECT COALESCE(SUM(amount), 0) as total_sales 
        FROM transaction
        WHERE status IS NULL OR status != 'Cancelled'
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
        WHERE status IS NULL OR status != 'Cancelled'
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
        WHERE quantity < 10 AND quantity > 0
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
        SELECT COALESCE(SUM(quantity), 0) as total_stocks 
        FROM inventory
        WHERE quantity > 0
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
    SELECT COUNT(*)::int AS new_orders
    FROM transaction
    WHERE status = 'Confirmed'
      AND created_at >= NOW()::timestamp - INTERVAL '7 days';
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("Error in new orders query:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ new_orders: parseInt(result.rows[0].new_orders, 10) });
  });
});

app.get("/api/dashboard/fast-moving-items", (req, res) => {
  const query = `
        SELECT 
            item_name,
            COUNT(*) as order_count
        FROM transaction
        WHERE status IS NULL OR status != 'Cancelled'
        GROUP BY item_name
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
app.get("/transaction/count", async (req, res) => {
  try {
    const result = await db.query("SELECT COUNT(*) AS count FROM transaction");

    res.json({ total: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to count transactions" });
  }
});
app.get("/transaction", async (req, res) => {
  try {
    const order = req.query.order === "DESC" ? "DESC" : "ASC";
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const sql = `
      SELECT *
      FROM "transaction"
      ORDER BY created_at ${order}
      LIMIT $1 OFFSET $2
    `;

    const result = await db.query(sql, [limit, offset]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// EDIT TRANSACTION
app.put("/transaction/:id", async (req, res) => {
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

  try {
    await db.query(
      `UPDATE transaction 
       SET item_name = $1,
           variant = $2,
           size = $3,
           quantity = $4,
           customer_name = $5,
           email_address = $6,
           phone = $7,
           payment_method = $8,
           amount = $9
       WHERE id = $10`,
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
    );

    res.json({ message: "Transaction updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

// DELETE TRANSACTION
app.delete("/transaction/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM transaction WHERE id = $1", [req.params.id]);
    res.json({ message: "Transaction deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

// BULK CONFIRMATION & CANCELLATION
app.post("/bulk-confirm", async (req, res) => {
  const { orderIds } = req.body;

  if (!orderIds || orderIds.length === 0) {
    return res.status(400).json({ message: "No orders selected" });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const placeholders = orderIds.map((_, i) => `$${i + 1}`).join(",");

    // 1️⃣ Get pending transactions
    const txnResult = await client.query(
      `SELECT * FROM transaction
       WHERE id IN (${placeholders}) 
       AND status = 'Pending'`,
      orderIds,
    );

    if (txnResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "No pending orders" });
    }

    // 2️⃣ Check & update inventory
    for (const txn of txnResult.rows) {
      const inventoryResult = await client.query(
        `SELECT quantity FROM inventory
         WHERE item_name = $1 
         AND variant = $2 
         AND size = $3
         FOR UPDATE`,
        [txn.item_name, txn.variant, txn.size],
      );

      if (
        inventoryResult.rows.length === 0 ||
        inventoryResult.rows[0].quantity < txn.quantity
      ) {
        throw new Error(
          `Out of stock: ${txn.item_name} (${txn.variant}, ${txn.size})`,
        );
      }

      await client.query(
        `UPDATE inventory
         SET quantity = quantity - $1
         WHERE item_name = $2 
         AND variant = $3 
         AND size = $4`,
        [txn.quantity, txn.item_name, txn.variant, txn.size],
      );
    }

    // 3️⃣ Update transaction status
    await client.query(
      `UPDATE transaction
       SET status = 'Confirmed'
       WHERE id IN (${placeholders})`,
      orderIds,
    );

    await client.query("COMMIT");

    // 4️⃣ Send confirmation emails (AFTER COMMIT)
    for (const txn of txnResult.rows) {
      try {
        const msg = {
          to: txn.email_address,
          from: "ebacvsutanza@gmail.com",
          subject: "Your Order Has Been Confirmed",
          text: `Hello ${txn.customer_name}! Your order number ${txn.orderid}, ${txn.variant} ${txn.item_name} ${txn.variant ? "-" : ""} ${txn.size} has been confirmed. We appreciate your purchase!`,
          html: `<p>Hello <strong>${txn.customer_name}</strong>!</p>
             <p>Your order <strong>#${txn.orderid}</strong>, ${txn.variant} ${txn.item_name} ${txn.variant ? "-" : ""} ${txn.size} has been confirmed.</p>
             <p>We appreciate your purchase!</p>`,
        };

        await sgMail.send(msg);
      } catch (emailError) {
        console.error(
          `Email failed for order ${txn.orderid}:`,
          emailError.message,
        );
      }
    }

    res.json({ message: "Bulk orders confirmed successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Bulk confirm error:", error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

app.post("/bulk-cancel", async (req, res) => {
  const { orderIds } = req.body;

  if (!orderIds || orderIds.length === 0) {
    return res.status(400).json({ message: "No orders selected" });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const placeholders = orderIds.map((_, i) => `$${i + 1}`).join(",");

    // 1️⃣ Get pending orders first
    const txnResult = await client.query(
      `SELECT * FROM transaction
       WHERE id IN (${placeholders})
       AND status = 'Pending'
       FOR UPDATE`,
      orderIds,
    );

    if (txnResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "No pending orders found" });
    }

    // 2️⃣ Update status to Cancelled
    await client.query(
      `UPDATE transaction
       SET status = 'Cancelled'
       WHERE id IN (${placeholders})
       AND status = 'Pending'`,
      orderIds,
    );

    await client.query("COMMIT");

    // 3️⃣ Send cancellation emails AFTER commit
    for (const txn of txnResult.rows) {
      try {
        const msg = {
          to: txn.email_address,
          from: "ebacvsutanza@gmail.com",
          subject: "Your Order Has Been Cancelled",
          text: `Hello ${txn.customer_name}! Your order number ${txn.orderid}, ${txn.variant} ${txn.item_name} ${txn.variant ? "-" : ""} ${txn.size} has been cancelled. We appreciate your purchase!`,
          html: `<p>Hello <strong>${txn.customer_name}</strong>!</p>
             <p>Your order <strong>#${txn.orderid}</strong>, ${txn.variant} ${txn.item_name} ${txn.variant ? "-" : ""} ${txn.size} has been cancelled.</p>
             <p>We appreciate your purchase!</p>`,
        };

        await sgMail.send(msg);
      } catch (emailError) {
        console.error(
          `Email failed for cancelled order ${txn.orderid}:`,
          emailError.message,
        );
      }
    }

    res.json({ message: "Bulk orders cancelled successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Bulk cancel error:", error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});


// CONFIRM OR CANCEL ORDER
app.post("/confirm-order", async (req, res) => {
  const { id, orderId, name, customerEmail } = req.body;

  try {
    // Get transaction details
    const transactionResult = await db.query(
      'SELECT item_name, variant, size, quantity FROM "transaction" WHERE id = $1',
      [id],
    );

    if (transactionResult.rows.length === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const { item_name, variant, size, quantity } = transactionResult.rows[0];

    // Get inventory
    const inventoryResult = await db.query(
      `SELECT quantity FROM inventory WHERE item_name = $1 AND variant = $2 AND size = $3`,
      [item_name, variant, size],
    );

    if (inventoryResult.rows.length === 0) {
      return res.status(404).json({ message: "Item not found in inventory" });
    }

    const currentStock = inventoryResult.rows[0].quantity;

    if (currentStock < quantity) {
      return res.status(400).json({ message: "This item is out of stock" });
    }

    // Update inventory
    await db.query(
      `UPDATE inventory SET quantity = quantity - $1 WHERE item_name = $2 AND variant = $3 AND size = $4`,
      [quantity, item_name, variant, size],
    );

    // Update transaction status
    await db.query(`UPDATE "transaction" SET status = $1 WHERE id = $2`, [
      "Confirmed",
      id,
    ]);

    // Send confirmation email using SendGrid
    const msg = {
      to: customerEmail,
      from: "ebacvsutanza@gmail.com", // Must be verified in SendGrid
      subject: "Your Order Has Been Confirmed",
      text: `Hello ${name}! Your order number ${orderId}, ${variant} ${item_name} ${variant ? "-" : ''} ${size} has been confirmed. We appreciate your purchase!`,
      html: `<p>Hello <strong>${name}</strong>!</p>
             <p>Your order <strong>#${orderId}</strong>, ${variant} ${item_name} ${variant ? "-" : ''} ${size} has been confirmed.</p>
             <p>We appreciate your purchase!</p>`,
    };

    await sgMail.send(msg);

    res
      .status(200)
      .json({ message: "Order confirmed, inventory updated, and email sent" });
  } catch (err) {
    console.error("Confirm Order Error:", err);
    res.status(500).json({ message: "Failed to confirm order or send email" });
  }
});

app.post("/cancel-order", async (req, res) => {
  const { id, orderId, itemName, variant, size, name, customerEmail } =
    req.body;

  try {
    // Fetch the transaction
    const transactionResult = await db.query(
      'SELECT status, quantity FROM "transaction" WHERE id = $1',
      [id],
    );

    if (transactionResult.rows.length === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const { status, quantity } = transactionResult.rows[0];

    // If already cancelled
    if (status === "Cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    // Update transaction status to Cancelled
    await db.query('UPDATE "transaction" SET status = $1 WHERE id = $2', [
      "Cancelled",
      id,
    ]);

    // Restore inventory
    // await db.query(
    //   `UPDATE inventory SET quantity = quantity + $1 WHERE item_name = $2 AND variant = $3 AND size = $4`,
    //   [quantity, itemName, variant, size],
    // );

    // Send cancellation email using SendGrid
    const msg = {
      to: customerEmail,
      from: "ebacvsutanza@gmail.com", // Must be verified in SendGrid
      subject: "Your Order Has Been Cancelled",
      text: `Hello ${name}! Your order number ${orderId}, ${variant} ${itemName} ${variant ? "-" : ""} ${size} has been cancelled. We appreciate your purchase!`,
      html: `<p>Hello <strong>${name}</strong>!</p>
             <p>Your order <strong>#${orderId}</strong>, ${variant} ${itemName} ${variant ? "-" : ""} ${size} has been cancelled.</p>
             <p>We appreciate your purchase!</p>`,
    };

    await sgMail.send(msg);

    res
      .status(200)
      .json({ message: "Order cancelled successfully and email sent" });
  } catch (err) {
    console.error("Cancel Order Error:", err);
    res.status(500).json({ message: "Failed to cancel order or send email" });
  }
});


// EVENTS & ANNOUNCEMENT PAGE
// ADD EVENT/ANNOUNCEMENT
app.post("/announcement", (req, res) => {
  const { title, details, facultyname, announcementdate } = req.body;

  const insertQuery =
    "INSERT INTO bulletin (title, details, faculty_staff, announcementdate) VALUES ($1, $2, $3, $4)";
  db.query(
    insertQuery,
    [title, details, facultyname, announcementdate],
    (err, result) => {
      if (err) {
        console.error("Error inserting data:", err);
        return res.status(500).json({ Message: "Error inserting data" });
      }

      return res.json({ Status: "Success" });
    },
  );
});
// EDIT EVENT/ANNOUNCEMENT
app.put("/announcement/:id", (req, res) => {
  const { id } = req.params;
  const { Title, Details, FacultyName, announcementDate } = req.body;

  db.query(
    "UPDATE bulletin SET title = $1, details = $2, faculty_staff = $3, announcementdate = $4 WHERE id = $5",
    [Title, Details, FacultyName, announcementDate, id],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json({ message: "Announcement updated successfully." });
    },
  );
});
// DELETE EVENT/ANNOUNCEMENT
app.delete("/announcement/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM bulletin WHERE id = $1", [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Announcement deleted successfully." });
  });
});

// INVENTORY PAGE
app.get("/inventory/count", async (req, res) => {
  try {
    const result = await db.query("SELECT COUNT(*) AS count FROM inventory");
    res.json({ total: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get inventory count" });
  }
});
app.get("/inventory", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const sql = `
      SELECT *
      FROM inventory
      ORDER BY id DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await db.query(sql, [limit, offset]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

// ADD INVENTORY
app.post("/inventory", itemupload.single("inventory"), async (req, res) => {
  const client = await db.connect();

  try {
    const image = req.file ? req.file.filename : null;
    const { category, itemName, variant, size, quantity, price } = req.body;

    await client.query("BEGIN");

    // 1️⃣ Check if item exists
    const checkQuery = `
      SELECT id, quantity 
      FROM inventory 
      WHERE category = $1 
        AND item_name = $2 
        AND variant = $3 
        AND size = $4
      LIMIT 1
    `;

    const checkResult = await client.query(checkQuery, [
      category,
      itemName,
      variant,
      size,
    ]);

    if (checkResult.rows.length > 0) {
      // 2️⃣ If exists → UPDATE quantity
      const existing = checkResult.rows[0];

      const updateQuery = `
        UPDATE inventory
        SET quantity = $1,
            price = $2
        WHERE id = $3
      `;

      await client.query(updateQuery, [
        existing.quantity + parseInt(quantity),
        price,
        existing.id,
      ]);
    } else {
      // 3️⃣ If not exists → INSERT
      const insertQuery = `
        INSERT INTO inventory 
        (image, category, item_name, variant, size, quantity, price)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;

      await client.query(insertQuery, [
        image,
        category,
        itemName,
        variant,
        size,
        quantity,
        price,
      ]);
    }

    await client.query("COMMIT");

    return res.json({ Status: "Success" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error processing inventory:", err);
    return res.status(500).json({ Message: "Error saving inventory" });
  } finally {
    client.release();
  }
});

// EDIT INVENTORY
app.put("/inventory/:id", itemupload.single("inventory"), (req, res) => {
  const { id } = req.params;
  const { category, itemName, variant, size, quantity, price } = req.body;

  if (!category || !itemName || !variant || !size || !quantity || !price) {
    return res
      .status(400)
      .json({ message: "All fields except image are required." });
  }

  const numericQuantity = parseInt(quantity, 10);
  const numericPrice = parseFloat(price);

  if (isNaN(numericQuantity) || isNaN(numericPrice)) {
    return res
      .status(400)
      .json({ message: "Quantity and price must be valid numbers." });
  }

  // Build query dynamically based on whether an image was uploaded
  const fields = [
    "category",
    "item_name",
    "variant",
    "size",
    "quantity",
    "price",
  ];
  const values = [
    category,
    itemName,
    variant,
    size,
    numericQuantity,
    numericPrice,
  ];

  let query = `UPDATE inventory SET ${fields.map((f, i) => `${f} = $${i + 1}`).join(", ")}`;

  if (req.file) {
    query += `, image = $${values.length + 1}`;
    values.push(req.file.filename);
  }

  query += ` WHERE id = $${values.length + 1}`;
  values.push(id);

  db.query(query, values, (err, results) => {
    if (err)
      return res.status(500).json({ message: "Database error", error: err });
    if (results.rowCount === 0)
      return res.status(404).json({ message: "Inventory item not found" });
    res.json({ message: "Inventory updated successfully." });
  });
});

// DELETE INVENTORY
app.delete("/inventory/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM inventory WHERE id = $1", [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Inventory deleted successfully." });
  });
});

// ------------------------ GET TOTAL COUNT ------------------------
app.get("/manageadmin/count", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT COUNT(*) AS count FROM admin_account",
    );
    const total = parseInt(result.rows[0].count, 10); // convert string to number
    res.json({ total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" }); // lowercase 'message' for consistency
  }
});


// ------------------------ GET ADMINS WITH PAGINATION ------------------------
app.get("/manageadmin", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  try {
    const results = await db.query(
      "SELECT * FROM admin_account ORDER BY id ASC LIMIT $1 OFFSET $2",
      [limit, offset],
    );
    res.json(results.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ Message: "Server error" });
  }
});

// ------------------------ ADD NEW ADMIN ------------------------
app.post("/manageadmin", upload.single("manageadmin"), async (req, res) => {
  const { Username, Role, Email_Address, Password } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!Username || !Role || !Email_Address || !Password) {
    return res.status(400).json({ Status: "Please fill all required fields" });
  }

  try {
    // Check if username or email exists
    const existing = await db.query(
      "SELECT * FROM admin_account WHERE username = $1 OR email_address = $2",
      [Username, Email_Address],
    );
    if (existing.rows.length > 0) {
      return res.json({ Status: "Username or Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(Password.toString(), salt);

    // Insert new admin
    await db.query(
      "INSERT INTO admin_account (image, username, role, email_address, password) VALUES ($1, $2, $3, $4, $5)",
      [image, Username, Role, Email_Address, hashedPassword],
    );

    res.json({ Status: "Success" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Message: "Error adding admin" });
  }
});

// ------------------------ EDIT ADMIN ------------------------
app.put("/manageadmin/:id", upload.single("manageadmin"), async (req, res) => {
  const { id } = req.params;
  const { Username, Role, Email_Address, Password } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    // Get current admin
    const admins = await db.query("SELECT * FROM admin_account WHERE id = $1", [
      id,
    ]);
    if (admins.rows.length === 0) {
      return res.status(404).json({ Status: "Admin not found" });
    }

    const currentAdmin = admins.rows[0];

    // Prepare fields to update
    const fields = [];
    const values = [];
    let paramNum = 1;

    if (Username) {
      fields.push(`username = $${paramNum++}`);
      values.push(Username);
    }

    if (Role) {
      fields.push(`role = $${paramNum++}`);
      values.push(Role);
    }

    if (Email_Address) {
      fields.push(`email_address = $${paramNum++}`);
      values.push(Email_Address);
    }

    if (image) {
      fields.push(`image = $${paramNum++}`);
      values.push(image);
    }

    // Only update password if provided and different
    if (Password) {
      const isSamePassword = await bcrypt.compare(
        Password,
        currentAdmin.password,
      );
      if (!isSamePassword) {
        const hashedPassword = await bcrypt.hash(Password.toString(), salt);
        fields.push(`password = $${paramNum++}`);
        values.push(hashedPassword);
      }
    }

    if (fields.length === 0) {
      return res.json({ Status: "No changes provided" });
    }

    values.push(id);
    const sql = `UPDATE admin_account SET ${fields.join(", ")} WHERE id = $${paramNum}`;

    await db.query(sql, values);
    res.json({ Status: "Success" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Status: "Error updating admin" });
  }
});

// ------------------------ DELETE ADMIN ------------------------
app.delete("/manageadmin/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM admin_account WHERE id = $1", [id]);
    res.json({ Status: "Admin deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Status: "Error deleting admin" });
  }
});

// MANAGE PAGES
app.post("/addexclusive", itemupload.single("store"), (req, res) => {
  const image = req.file.filename;
  const { ItemName } = req.body;
  const insertQuery =
    "INSERT INTO exclusive (image, item_name) VALUES ( $1, $2)";

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
    "INSERT INTO categories (image, item_name) VALUES ( $1, $2)";

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
    "INSERT INTO store (image, item_name, price) VALUES ( $1, $2, $3)";

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
      "UPDATE exclusive SET image = $1, item_name = $2 WHERE id = $3",
      [image, itemName, id],
      (err, results) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Item updated successfully." });
      },
    );
  } else {
    db.query(
      "UPDATE exclusive SET item_name = $1 WHERE id = $2",
      [itemName, id],
      (err, results) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Item updated successfully." });
      },
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
      "UPDATE categories SET image = $1, item_name = $2 WHERE id = $3",
      [image, itemName, id],
      (err, results) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Item updated successfully." });
      },
    );
  } else {
    db.query(
      "UPDATE categories SET item_name = $1 WHERE id = $2",
      [itemName, id],
      (err, results) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Item updated successfully." });
      },
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
      "UPDATE store SET image = $1, item_name = $2, price = $3 WHERE id = $4",
      [image, itemName, price, id],
      (err, results) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Item updated successfully." });
      },
    );
  } else {
    db.query(
      "UPDATE store SET item_name = $1, price = $2 WHERE id = $3",
      [itemName, price, id],
      (err, results) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Item updated successfully." });
      },
    );
  }
});
// DELETE ITEM
app.delete("/exclusive/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM exclusive WHERE id = $1", [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Item deleted successfully." });
  });
});
app.delete("/categories/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM categories WHERE id = $1", [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Item deleted successfully." });
  });
});
app.delete("/store/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM store WHERE id = $1", [id], (err, result) => {
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
    const selectQuery = `SELECT * FROM user_account WHERE email_address = $1`;
    const selectResult = await db.query(selectQuery, [email]);

    let userId;

    if (selectResult.rows.length === 0) {
      // Create new user
      const username = email.split("@")[0];
      const insertQuery = `
        INSERT INTO user_account (
          email_address,
          username,
          full_name,
          profile_picture,
          google_id,
          is_email_verified,
          account_status
        )
        VALUES ($1, $2, $3, $4, $5, true, 'active')
        RETURNING id
      `;
      const insertResult = await db.query(insertQuery, [
        email,
        username,
        name,
        picture,
        googleId,
      ]);
      userId = insertResult.rows[0].id;
    } else {
      // Update existing user's information
      userId = selectResult.rows[0].id;
      const updateQuery = `
        UPDATE user_account
        SET full_name = $1,
            profile_picture = $2,
            last_login = CURRENT_TIMESTAMP,
            is_email_verified = true
        WHERE id = $3
      `;
      await db.query(updateQuery, [name, picture, userId]);
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: userId, email, name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.json({
      Status: "Success",
      token: jwtToken,
      user: { id: userId, email, name, picture },
    });
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
    if (!password || password.length < 6) {
      return res.status(400).json({
        Status: "Error",
        Message: "Password must be at least 6 characters long",
      });
    }

    const hashedPassword = await bcrypt.hash(password, salt);

    const updateQuery = `
      UPDATE user_account
      SET password = $1
      WHERE id = $2
    `;
    await db.query(updateQuery, [hashedPassword, userId]);

    res.json({
      Status: "Success",
      Message: "Password set successfully",
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      Status: "Error",
      Message: "Server error occurred",
    });
  }
});

// Password login endpoint
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const selectQuery = `SELECT * FROM user_account WHERE email_address = $1`;
    const selectResult = await db.query(selectQuery, [email]);

    if (selectResult.rows.length === 0) {
      return res
        .status(401)
        .json({ Status: "Error", Message: "User not found" });
    }

    const user = selectResult.rows[0];

    if (!user.password) {
      return res.status(401).json({
        Status: "Error",
        Message: "Please use Google Sign-In or set a password first",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res
        .status(401)
        .json({ Status: "Error", Message: "Invalid password" });
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: user.id, email: user.email_address },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    // Update last login
    const updateLoginQuery = `UPDATE user_account SET last_login = CURRENT_TIMESTAMP WHERE id = $1`;
    await db.query(updateLoginQuery, [user.id]);

    res.json({
      Status: "Success",
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email_address,
        name: user.full_name,
        picture: user.profile_picture,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ Status: "Error", Message: "Server error occurred" });
  }
});


app.post("/api/validate-email", async (req, res) => {
  const { email } = req.body;
  const result = await validateEmail(email);

  if (!result.valid) {
    return res.status(400).json({ success: false, message: result.reason });
  }
  return res.json({ success: true, email: result.email });
});

app.post("/api/unity-capture", async (req, res) => {
  const { email, image } = req.body;

  // Guard: both fields required
  if (!email || !image) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Both email and image data are required.",
      });
  }

  // Validate domain (@cvsu.edu.ph) + DNS MX
  const emailCheck = await validateEmail(email);
  if (!emailCheck.valid) {
    return res.status(400).json({ success: false, message: emailCheck.reason });
  }

  // Process and send
  const message = await processPhotoRequest(emailCheck.email, image);
  const isSuccess = message.startsWith("Success");

  return res
    .status(isSuccess ? 200 : 500)
    .json({ success: isSuccess, message });
});

app.post("/send-captured-screen-image-of-virtual-try-on", async (req, res) => {
  const { email, image } = req.body;

  console.log("Request for email:", email);

  if (!email) {
    return res.status(400).send("Error: No email provided.");
  }

  const emailCheck = await validateEmail(email);
  if (!emailCheck.valid) {
    return res.status(400).send("Error: " + emailCheck.reason);
  }

  const message = await processPhotoRequest(emailCheck.email, image);
  res.send(message);
});