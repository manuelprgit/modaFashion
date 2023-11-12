import { getConnection } from "../database/dbconfig.js";

const getAccountReceivable = async (req, res) => {
    let pool = await getConnection();
    let { recordset } = await pool.query(`
        select * from invoice.accountsReceivable
    `)
    let accountReceivable = recordset;

    res.json(accountReceivable);
}

const getInvoicesWithPendingBills = async (req, res) => {

    let customerId = req.params.customerId;

    let pool = await getConnection();

    let customer = await pool.query(`
        select * from invoice.customers
        where idCustomer = ${customerId}
    `);
    if (customer.recordset.length <= 0) {
        res.status(400).json({
            msg: 'El cliente no existe',
            status: 400
        });
        return
    }
    customer = customer.recordset[0];

    let invoice = await pool.query(`
        select 
            b.documentId,
            b.paymentDate date,
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
        where a.idCustomer = ${customerId}
            and b.paymentTypeId = 1
            and b.accountStatus != 'Saldado'
        `)
    invoice = invoice.recordset;
    customer['invoices'] = invoice

    res.json(customer)
}

export {
    getAccountReceivable,
    getInvoicesWithPendingBills
}