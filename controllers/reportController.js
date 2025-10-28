const Receipt = require('../models/Receipt');
const Customer = require('../models/Customer');
const moment = require('moment');

// Helper function updated to be safer
const calculateSum = async (startDate, endDate, vendorId) => {
    const result = await Receipt.aggregate([
        {
            $match: {
                // ✅ FIX: Let Mongoose handle the ObjectId conversion safely.
                // This prevents crashes if vendorId is in a weird format.
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
    // ✅ FIX: Added a safety check for the user
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Not authorized, user data missing from token." });
    }
    try {
        const todayStart = moment().startOf('day');
        const todayEnd = moment().endOf('day');
        const totalIncome = await calculateSum(todayStart, todayEnd, req.user.id);
        res.json({ totalIncome });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching daily summary', error: error.message });
    }
};

const getWeeklySummary = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Not authorized, user data missing from token." });
    }
    try {
        const weekStart = moment().startOf('week');
        const weekEnd = moment().endOf('week');
        const totalIncome = await calculateSum(weekStart, weekEnd, req.user.id);
        res.json({ totalIncome });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching weekly summary', error: error.message });
    }
};

const getMonthlySummary = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Not authorized, user data missing from token." });
    }
    try {
        const monthStart = moment().startOf('month');
        const monthEnd = moment().endOf('month');
        const totalIncome = await calculateSum(monthStart, monthEnd, req.user.id);
        res.json({ totalIncome });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching monthly summary', error: error.message });
    }
};

const getAllCustomerBalances = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Not authorized, user data missing from token." });
    }
    try {
        const customers = await Customer.find({ vendorId: req.user.id }).sort({ srNo: 1 }).lean();

        const customersWithLatestBalance = await Promise.all(
            customers.map(async (customer) => {
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

module.exports = {
    getDailySummary,
    getWeeklySummary,
    getMonthlySummary,
    getAllCustomerBalances
};