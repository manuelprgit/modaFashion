import { getConnection } from "../database/dbconfig.js";

const getAllSalesman = async (req, res) => {
    let pool = await getConnection();
    let { recordset } = await pool.query('select * from invoice.seller');
    console.log(recordset);
    res.json(recordset);
}

const getSellerById = async (req, res) => {
    const { idSeller } = req.params;
    let pool = await getConnection();
    let customer = await pool.query(`select * from invoice.seller where idSeller = ${idSeller}`);
    res.json(customer.recordset[0]);
}

const createSalesman = async (req, res) => {
    console.log(req.body);
    const {
        sellerName,
        sellerLastName,
        userName,
        password,
        phoneNumber,
        sellerIdentification,
        creationDate,
        sellerStatus,
        cellPhone
    } = req.body;

    try {
        let pool = await getConnection();

        let newSeller = await pool.query(`            
                            
            declare @insertedRecord table(
                idSeller int,
                nameSeller nvarchar(200),
                lastName nvarchar(200),
                userName NVARCHAR(100),
                password NVARCHAR(100),
                phoneNumber NVARCHAR(20),
                cellPhone nvarchar(50),
                sellerIdentification nvarchar(20),
                creationDate DATETIME,
                statusSeller int
            )
            insert into invoice.seller
                (
                    nameSeller,
                    lastName,
                    userName,
                    password,
                    phoneNumber,
                    cellPhone,
                    sellerIdentification,
                    creationDate,
                    statusSeller
                )
            OUTPUT
                    inserted.idSeller,
                    inserted.nameSeller,
                    inserted.lastName,
                    inserted.userName,
                    inserted.password,
                    inserted.phoneNumber,
                    inserted.cellPhone,
                    inserted.sellerIdentification,
                    inserted.creationDate,
                    inserted.statusSeller
            into @insertedRecord
            values 
                (
                '${sellerName}',
                '${sellerLastName}',
                '${userName}',
                '${password}',
                '${phoneNumber}',
                '${cellPhone}',
                '${sellerIdentification}',
                '${creationDate}',
                ${Number(sellerStatus)}
            )

            select * from @insertedRecord
            `);
        newSeller = newSeller.recordset[0];

        res.status(201).json(newSeller);

    } catch (error) {
        res.status(400).json({
            msg: error.message,
            error: 400
        })
    }

}

const updateSalesman = async (req, res) => {

    console.log(req.body);

    const {
        sellerName,
        sellerLastName,
        userName,
        password,
        phoneNumber,
        cellPhone,
        sellerIdentification,
        sellerStatus
    } = req.body;

    const { idSeller } = req.params;

    try {
        let pool = await getConnection();

        let result = (password.length > 0) ? `password = '${password}',` : "";

        await pool.query(`            
            update invoice.seller 
            set 
                nameSeller = '${sellerName}',
                lastName = '${sellerLastName}',
                userName = '${userName}',
                ${result}
                phoneNumber= '${phoneNumber}',
                cellPhone= '${cellPhone}',
                sellerIdentification = '${sellerIdentification}', 
                statusSeller = '${sellerStatus}'
            where idSeller = ${idSeller}
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
    getAllSalesman,
    getSellerById,
    createSalesman,
    updateSalesman
}