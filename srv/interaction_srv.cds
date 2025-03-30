using app.interactions from '../db/interactions';
using {sap} from '@sap/cds-common-content';

// service CatalogService {
//     @odata.draft.enabled: true
//     entity Transactions as projection on interactions.Transactions;

//     @readonly
//     entity Languages as projection on sap.common.Languages;
// }

service CatalogService @(path: '/catalog') {
    @readonly
    entity Transactions as projection on interactions.Transactions;

    // View for P&L Statement
    @readonly entity ProfitLossStatement {
        key year    : Integer;
        key month   : Integer;
        category    : String(50);
        amount     : Decimal(15, 2);
    }

    // Action to generate P&L
    action generatePL(year: Integer, month: Integer) returns array of ProfitLossStatement;
}