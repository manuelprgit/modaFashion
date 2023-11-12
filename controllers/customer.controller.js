import { getConnection } from "../database/dbconfig.js";

const getAllCustomers = async (req, res) => {
    let pool = await getConnection();
    let customers = await pool.query(`
        select 
        a.idCustomer,
        a.nameCustomer,
        a.lastNameCustomer,
        a.customerIdentification,
        a.creationDate,
        a.statusCustomer,
        b.receivable
        from invoice.customers a
        left join (
            select 
                customerId,
                sum(amount) receivable
            from invoice.accountsReceivable
            GROUP by customerId
        ) b
        on a.idCustomer = b.customerId
    `);
    res.json(customers.recordset);
}

const getCustomerById = async (req, res) => {
    const { customerId } = req.params;
    let pool = await getConnection();
    let customer = await pool.query(`select * from invoice.customers where idCustomer = ${customerId}`);
    res.json(customer.recordset[0]);
}

const createCustomer = async (req, res) => {
    console.log(req.body);
    const {
        nameCustomer,
        lastNameCustomer,
        customerIdentification,
        creationDate,
        statusCustomer,
    } = req.body;

    try {
        let pool = await getConnection();

        let newCustomer = await pool.query(`            
                            
                declare @insertedRecord table(
                    idCustomer int,
                    nameCustomer nvarchar(200),
                    customerIdentification nvarchar(20),
                    creationDate DATETIME,
                    statusCustomer int
                )
                insert into invoice.customers
                    (
                        nameCustomer,
                        lastNameCustomer,
                        customerIdentification,
                        creationDate,
                        statusCustomer
                    )
                OUTPUT
                        INSERTED.idCustomer,
                        inserted.nameCustomer,
                        inserted.customerIdentification,
                        inserted.creationDate,
                        inserted.statusCustomer
                    into @insertedRecord
                values
                    (
                        '${nameCustomer}',
                        '${lastNameCustomer}',
                        '${customerIdentification}',
                        '${creationDate}',
                        ${Number(statusCustomer)}
                )

                select * from @insertedRecord
            `);
                        console.log(newCustomer);
        newCustomer = newCustomer.recordset[0];

        res.status(201).json(newCustomer);

    } catch (error) {
        res.status(401).json({
            msg: error.message,
            error: 401
        })
    }

}

const updateCustomer = async (req, res) => {

    const {
        nameCustomer,
        lastNameCustomer,
        customerIdentification,
        statusCustomer,
    } = req.body;

    const { idCustomer } = req.params;

    try {
        let pool = await getConnection();

        await pool.query(`            
            update invoice.customers
            set 
                nameCustomer = '${nameCustomer}',
                lastNameCustomer = '${lastNameCustomer}',
                customerIdentification = '${customerIdentification}', 
                statusCustomer = '${statusCustomer}'
            where idCustomer = ${idCustomer}
        `);

        res.status(204).json({});

    } catch (error) {
        res.status(401).json({
            msg: error.message,
            error: 401
        })
    }

}

export {
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer
}