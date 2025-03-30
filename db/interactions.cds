namespace app.interactions;

using {
    cuid,
    managed
} from '@sap/cds/common';

type TransactionType : String(10); // INCOME or EXPENSE

entity Transactions : cuid, managed {
    transactionID    : String(20);      
    transactionDate  : Date;            // Changed to Date type
    category         : String(50);      
    description      : String(1024);    
    amount           : Decimal(15, 2);  // Increased precision
    type             : TransactionType; 
}
