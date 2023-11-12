import { getConnection } from "../database/dbconfig.js";

const getAccountReceivable = async(req,res) => {
    let pool = await getConnection();
    let {recordset} = await pool.query(`
        select * from invoice.accountsReceivable
    `)
    let accountReceivable = recordset;

    res.json(accountReceivable);
}

const getInvoicesWithPendingBills = async (req,res) => {
  
    let pool = await getConnection();

    let customers = await pool.query(`
        select * from invoice.customers
    `);

    customers = customers.recordset;
    
    let customerAcounts = [];

    for(let customer of customers){
        
        let invoice = await pool.query(`
            select 
                a.idCustomer,
                a.nameCustomer,
                a.lastNameCustomer,
                b.documentId,
                b.amount,
                c.receivable
            from invoice.customers a
            left join invoice.accountsReceivable b
            on a.idCustomer = b.customerId
            left join (
            select 
                documentId,
                sum(amount) receivable
            from invoice.accountsReceivable
            group by documentId
            ) c
            on b.documentId = c.documentId
            where a.idCustomer = ${customer.idCustomer}
              and b.paymentTypeId = 1
              and b.accountStatus != 'Saldado'
        `)
        invoice = invoice.recordset;
        customer.invoices = invoice;
        customerAcounts.push(customer);

    }
    res.json(customerAcounts)
}

export {
    getAccountReceivable,
    getInvoicesWithPendingBills
}