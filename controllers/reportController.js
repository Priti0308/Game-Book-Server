const Receipt = require('../models/Receipt');
const Customer = require('../models/Customer');
const moment = require('moment');
const mongoose = require('mongoose'); // 💡 Import Mongoose to use ObjectId

// Helper function updated to accept a vendorId
const calculateSum = async (startDate, endDate, vendorId) => {
    const result = await Receipt.aggregate([
        {
            $match: {
                // ✅ ADDED: Ensures summaries are only for the logged-in vendor
                vendorId: new mongoose.Types.ObjectId(vendorId), 
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
        // ✅ ADDED: Pass the logged-in user's ID to the helper function
        const totalIncome = await calculateSum(todayStart, todayEnd, req.user.id);
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
        // ✅ ADDED: Pass the logged-in user's ID
        const totalIncome = await calculateSum(weekStart, weekEnd, req.user.id);
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
        // ✅ ADDED: Pass the logged-in user's ID
        const totalIncome = await calculateSum(monthStart, monthEnd, req.user.id);
        res.json({ totalIncome });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching monthly summary', error: error.message });
    }
};

// GET /api/reports/customers/all-balances
const getAllCustomerBalances = async (req, res) => {
    try {
        // ✅ ADDED: Filter customers to only those owned by the logged-in vendor
        const customers = await Customer.find({ vendorId: req.user.id }).sort({ srNo: 1 }).lean();

        const customersWithLatestBalance = await Promise.all(
            customers.map(async (customer) => {
                // ✅ ADDED: Filter receipts by vendorId to get the correct latest balance
                const latestReceipt = await Receipt.findOne({ 
                    customerId: customer._id,
                    vendorId: req.user.id 
                })
                .sort({ date: -1, createdAt: -1 });

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

// Export all functions
module.exports = {
    getDailySummary,
    getWeeklySummary,
    getMonthlySummary,
    getAllCustomerBalances
};