/**
 * PSYCHO E-SPORTS - BACKEND SERVER
 * Handles Cashfree Payments & Secure Firebase Wallet Updates
 * Run this on Node.js (e.g., Render, Railway, Heroku)
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const admin = require('firebase-admin');

// 1. Initialize Express App
const app = express();
app.use(cors()); // Allows your frontend HTML to talk to this backend
app.use(express.json()); // Parses incoming JSON data

// ==========================================
// CONFIGURATION VARIABLES
// ==========================================

// 2. Setup Firebase Admin SDK
// You must generate a "Service Account Key" from your Firebase Console
// (Project Settings -> Service Accounts -> Generate New Private Key)
// For local testing, save it as 'firebase-service-account.json' in the same folder.
try {
    const serviceAccount = require('./firebase-service-account.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://psycho-e-sports-default-rtdb.firebaseio.com"
    });
    console.log("✅ Firebase Admin Initialized Successfully");
} catch (error) {
    console.error("❌ Failed to initialize Firebase Admin. Missing service account JSON?");
}

const db = admin.firestore();

// 3. Cashfree API Credentials (Replace with your actual keys)
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || "YOUR_CASHFREE_APP_ID";
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || "YOUR_CASHFREE_SECRET_KEY";
const ENVIRONMENT = "SANDBOX"; // Change to "PRODUCTION" when going live

const CF_API_URL = ENVIRONMENT === "PRODUCTION" 
    ? "https://api.cashfree.com/pg" 
    : "https://sandbox.cashfree.com/pg";
const CF_API_VERSION = "2023-08-01"; // Cashfree API Version


// ==========================================
// API ENDPOINTS
// ==========================================

/**
 * ENDPOINT 1: Create Cashfree Order
 * Frontend calls this when the user clicks "Proceed to Pay"
 */
app.post('/createCashfreeOrder', async (req, res) => {
    try {
        const { amount, userId, email, phone } = req.body;

        if (!amount || !userId) {
            return res.status(400).json({ error: "Amount and UserId are required" });
        }

        // Generate a unique order ID
        const orderId = `ORDER_${userId}_${Date.now()}`;

        // Cashfree Order Payload
        const requestData = {
            order_id: orderId,
            order_amount: amount,
            order_currency: "INR",
            customer_details: {
                customer_id: userId,
                customer_email: email || "player@psychoesports.com",
                customer_phone: phone || "9999999999"
            },
            order_meta: {
                // You can add return URLs here if needed, but since you use the JS SDK modal, it's optional
                payment_methods: "cc,dc,ccc,ppc,nb,upi,paypal,app"
            }
        };

        // Call Cashfree API
        const response = await axios.post(`${CF_API_URL}/orders`, requestData, {
            headers: {
                "x-client-id": CASHFREE_APP_ID,
                "x-client-secret": CASHFREE_SECRET_KEY,
                "x-api-version": CF_API_VERSION,
                "Content-Type": "application/json"
            }
        });

        // Send payment_session_id back to frontend
        res.json({
            order_id: orderId,
            payment_session_id: response.data.payment_session_id
        });

    } catch (error) {
        console.error("Cashfree Order Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to create payment order" });
    }
});


/**
 * ENDPOINT 2: Verify Payment & Add Money to Firebase Wallet
 * Frontend calls this after the Cashfree modal closes successfully
 */
app.post('/verifyCashfreePayment', async (req, res) => {
    try {
        const { order_id, userId } = req.body;

        if (!order_id || !userId) {
            return res.status(400).json({ error: "Missing order_id or userId" });
        }

        // 1. Fetch Order Status directly from Cashfree (Security check)
        const response = await axios.get(`${CF_API_URL}/orders/${order_id}`, {
            headers: {
                "x-client-id": CASHFREE_APP_ID,
                "x-client-secret": CASHFREE_SECRET_KEY,
                "x-api-version": CF_API_VERSION
            }
        });

        const orderData = response.data;

        // 2. Check if payment was actually successful
        if (orderData.order_status !== "PAID") {
            return res.status(400).json({ error: "Payment was not successful", status: orderData.order_status });
        }

        // 3. Security: Check if this order_id has ALREADY been processed to prevent double-crediting
        const transactionRef = db.collection("users").doc(userId).collection("transactions").doc(order_id);
        const transactionSnap = await transactionRef.get();

        if (transactionSnap.exists) {
            return res.status(200).json({ message: "Payment already processed previously." });
        }

        // 4. Update Firebase Database securely (Batch Write)
        const depositAmount = orderData.order_amount;
        const batch = db.batch();

        const userRef = db.collection("users").doc(userId);
        
        // Add to Wallet Balance
        batch.update(userRef, {
            balance: admin.firestore.FieldValue.increment(depositAmount)
        });

        // Record the Transaction history
        batch.set(transactionRef, {
            amount: depositAmount,
            type: 'deposit',
            title: 'Wallet Top-up (Cashfree)',
            status: 'approved',
            order_id: order_id,
            date: admin.firestore.FieldValue.serverTimestamp()
        });

        await batch.commit();

        res.json({ success: true, message: "Wallet updated successfully!", amountAdded: depositAmount });

    } catch (error) {
        console.error("Verification Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Server failed to verify payment" });
    }
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Psycho E-Sports Backend running on port ${PORT}`);
});
