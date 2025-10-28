const Receipt = require('../models/Receipt');
const Customer = require('../models/Customer');
const moment = require('moment');

exports.saveManualIncomes = async (req, res) => {
    // Expecting the same data from the frontend: [{ customerId, aamdanIncome, kulanIncome }]
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

            // --- Build the new game rows to be added ---
            const newGameRows = [];
            const timestamp = Date.now(); // Use a timestamp for a unique ID

            if (Number(aamdanIncome) > 0) {
                newGameRows.push({
                    id: timestamp,
                    type: 'आ.', // Set the type to 'आ.'
                    income: String(aamdanIncome) // Set the income amount
                });
            }

            if (Number(kulanIncome) > 0) {
                newGameRows.push({
                    id: timestamp + 1, // Add 1 to ensure uniqueness
                    type: 'कु.', // Set the type to 'कु.'
                    income: String(kulanIncome) // Set the income amount
                });
            }

            // If no income was entered for this customer, do nothing
            if (newGameRows.length === 0) {
                return null;
            }

            const totalNewIncome = (Number(aamdanIncome) || 0) + (Number(kulanIncome) || 0);

            // Find today's receipt for this customer
            const startOfDay = moment().startOf('day').toDate();
            const endOfDay = moment().endOf('day').toDate();
            const query = {
                customerId: customerId,
                date: { $gte: startOfDay, $lte: endOfDay }
            };

            // Define the update operation
            const update = {
                // The $push operator adds these new rows to the existing array
                $push: { gameRows: { $each: newGameRows } },
                // The $inc operator adds the new income to the receipt's totalIncome
                $inc: { totalIncome: totalNewIncome },
                // If a new document is created, set these default values
                $setOnInsert: {
                    vendorId: req.user.id, // Assuming 'protect' middleware adds user to req
                    customerName: customer.name,
                    businessName: "Bappa Gaming",
                    date: moment().toDate()
                }
            };

            // 💡 This is the "upsert" operation.
            // It will find and update the document, or create it if it doesn't exist.
            await Receipt.findOneAndUpdate(query, update, { upsert: true });
        });

        await Promise.all(promises);

        res.status(200).json({ message: "Incomes added successfully!" });

    } catch (error) {
        console.error("Error saving manual incomes:", error);
        res.status(500).json({ message: "Server error while saving incomes." });
    }
};