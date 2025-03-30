sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], function (Controller, JSONModel, MessageBox) {
    "use strict";

    return Controller.extend("financereport.controller.View1", {
        formatter: {
            formatDate: function(date) {
                return date ? new Date(date).toLocaleDateString() : "";
            },
            
            formatCurrency: function(amount) {
                return amount ? parseFloat(amount).toFixed(2) : "0.00";
            }
        },

        onInit: function () {
            const viewModel = new JSONModel({
                isMonthly: false,
                years: this._generateYears(),
                months: this._generateMonths()
            });
            this.getView().setModel(viewModel, "viewModel");
        },

        _generateYears: function() {
            const currentYear = new Date().getFullYear();
            const years = [];
            for (let i = 0; i < 5; i++) {
                years.push({
                    key: currentYear - i,
                    text: (currentYear - i).toString()
                });
            }
            return years;
        },

        _generateMonths: function() {
            const months = [
                'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
            ];
            return months.map((month, index) => ({
                key: index + 1,
                text: month
            }));
        },

        onReportTypeChange: function(oEvent) {
            const isMonthly = oEvent.getParameter("selectedIndex") === 1;
            this.getView().getModel("viewModel").setProperty("/isMonthly", isMonthly);
        },

        onGeneratePress: async function() {
            try {
                const viewModel = this.getView().getModel("viewModel");
                const selectedYear = this.byId("yearSelect").getSelectedKey();
                const selectedMonth = viewModel.getProperty("/isMonthly") ? 
                                    this.byId("monthSelect").getSelectedKey() : null;
        
                if (!selectedYear) {
                    MessageBox.error("Please select a year");
                    return;
                }
        
                if (viewModel.getProperty("/isMonthly") && !selectedMonth) {
                    MessageBox.error("Please select a month");
                    return;
                }
        
                // Get all transactions
                const oModel = this.getOwnerComponent().getModel();
                let filterStr = `year(transactionDate) eq ${selectedYear}`;
                if (selectedMonth) {
                    filterStr += ` and month(transactionDate) eq ${selectedMonth}`;
                }
        
                // Fetch transactions using OData V4
                const transactions = await oModel.bindList("/Transactions", null, null, null, {
                    $filter: filterStr
                }).requestContexts(0, 1000);  // Adjust the number based on your data size
        
                // Convert contexts to plain objects
                const data = transactions.map(context => context.getObject());
                
                // Check if data exists
                if (!data || data.length === 0) {
                    const period = selectedMonth ? 
                        `${this._generateMonths()[selectedMonth - 1].text} ${selectedYear}` : 
                        selectedYear;
                    
                    MessageBox.information(
                        `No transactions found for the selected period: ${period}`,
                        {
                            title: "No Data Available",
                            actions: [MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function() {
                            }
                        }
                    );
                    return;
                }

                // Generate and show P&L statement
                const plData = this._generatePLData(data, selectedYear, selectedMonth);
                this._showPLStatement(plData);
        
            } catch (error) {
                MessageBox.error("Error generating P&L statement: " + error.message);
            }
        },
        
        _generatePLData: function(transactions, year, month) {
            // Get month name function
            const getMonthName = (monthNum) => {
                const months = [
                    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
                ];
                return months[monthNum - 1];
            };
        
            // Group transactions by category
            const incomeTransactions = transactions.filter(t => t.type === 'INCOME');
            const expenseTransactions = transactions.filter(t => t.type === 'EXPENSE');
        
            // Calculate income by category
            const incomeByCategory = this._groupTransactionsByCategory(incomeTransactions);
            const expensesByCategory = this._groupTransactionsByCategory(expenseTransactions);
        
            // Calculate totals
            const totalIncome = Object.values(incomeByCategory).reduce((sum, amount) => sum + amount, 0);
            const totalExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + Math.abs(amount), 0);
        
            return {
                period: month ? `${getMonthName(month)} ${year}` : year.toString(),
                sections: [
                    {
                        title: "Revenue",
                        items: Object.entries(incomeByCategory).map(([category, amount]) => ({
                            description: category,
                            amount: amount
                        })),
                        total: totalIncome
                    },
                    {
                        title: "Expenses",
                        items: Object.entries(expensesByCategory).map(([category, amount]) => ({
                            description: category,
                            amount: Math.abs(amount)  // Make expenses positive for display
                        })),
                        total: totalExpenses
                    }
                ],
                netIncome: totalIncome - totalExpenses
            };
        },
        
        _groupTransactionsByCategory: function(transactions) {
            return transactions.reduce((groups, transaction) => {
                const category = transaction.category;
                if (!groups[category]) {
                    groups[category] = 0;
                }
                groups[category] += parseFloat(transaction.amount);
                return groups;
            }, {});
        },
        
        _showPLStatement: function(plData) {
            // Function to format currency in MYR (just changing the symbol)
            const formatMYR = (amount) => {
                return `RM ${Math.abs(amount).toFixed(2)}`;
            };
            
            const printWindow = window.open('', '_blank');
            
            const logoPath = sap.ui.require.toUrl("financereport/images/company-logo.png");
            
            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>PROFIT & LOSS STATEMENT - ${plData.period.toUpperCase()}</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 40px auto;
                            max-width: 800px;
                            padding: 20px;
                            background-color: #f5f5f5;
                        }
                        .container {
                            background-color: white;
                            padding: 40px;
                            border-radius: 8px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        }
                        .header { 
                            padding-bottom: 5px;
                            border-bottom: 3px double #333;
                            position: relative;
                        }
                        .header-line {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            padding: 0 15px;
                            position: relative;
                        }
                        .statement-title {
                            font-size: 14px;
                            font-weight: bold;
                            position: absolute;
                            left: 50%;
                            transform: translateX(-50%);
                        }
                        .period {
                            font-size: 12px;
                            margin-left: auto;
                            font-color: black;
                            font-weight: bold;
                        }
                        .section { 
                            margin-bottom: 30px;
                        }
                        .section-title { 
                            font-weight: bold; 
                            background-color: #f8f9fa;
                            padding: 10px 15px;
                            border-bottom: 2px solid #333;
                            font-size: 14px;
                            text-transform: uppercase;
                        }
                        .section-title, 
                        .item-description, 
                        .total-label,
                        .net-income span,
                        .item span:first-child {
                            text-transform: uppercase;
                        }
                        .item-description {
                            text-transform: capitalize;
                            font-size: 12px;
                        }
                        .total-label {
                            text-transform: uppercase;
                            font-size: 14px;
                        }
                        .item { 
                            margin: 0;
                            display: flex; 
                            justify-content: space-between; 
                            padding: 12px 15px;
                            border-bottom: 1px solid #eee;
                            font-size: 14px;
                        }
                        .item:hover {
                            background-color: #f8f9fa;
                        }
                        .total { 
                            font-weight: bold;
                            display: flex; 
                            justify-content: space-between;
                            padding: 15px;
                            background-color: #f8f9fa;
                            border-top: 2px solid #333;
                            margin-top: 10px;
                            font-size: 14px;
                        }
                        .amount { 
                            font-family: 'Courier New', monospace;
                            font-weight: bold;
                            font-size: 12px;
                        }
                        .net-income { 
                            font-size: 1.2em; 
                            font-weight: bold; 
                            border-top: 3px double #333;
                            padding: 20px 15px;
                            margin-top: 30px;
                            display: flex;
                            justify-content: space-between;
                            background-color: #f8f9fa;
                            font-size: 14px;
                        }
                        .net-income .amount {
                            color: ${plData.netIncome >= 0 ? '#27ae60' : '#c0392b'};
                        }
                        .total .amount,
                        .net-income .amount {
                            font-size: 14px;
                        }
                        .print-button {
                            display: block;
                            margin: 20px auto;
                            padding: 6px 16px;
                            background-color: #0854a0;
                            color: white;
                            border: 1px solid #0854a0;
                            border-radius: 0.25rem;
                            cursor: pointer;
                            font-size: 0.875rem;
                            font-family: "72","72full",Arial,Helvetica,sans-serif;
                            line-height: 1.42857;
                            text-align: center;
                            text-shadow: none;
                            box-shadow: 0 0 0 0.0625rem transparent;
                            transition: all 0.125s ease-in;
                            min-width: 80px;
                            height: 32px;
                            text-transform: uppercase;
                            font-weight: normal;
                        }
                        .print-button:hover {
                            background-color: #0a6ed1;
                            border-color: #0a6ed1;
                            box-shadow: 0 0 0 0.0625rem transparent;
                        }
                        .print-button:active {
                            background-color: #0854a0;
                            border-color: #0854a0;
                            color: #ffffff;
                        }
                        .print-button:focus {
                            outline: none;
                            box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #0854a0;
                        }
                        .company-info {
                            text-align: center;
                            margin-bottom: 20px;
                            color: #7f8c8d;
                        }
                        .letterhead {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-start;
                            margin-bottom: 30px;
                            padding-bottom: 20px;
                        }
                        .company-logo {
                            width: 200px;
                        }
                        .company-details {
                            text-align: left;
                            font-size: 10px;
                            line-height: 1.5;
                            flex: 0 0 auto;
                        }
                        .company-name {
                            font-weight: bold;
                            font-size: 12px;
                            margin-bottom: 5px;
                        }
                        .company-logo {
                            width: 200px;
                            height: auto;
                            object-fit: contain;
                        }
                        .logo-section {
                            flex: 0 0 auto;
                        }
                        @media print {
                            body {
                                margin: 0;
                                background-color: white;
                            }
                            .container {
                                box-shadow: none;
                                padding: 0;
                            }
                            .no-print { 
                                display: none; 
                            }
                            .section-title {
                                background-color: white;
                                border-bottom-color: black;
                            }
                            .total, .net-income {
                                background-color: white;
                                border-color: black;
                            }
                        }
                    </style>
                </head>
                <body>
            <div class="container">
                <div class="letterhead">
                    <div class="logo-section">
                        <img src="${logoPath}" alt="Company Logo" class="company-logo">
                    </div>
                    <div class="company-details">
                        <div class="company-name">AK MAJU RESOURCES SDN. BHD.</div>
                        <div>No. 39 & 41 Jalan Utama 3/2, Pusat Komersial Sri Utama,</div>
                        <div>Segamat, Johor, Malaysia- 85000</div>
                        <div>07-9310717 , 010-2218224</div>
                        <div>akmaju.acc@gmail.com</div>
                        <div>Company No.: <span style="margin-left: 20px;">1088436 K</span></div>
                    </div>
                </div>

                <div class="header">
                    <div class="header-line">
                        <span class="statement-title">PROFIT & LOSS STATEMENT</span>
                        <span class="period">PERIOD: ${plData.period.toUpperCase()}</span>
                    </div>
                </div>

                ${plData.sections.map(section => `
                    <div class="section">
                        <div class="section-title">${section.title.toUpperCase()}</div>
                        ${section.items.map(item => `
                            <div class="item">
                                <span class="item-description">${item.description.toUpperCase()}</span>
                                <span class="amount">${formatMYR(item.amount)}</span>
                            </div>
                        `).join('')}
                        <div class="total">
                            <span class="total-label">TOTAL ${section.title.toUpperCase()}</span>
                            <span class="amount">${formatMYR(section.total)}</span>
                        </div>
                    </div>
                `).join('')}
                <div class="net-income">
                    <span>NET PROFIT</span>
                    <span class="amount">${formatMYR(plData.netIncome)}</span>
                </div>
                <button class="print-button no-print" onclick="window.print()">PRINT</button>
            </div>
        </body>
                </html>
            `;
            
            printWindow.document.write(html);
            printWindow.document.close();
        }
    });
});