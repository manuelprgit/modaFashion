import { getConnection } from "../database/dbconfig.js";

const getSuppliers = async (req, res) => {
    let pool = await getConnection();
    let customers = await pool.query('select * from purchase.suppliers');
    res.json(customers.recordset);
}

const getSupplierById = async (req, res) => {
    const { supplierId } = req.params;
    let pool = await getConnection();
    let customer = await pool.query(`select * from invoice.customers where supplierId = ${supplierId}`);
    res.json(customer.recordset[0]);
}

const createSupplier = async (req, res) => {
    console.log(req.body);
    const {
        supplierName,
        supplierLastName,
        supplierCompanyName,
        supplierAddress,
        supplierRNC,
        supplierPhoneNumber,
        supplierCreationDate,
        supplierCompanyPhone
    } = req.body;

    try {
        let pool = await getConnection();

        let newSupplier = await pool.query(`            
                            
                declare @insertedRecord table(

                    supplierId int,
                    supplierName nvarchar(200),
                    supplierLastName nvarchar(200),
                    supplierCompanyName nvarchar(200),
                    supplierAddress nvarchar(200),
                    supplierRNC nvarchar(200),
                    supplierPhoneNumber nvarchar(200),
                    supplierCreationDate datetime,
                    supplierCompanyPhone nvarchar(200)

                )
                insert into purchase.suppliers
                    (
                    supplierName,
                    supplierLastName,
                    supplierCompanyName,
                    supplierAddress,
                    supplierRNC,
                    supplierPhoneNumber,
                    supplierCreationDate,
                    supplierCompanyPhone
                    )
                OUTPUT
                    inserted.supplierId,
                    INSERTED.supplierName,
                    inserted.supplierLastName,
                    inserted.supplierCompanyName,
                    inserted.supplierAddress,
                    inserted.supplierRNC,
                    inserted.supplierPhoneNumber,
                    inserted.supplierCreationDate,
                    inserted.supplierCompanyPhone
                into @insertedRecord
                values
                    (
                        '${supplierName}',
                        '${supplierLastName}',
                        '${supplierCompanyName}',
                        '${supplierAddress}',
                        '${supplierRNC}',
                        '${supplierPhoneNumber}',
                         ${supplierCreationDate},
                        '${supplierCompanyPhone}'
                )

                select *
                from @insertedRecord
            `);
         newSupplier = newSupplier.recordset[0];

        res.status(201).json(newSupplier);

    } catch (error) {
        res.status(401).json({
            msg: error.message,
            error: 401
        })
    }

}

const updateSupplier = async (req, res) => {

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
    getSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier
}