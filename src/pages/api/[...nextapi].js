import mysql from 'mysql2/promise';
import { parse } from 'url';
import { sign, verify } from 'jsonwebtoken';
import { authMiddleware } from '../../utils/authMiddleware';
import bcrypt from 'bcrypt';

const db = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default async function handler(req, res) {
  const { method } = req;
  const { pathname } = parse(req.url, true);

  try {
    switch (method) {
      case 'GET':
        if (pathname === '/api/check-auth') {
          return handleCheckAuth(req, res);
        } else if (pathname === '/api/acustomer') {
          return authMiddleware(handleGetCustomers)(req, res);
        } else if (pathname === '/api/lechon-products') {
          return handleGetLechonProducts(req, res);
        } else if (pathname === '/api/viands-products') { 
          return handleGetViandsProducts(req, res);
        } else if (pathname === '/api/aproduct-prices') { 
          return handleGetProductPrices(req, res);
        } else if (pathname === '/api/orders') {
          return authMiddleware(handleGetOrders)(req, res);
        }  else if (pathname === '/api/profile') {
          return authMiddleware(handleGetProfile)(req, res);
        }
        
        break;     

      case 'POST':
        if (pathname === '/api/login') {
          return handleLogIn(req, res);
        } else if (pathname === '/api/validate-pin') {
          return handleValidatePin(req, res);
        } else if (pathname === '/api/logout') {
          return handleLogout(req, res);
        } else if (pathname === '/api/acustomer') {
          return authMiddleware(handleAddCustomer)(req, res);
        } else if (pathname === '/api/orders') {
          return authMiddleware(handleGetOrders)(req, res);
        } else if (pathname === '/api/signup') {
          return handlePostSignup(req, res);
        }
        break;

      case 'PUT':
        if (pathname.startsWith('/api/aproduct/')) {
          const id = pathname.split('/').pop();
          return authMiddleware(handleUpdateProduct)(req, res, id);
        } else if (pathname.startsWith('/api/acustomer/')) {
          const customerId = pathname.split('/').pop();
          return authMiddleware(handleUpdateCustomer)(req, res, customerId);
        } else if (pathname === '/api/orders') {
          return authMiddleware(handleAddOrder)(req, res);
        } else if (pathname === '/api/profile') {
          return authMiddleware(handleUpdateProfile)(req, res);
        }
        break;

      case 'DELETE':
        if (pathname.startsWith('/api/aproduct/')) {
          const id = pathname.split('/').pop();
          return authMiddleware(handleDeleteProduct)(req, res, id);
        } else if (pathname.startsWith('/api/acustomer/')) {
          const customerId = pathname.split('/').pop();
          return authMiddleware(handleDeleteCustomer)(req, res, customerId);
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
}

// Function to generate tracking number
function generateTrackingNumber() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TRK${timestamp}${random}`;
}

// Placing an Order
async function handleAddOrder(req, res) {
  const connection = await db.getConnection();
  try {
    console.log('Received order data:', req.body); // Add this line
    console.log('Items:', req.body.items); // Add this line

    const {
      customerid,
      items,
      total_amount,
      payment_method,
      delivery_address
    } = req.body;

    const total_quantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const tracking_number = generateTrackingNumber();

    // Insert main order
    const [orderResult] = await connection.query(
      `INSERT INTO orders (
        tracking_number, 
        customerid, 
        quantity,
        total_amount, 
        payment_method, 
        delivery_address,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        tracking_number,
        customerid,
        total_quantity,
        total_amount,
        payment_method,
        delivery_address,
        'Order Placed'
      ]
    );

    const orderId = orderResult.insertId;

    // Insert order items with separate handling for lechon and viands
    for (const item of items) {
      let currentQuantity;
      let result;

      // Check product type and get current quantity
      if (item.productType === 'lechon') {
        [result] = await connection.query(
          'SELECT quantity FROM aproducts_lechon WHERE productlechon_id = ?',
          [item.priceid]
        );
        currentQuantity = result[0]?.quantity || 0;

        // Check if enough quantity available
        if (currentQuantity < item.quantity) {
          throw new Error(`Insufficient quantity for lechon product ID ${item.priceid}`);
        }

        // Insert order item with lechon ID (productviands_id will be NULL)
        await connection.query(
          `INSERT INTO order_items (
            orderid,
            product_type,
            productlechon_id,
            productviands_id,
            quantity,
            price_at_time
          ) VALUES (?, ?, ?, NULL, ?, ?)`,
          [orderId, 'lechon', item.priceid, item.quantity, item.price]
        );

        // Update lechon product quantity
        await connection.query(
          'UPDATE aproducts_lechon SET quantity = quantity - ? WHERE productlechon_id = ?',
          [item.quantity, item.priceid]
        );

      } else if (item.productType === 'viands') {
        // Handle viands products
        [result] = await connection.query(
          'SELECT quantity FROM aproducts_viands WHERE productviands_id = ?',
          [item.priceid]
        );
        currentQuantity = result[0]?.quantity || 0;

        // Check if enough quantity available
        if (currentQuantity < item.quantity) {
          throw new Error(`Insufficient quantity for viands product ID ${item.priceid}`);
        }

        // Insert order item with viands ID (productlechon_id will be NULL)
        await connection.query(
          `INSERT INTO order_items (
            orderid,
            product_type,
            productlechon_id,
            productviands_id,
            quantity,
            price_at_time
          ) VALUES (?, ?, NULL, ?, ?, ?)`,
          [orderId, 'viands', item.priceid, item.quantity, item.price]
        );

        // Update viands product quantity
        await connection.query(
          'UPDATE aproducts_viands SET quantity = quantity - ? WHERE productviands_id = ?',
          [item.quantity, item.priceid]
        );
      }
    }

    await connection.commit();
    res.status(200).json({ 
      success: true, 
      orderids: [orderId],
      tracking_number 
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error adding order:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
}



//Lechon
async function handleGetLechonProducts(req, res) {
  try {
    const [products] = await db.query(`
      SELECT 
        productlechon_id,
        type,
        weight,
        description,
        image_url,
        price,
        quantity,
        deleted
      FROM aproducts_lechon 
      WHERE deleted = 0
    `);
    
    // Group products by type (Lechon Belly or Lechon Baboy)
    const formattedProducts = products.map(product => ({
      productid: product.productlechon_id,
      name: product.type,
      weight: product.weight,
      description: product.description,
      imageUrl: product.image_url,
      price: parseFloat(product.price),
      quantity: product.quantity
    }));

    console.log('Fetched lechon products:', formattedProducts);
    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error('Error fetching lechon products:', error);
    res.status(500).json({ error: 'Error fetching lechon products' });
  }
}



//Viands
async function handleGetViandsProducts(req, res) {
  try {
    const [products] = await db.query(`
      SELECT 
        productviands_id,
        name,
        description,
        image_url,
        serves,
        quantity,
        price,
        deleted
      FROM aproducts_viands 
      WHERE deleted = 0
    `);
    
    const formattedProducts = products.map(product => ({
      id: product.productviands_id,
      name: product.name,
      price: parseFloat(product.price),
      imageSrc: product.image_url,
      description: product.description,
      servings: product.serves,
      quantity: product.quantity
    }));

    console.log('Fetched viands products:', formattedProducts);
    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error('Error fetching viands products:', error);
    res.status(500).json({ error: 'Error fetching viands products' });
  }
}




//Login Signup 
async function handlePostSignup(req, res) {
  const { fullname, address, contactnumber, emailaddress, password } = req.body;

  if (!fullname || !contactnumber || !emailaddress || !password) {
    return res.status(400).json({ 
      error: 'All fields are required',
      missing: {
        fullname: !fullname,
        address: !address,
        contactnumber: !contactnumber,
        emailaddress: !emailaddress,
        password: !password
      }
    });
  }

  try {
    // Check if the user already exists
    const [existingUser] = await db.query(
      'SELECT * FROM acustomer WHERE emailaddress = ?', 
      [emailaddress]
    );
    
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await db.query(
      'INSERT INTO acustomer (fullname, address, contactnumber, emailaddress, password) VALUES (?, ?, ?, ?, ?)',
      [fullname,address, contactnumber, emailaddress, hashedPassword]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Signup successful', 
      userId: result.insertId 
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: 'An error occurred while creating the user' });
  }
}


async function handleLogIn(req, res) {
  const { emailaddress, password } = req.body;

  try {
    if (!emailaddress || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [result] = await db.query(
      'SELECT * FROM acustomer WHERE emailaddress = ?', 
      [emailaddress]
    );

    // Check if user exists and password matches
    if (result.length === 0 || !(await bcrypt.compare(password, result[0].password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result[0];
    
    const token = sign(
      { 
        userId: user.id, 
        customerid: user.customerid, 
        email: user.emailaddress, 
        role: user.role 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '5h' }
    );

    res.setHeader(
      'Set-Cookie', 
      `token=${token}; HttpOnly; Path=/; Max-Age=18000; SameSite=Strict`
    );

    // Send success response
    res.status(200).json({ 
      success: true, 
      message: 'Login successful',
      customerid: user.customerid, 
      user: {
        emailaddress: user.emailaddress,
        fullname: user.fullname,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
}

async function handleCheckAuth(req, res) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(200).json({ isAuthenticated: false });
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    
    // Fetch customer address from database
    const [customerResult] = await db.query(
      'SELECT address FROM acustomer WHERE customerid = ?',
      [decoded.customerid]
    );

    return res.status(200).json({ 
      isAuthenticated: true,
      customerid: decoded.customerid,
      customerAddress: customerResult[0]?.address || ''
    });
  } catch (error) {
    return res.status(200).json({ isAuthenticated: false });
  }
}


// Logout
async function handleLogout(req, res) {
  try {
    // Clear the authentication cookie
    res.setHeader(
      'Set-Cookie',
      'token=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict'
    );

    // Send success response
    res.status(200).json({ success: true, message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'An error occurred during logout' });
  }
}


   




//Profile
async function handleGetProfile(req, res) {
  try {
    const token = req.cookies.token;
    const decoded = verify(token, process.env.JWT_SECRET);
    
    const [result] = await db.query(
      'SELECT customerid, fullname, emailaddress, address, contactnumber FROM acustomer WHERE customerid = ?',
      [decoded.customerid]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json(result[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'An error occurred while fetching profile' });
  }
}

async function handleUpdateProfile(req, res) {
  try {
    const token = req.cookies.token;
    const decoded = verify(token, process.env.JWT_SECRET);
    const { fullname, emailaddress, address, contactnumber, password } = req.body;

    let updateQuery = 'UPDATE acustomer SET fullname = ?, emailaddress = ?, address = ?, contactnumber = ?';
    let queryParams = [fullname, emailaddress, address, contactnumber];

    // If password is provided, hash it and add to update
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password = ?';
      queryParams.push(hashedPassword);
    }

    updateQuery += ' WHERE customerid = ?';
    queryParams.push(decoded.customerid);

    await db.query(updateQuery, queryParams);

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'An error occurred while updating profile' });
  }
}

















// Order Tracking Order Record
async function handleGetOrders(req, res) {
  const connection = await db.getConnection();
  try {
    // Get customer ID from authenticated session
    const token = req.cookies.token;
    const decoded = verify(token, process.env.JWT_SECRET);
    const customerid = decoded.customerid;

    // Get all orders for the customer with their items
    const [orders] = await connection.query(
      `SELECT 
        o.orderid,
        o.tracking_number,
        o.date,
        o.total_amount,
        o.status,
        o.payment_method,
        o.delivery_address,
        c.fullname,
        c.emailaddress,
        c.contactNumber
      FROM orders o
      JOIN acustomer c ON o.customerid = c.customerid
      WHERE o.customerid = ? AND o.deleted = 0
      ORDER BY o.date DESC`,
      [customerid]
    );

    // For each order, get its items
    for (const order of orders) {
      // Get items for this order
      const [items] = await connection.query(
        `SELECT 
          oi.quantity,
          oi.price_at_time,
          oi.product_type,
          CASE
            WHEN oi.product_type = 'lechon' THEN pl.type
            WHEN oi.product_type = 'viands' THEN pv.name
          END as name,
          CASE
            WHEN oi.product_type = 'lechon' THEN pl.weight
            ELSE NULL
          END as weight,
          CASE
            WHEN oi.product_type = 'lechon' THEN pl.image_url
            WHEN oi.product_type = 'viands' THEN pv.image_url
          END as imageUrl
        FROM order_items oi
        LEFT JOIN aproducts_lechon pl ON oi.productlechon_id = pl.productlechon_id
        LEFT JOIN aproducts_viands pv ON oi.productviands_id = pv.productviands_id
        WHERE oi.orderid = ?`,
        [order.orderid]
      );

      order.items = items;
    }

    res.status(200).json(orders);

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  } finally {
    connection.release();
  }
}

// Other functions (handleGetCustomers, handleAddOrder, etc.) would go here


