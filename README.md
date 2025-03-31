# 📊 Finance Module - Generate Finance Report
The **Finance Module - Generate Finance Report** is an application designed to generate financial reports using SAP technologies. It efficiently processes financial data and generates detailed Profit & Loss statements.
<br><br>

### ✨ Features
- **Financial Data Processing**: Handles and processes financial data for report generation.
- **Report Generation**: Generates Profit & Loss statements with detailed sections for revenue and expenses.
- **User Interface**: Provides a user-friendly interface using SAP UI5.
- **Integration with SAP**: Utilizes OData V4 for data retrieval.
<br>

### 🎥 Demo Video
Watch the demo video [here](https://youtu.be/IHi75hkBXgY).
<p align="center">
    <a href="https://youtu.be/IHi75hkBXgY">
        <img src="https://img.youtube.com/vi/IHi75hkBXgY/0.jpg" alt="Watch the video" width="400"/>
    </a>
</p>
<br>

### 🛠️ Technical Overview
- **SAP UI5**: Frontend framework for building the user interface.
- **OData V4**: Used for fetching transaction data.
- **JavaScript**: Core logic for data processing and report generation.
<br>

### 📁 Key Files
- **View1.controller.js**: Main controller handling the logic for generating financial reports.
- **View1.view.xml**: Defines the UI layout, including report options and transaction list.
- **app.interactions.Transactions.csv**: Contains sample transaction data for testing and demonstration.
<br>

### 📊 Sample Data
The application uses sample transaction data, including:
- **Transaction Types**: INCOME and EXPENSE
- **Categories**: Sales Revenue, Cost of Goods, Operating Expense, Marketing, Other Income
- **Sample Transactions**: 
  - Product Sales
  - Raw Materials
  - Office Rent
  - Service Income
  - Advertising
<br>

### 🚀 Getting Started
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   ```
2. **Navigate to the Project Directory**:
   ```bash
   cd <your-project-directory>
   ```
   *Note: Replace `<your-project-directory>` with the actual name of your project directory. For example, if your directory is named `MyHANAApp`, use `cd MyHANAApp`.*
   
4. **Install Dependencies**:
   ```bash
   npm install
   ```
5. **Run the Application**:
   ```bash
   cds watch
   ```
Replace `<repository-url>` with your actual repository URL and `<your-project-directory>` with the actual name of your project directory.
<br>
