const Receipt = require('../models/Receipt');
const Customer = require('../models/Customer');
const moment = require('moment');

/**
 * A helper function to calculate both total income and total profit for a given period.
 * Profit is calculated as (totalIncome - totalPayment).
 * @param {Date} startDate - The start of the date range.
 * @param {Date} endDate - The end of the date range.
 * @param {String} vendorId - The ID of the logged-in vendor to scope the query.
 * @returns {Object} An object containing totalIncome and totalProfit.
 */
const calculateSummary = async (startDate, endDate, vendorId) => {
    const result = await Receipt.aggregate([
        {
            $match: {
                vendorId: vendorId,
                date: { $gte: startDate.toDate(), $lte: endDate.toDate() }
            }
        },
        {
            $group: {
                _id: null,
                totalIncome: { $sum: '$totalIncome' },
                // Use $ifNull to treat missing payment fields as 0
                totalPayment: { $sum: { $ifNull: ['$payment', 0] } } 
            }
        }
    ]);

    if (result.length === 0) {
        return { totalIncome: 0, totalProfit: 0 };
    }

    const totalIncome = result[0].totalIncome || 0;
    const totalPayment = result[0].totalPayment || 0;
    const totalProfit = totalIncome - totalPayment;

    return { totalIncome, totalProfit };
};

// --- Route Handler Functions ---

/**
 * GET /api/reports/summary/weekly
 * Calculates the total income and profit for the current week (Mon-Sun).
 */
const getWeeklySummary = async (req, res) => {
    if (!req.vendor || !req.vendor.id) {
        return res.status(401).json({ message: "Not authorized." });
    }
    try {
        const weekStart = moment().startOf('isoWeek');
        const weekEnd = moment().endOf('isoWeek');
        const summary = await calculateSummary(weekStart, weekEnd, req.vendor.id);
        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching weekly summary', error: error.message });
    }
};

/**
 * GET /api/reports/summary/monthly
 * Calculates the total income and profit for the current month.
 */
const getMonthlySummary = async (req, res) => {
    if (!req.vendor || !req.vendor.id) {
        return res.status(401).json({ message: "Not authorized." });
    }
    try {
        const monthStart = moment().startOf('month');
        const monthEnd = moment().endOf('month');
        const summary = await calculateSummary(monthStart, monthEnd, req.vendor.id);
        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching monthly summary', error: error.message });
    }
};

/**
 * GET /api/reports/summary/yearly
 * Calculates the total income and profit for the current year.
 */
const getYearlySummary = async (req, res) => {
    if (!req.vendor || !req.vendor.id) {
        return res.status(401).json({ message: "Not authorized." });
    }
    try {
        const yearStart = moment().startOf('year');
        const yearEnd = moment().endOf('year');
        const summary = await calculateSummary(yearStart, yearEnd, req.vendor.id);
        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching yearly summary', error: error.message });
    }
};

/**
 * GET /api/reports/customers/all-balances
 * Fetches all customers for the logged-in vendor and their final balance 
 * from their most recent receipt, AND their total advance amount.
 */
const getAllCustomerBalances = async (req, res) => {
    if (!req.vendor || !req.vendor.id) {
        return res.status(401).json({ message: "Not authorized." });
    }
    try {
        // Find customers belonging only to the logged-in vendor
        // .lean() fetches plain JS objects, which is faster and includes all model fields
        const customers = await Customer.find({ vendorId: req.vendor.id }).sort({ srNo: 1 }).lean();

        const customersWithLatestBalance = await Promise.all(
            customers.map(async (customer) => {
                // Find the latest receipt for this customer AND this vendor
                const latestReceipt = await Receipt.findOne({ 
                    customerId: customer._id,
                    vendorId: req.vendor.id 
                })
                .sort({ date: -1, createdAt: -1 });

                // Set the final balance (antim total)
                customer.latestBalance = latestReceipt ? latestReceipt.finalTotalAfterChuk : 0;
                
                // --- THIS IS THE FIX ---
                // The customer's current advance balance is the `finalTotal` 
                // (from the "आड" box) of their most recent receipt.
                customer.advanceAmount = latestReceipt ? latestReceipt.finalTotal : 0;
                // --- END FIX ---
                
                return customer;
            })
        );

        res.json(customersWithLatestBalance);

    } catch (error) {
        console.error("Error fetching customer balances:", error);
        res.status(500).json({ message: 'Error fetching customer balances', error: error.message });
    }
};

// Export all functions to be used in the routes file
module.exports = {
    getWeeklySummary,
    getMonthlySummary,
    getYearlySummary,
    getAllCustomerBalances
};