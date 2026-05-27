import {createConnection} from 'mysql2/promise';
import json from './tabItInventario.json' with { type: 'json' };

const connection = await createConnection({
    host: '172.23.42.17',
    user: 'root',
    password: 'M!r@g3ns',
    database: 'fsph_farmacia',
    namedPlaceholders: true,
    decimalNumbers: true,
    dateStrings: true
});

(async () => {

    try {

        console.clear();

        let i = 0;

        await connection.beginTransaction();

        for (const item of json) {
            
            ++i;

            const query = `INSERT INTO tb_itens_inventario SET 
                iti_id = :iti_id,
                iti_inv_id = :iti_inv_id,
                iti_med_id = :iti_med_id,
                iti_lote = :iti_lote,
                iti_validade = :iti_validade,
                iti_qtde_estoque = :iti_qtde_estoque,
                iti_qtde_invent = :iti_qtde_invent`;
            
            await connection.execute(query, {
                iti_id: i,
                iti_inv_id: item.NumInv,
                iti_med_id: item.CodProd,
                iti_lote: item.Lote,
                iti_validade: null,
                iti_qtde_estoque: item.QtdeEstq,
                iti_qtde_invent: item.QtdeInv,
            });

            console.log(`${i} de ${json.length} inseridos com sucesso`);
            
        }

        await connection.commit();
        
    } catch (error) {

        await connection.rollback();

        console.log(error);

    } finally {
        await connection.end(); 
    }

})();