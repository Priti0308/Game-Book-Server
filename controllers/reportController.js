const Receipt = require('../models/Receipt');
const Customer = require('../models/Customer');
const moment = require('moment');

// This is a helper function used internally to calculate sums efficiently
const calculateSum = async (startDate, endDate) => {
    const result = await Receipt.aggregate([
        {
            $match: {
                date: {
                    $gte: startDate.toDate(),
                    $lte: endDate.toDate()
                }
            }
        },
        {
            $group: {
                _id: null,
                totalIncome: { $sum: '$totalIncome' }
            }
        }
    ]);
    return result.length > 0 ? result[0].totalIncome : 0;
};

// --- Route Handler Functions ---

// GET /api/reports/summary/daily
const getDailySummary = async (req, res) => {
    try {
        const todayStart = moment().startOf('day');
        const todayEnd = moment().endOf('day');
        const totalIncome = await calculateSum(todayStart, todayEnd);
        res.json({ totalIncome });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching daily summary', error: error.message });
    }
};

// GET /api/reports/summary/weekly
const getWeeklySummary = async (req, res) => {
    try {
        const weekStart = moment().startOf('week');
        const weekEnd = moment().endOf('week');
        const totalIncome = await calculateSum(weekStart, weekEnd);
        res.json({ totalIncome });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching weekly summary', error: error.message });
    }
};

// GET /api/reports/summary/monthly
const getMonthlySummary = async (req, res) => {
    try {
        const monthStart = moment().startOf('month');
        const monthEnd = moment().endOf('month');
        const totalIncome = await calculateSum(monthStart, monthEnd);
        res.json({ totalIncome });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching monthly summary', error: error.message });
    }
};

// GET /api/reports/customers/all-balances
// This function fetches each customer and their *final balance* from their most recent receipt.
const getAllCustomerBalances = async (req, res) => {
    try {
        // Get all customers as plain objects for easier modification
        const customers = await Customer.find({}).sort({ srNo: 1 }).lean();

        // For each customer, find their latest receipt to get the final balance
        const customersWithLatestBalance = await Promise.all(
            customers.map(async (customer) => {
                // Find the single most recent receipt for this customer
                const latestReceipt = await Receipt.findOne({ customerId: customer._id })
                    .sort({ date: -1, createdAt: -1 }); // Sort by date, then by creation time

                // Add the 'latestBalance' (antim total) to the customer object
                customer.latestBalance = latestReceipt ? latestReceipt.finalTotalAfterChuk : 0;
                
                return customer;
            })
        );

        res.json(customersWithLatestBalance);

    } catch (error) {
        console.error("Error fetching customer balances:", error);
        res.status(500).json({ message: 'Error fetching customer balances', error: error.message });
    }
};

// Export all functions in a single object
module.exports = {
    getDailySummary,
    getWeeklySummary,
    getMonthlySummary,
    getAllCustomerBalances
};