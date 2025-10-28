const Receipt = require('../models/Receipt');
const Customer = require('../models/Customer');
const moment = require('moment');

exports.saveManualIncomes = async (req, res) => {
    // ✅ FIX: Check for req.vendor, not req.user
    if (!req.vendor || !req.vendor.id) {
        return res.status(401).json({ message: "Not authorized, vendor data missing from token." });
    }

    const incomes = req.body;
    if (!Array.isArray(incomes) || incomes.length === 0) {
        return res.status(400).json({ message: "Invalid data format." });
    }

    try {
        const promises = incomes.map(async (entry) => {
            const { customerId, aamdanIncome, kulanIncome } = entry;
            const customer = await Customer.findById(customerId);

            if (!customer) {
                console.warn(`Customer not found for ID: ${customerId}. Skipping.`);
                return null;
            }

            const newGameRows = [];
            const timestamp = Date.now();

            if (Number(aamdanIncome) > 0) {
                newGameRows.push({ id: timestamp, type: 'आ.', income: String(aamdanIncome) });
            }
            if (Number(kulanIncome) > 0) {
                newGameRows.push({ id: timestamp + 1, type: 'कु.', income: String(kulanIncome) });
            }

            if (newGameRows.length === 0) return null;

            const totalNewIncome = (Number(aamdanIncome) || 0) + (Number(kulanIncome) || 0);
            
            const startOfDay = moment().startOf('day').toDate();
            const endOfDay = moment().endOf('day').toDate();
            const query = { customerId: customerId, date: { $gte: startOfDay, $lte: endOfDay } };

            const update = {
                $push: { gameRows: { $each: newGameRows } },
                $inc: { totalIncome: totalNewIncome },
                $setOnInsert: {
                    // ✅ FIX: Use req.vendor.id
                    vendorId: req.vendor.id, 
                    customerName: customer.name,
                    businessName: "Bappa Gaming",
                    date: moment().toDate()
                }
            };
            
            await Receipt.findOneAndUpdate(query, update, { upsert: true });
        });

        await Promise.all(promises);
        res.status(200).json({ message: "Incomes added successfully!" });

    } catch (error) {
        console.error("Error saving manual incomes:", error);
        res.status(500).json({ message: "Server error while saving incomes." });
    }
};