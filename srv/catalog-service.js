const cds = require('@sap/cds')

module.exports = cds.service.impl(async function() {
    const { Transactions } = this.entities

    this.on('READ', 'Transactions', async (req) => {
        return await SELECT.from(Transactions)
    })
    
    this.on('generatePL', async (req) => {
        const { year, month } = req.data
        
        let query = SELECT.from(Transactions)
        
        if (month) {
            // Monthly P&L
            query.where(`YEAR(transactionDate) =`, year, 
                       `and MONTH(transactionDate) =`, month)
        } else {
            // Yearly P&L
            query.where(`YEAR(transactionDate) =`, year)
        }

        const transactions = await query

        // Group and calculate P&L
        const plStatement = calculatePL(transactions)
        return plStatement
    })
})

function calculatePL(transactions) {
    // Group transactions by category and calculate totals
    const grouped = {}
    transactions.forEach(tx => {
        if (!grouped[tx.category]) {
            grouped[tx.category] = 0
        }
        grouped[tx.category] += tx.type === 'CREDIT' ? tx.amount : -tx.amount
    })

    // Convert to array format
    return Object.entries(grouped).map(([category, amount]) => ({
        category,
        amount
    }))
}