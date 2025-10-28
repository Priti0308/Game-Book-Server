const Receipt = require('../models/Receipt');
const Customer = require('../models/Customer');
const moment = require('moment');

exports.saveManualIncomes = async (req, res) => {
    if (!req.vendor || !req.vendor.id) {
        return res.status(401).json({ message: "Not authorized, vendor data missing from token." });
    }

    const incomes = req.body;
    if (!Array.isArray(incomes) || !incomes.length) {
        return res.status(400).json({ message: "Invalid data format." });
    }

    try {
        const promises = incomes.map(async (entry) => {
            const { customerId, aamdanIncome, kulanIncome } = entry;
            const customer = await Customer.findById(customerId);

            if (!customer) return null;

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

            // ✅ FIX: Calculate all the dependent financial changes
            const deductionChange = totalNewIncome * 0.1; // Assuming 10% deduction
            const afterDeductionChange = totalNewIncome - deductionChange;

            const startOfDay = moment().startOf('day').toDate();
            const endOfDay = moment().endOf('day').toDate();
            const query = { customerId: customerId, date: { $gte: startOfDay, $lte: endOfDay } };

            const update = {
                $push: { gameRows: { $each: newGameRows } },
                // ✅ FIX: Use $inc to update all financial fields, not just totalIncome
                $inc: {
                    totalIncome: totalNewIncome,
                    deduction: deductionChange,
                    afterDeduction: afterDeductionChange,
                    remainingBalance: afterDeductionChange, // Assuming no payment
                    totalDue: afterDeductionChange,
                    jamaTotal: afterDeductionChange,
                    finalTotalAfterChuk: afterDeductionChange, // This is the key field for the reports page
                },
                $setOnInsert: {
                    vendorId: req.vendor.id,
                    customerName: customer.name,
                    businessName: "Default Business",
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