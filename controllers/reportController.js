const Receipt = require('../models/Receipt');
const Customer = require('../models/Customer');
const moment = require('moment');

// Helper function remains the same
const calculateSum = async (startDate, endDate, vendorId) => {
    const result = await Receipt.aggregate([
        {
            $match: {
                vendorId: vendorId, 
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

const getDailySummary = async (req, res) => {
    // ✅ FIX: Check for req.vendor instead of req.user
    if (!req.vendor || !req.vendor.id) {
        return res.status(401).json({ message: "Not authorized, vendor data missing from token." });
    }
    try {
        const todayStart = moment().startOf('day');
        const todayEnd = moment().endOf('day');
        // ✅ FIX: Use req.vendor.id
        const totalIncome = await calculateSum(todayStart, todayEnd, req.vendor.id);
        res.json({ totalIncome });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching daily summary', error: error.message });
    }
};

const getWeeklySummary = async (req, res) => {
    if (!req.vendor || !req.vendor.id) {
        return res.status(401).json({ message: "Not authorized, vendor data missing from token." });
    }
    try {
        const weekStart = moment().startOf('week');
        const weekEnd = moment().endOf('week');
        // ✅ FIX: Use req.vendor.id
        const totalIncome = await calculateSum(weekStart, weekEnd, req.vendor.id);
        res.json({ totalIncome });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching weekly summary', error: error.message });
    }
};

const getMonthlySummary = async (req, res) => {
    if (!req.vendor || !req.vendor.id) {
        return res.status(401).json({ message: "Not authorized, vendor data missing from token." });
    }
    try {
        const monthStart = moment().startOf('month');
        const monthEnd = moment().endOf('month');
        // ✅ FIX: Use req.vendor.id
        const totalIncome = await calculateSum(monthStart, monthEnd, req.vendor.id);
        res.json({ totalIncome });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching monthly summary', error: error.message });
    }
};

const getAllCustomerBalances = async (req, res) => {
    if (!req.vendor || !req.vendor.id) {
        return res.status(401).json({ message: "Not authorized, vendor data missing from token." });
    }
    try {
        // ✅ FIX: Filter customers by req.vendor.id
        const customers = await Customer.find({ vendorId: req.vendor.id }).sort({ srNo: 1 }).lean();

        const customersWithLatestBalance = await Promise.all(
            customers.map(async (customer) => {
                // ✅ FIX: Filter receipts by req.vendor.id
                const latestReceipt = await Receipt.findOne({ 
                    customerId: customer._id,
                    vendorId: req.vendor.id 
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

module.exports = {
    getDailySummary,
    getWeeklySummary,
    getMonthlySummary,
    getAllCustomerBalances
};