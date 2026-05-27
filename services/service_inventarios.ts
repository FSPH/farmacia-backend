import { Connection } from 'mysql2/promise';
import Inventarios, { iInventarioListagem, iInventariosFields } from '../model/dao_inventarios.js';
import ItensInventario, {
    iItemInventarioListagem,
    iItensInventarioFields,
} from '../model/dao_itens_inventario.js';

interface iCriarInventarioParams {
    inv_date: Date,
    inv_dep_id: number,
    inv_med_tipo_codigo: string,
    inv_mes_ref: number,
    inv_ano_ref: number,
}

interface iAtualizarContagemParams {
    iti_id: number,
    iti_qtde_invent: number,
}

interface iFecharInventarioResultado {
    inventario: iInventariosFields,
    itens_ajustados: number,
}

interface iEstoqueRow {
    est_id: number,
    est_dep_id: number,
    est_med_id: number,
    est_lote: string,
    est_saldo: number,
    est_validade: Date,
}

export default class Service_Inventarios {

    static async Listar(
        connection: Connection,
        filtros: {
            mes_ref?: number,
            ano_ref?: number,
            dep_id?: number,
            med_tipo_codigo?: string,
            status?: 0 | 1,
        },
    ): Promise<iInventarioListagem[]> {

        const inventarios = new Inventarios(connection);

        return inventarios.Listar(
            filtros.mes_ref,
            filtros.ano_ref,
            filtros.dep_id,
            filtros.med_tipo_codigo,
            filtros.status,
        );
    }

    static async Criar(
        connection: Connection,
        params: iCriarInventarioParams,
    ): Promise<{ inventario: iInventariosFields, total_itens: number }> {

        const inventarios = new Inventarios(connection);
        const itensInventario = new ItensInventario(connection);

        await inventarios.BuscarPorReferencia(
            params.inv_dep_id,
            params.inv_med_tipo_codigo,
            params.inv_mes_ref,
            params.inv_ano_ref,
        );

        if (inventarios.found) {
            const error = new Error('Já existe inventário para este depósito, tipo e período.') as Error & { statusCode?: number };
            error.statusCode = 409;
            throw error;
        }

        const itensEstoque = await itensInventario.BuscarEstoqueParaInventario(
            params.inv_dep_id,
            params.inv_med_tipo_codigo,
            true,
        );

        if (!itensEstoque.length) {
            const error = new Error('Nenhum item de estoque encontrado para o depósito e tipo informados.') as Error & { statusCode?: number };
            error.statusCode = 404;
            throw error;
        }

        inventarios.inv_date = params.inv_date;
        inventarios.inv_dep_id = params.inv_dep_id;
        inventarios.inv_med_tipo_codigo = params.inv_med_tipo_codigo;
        inventarios.inv_status = 0;
        inventarios.inv_mes_ref = params.inv_mes_ref;
        inventarios.inv_ano_ref = params.inv_ano_ref;

        await inventarios.Salvar();

        for (const itemEstoque of itensEstoque) {
            const itemInventario = new ItensInventario(connection);
            itemInventario.iti_inv_id = inventarios.inv_id;
            itemInventario.iti_med_id = itemEstoque.iti_med_id;
            itemInventario.iti_lote = itemEstoque.iti_lote;
            itemInventario.iti_validade = itemEstoque.iti_validade;
            itemInventario.iti_qtde_estoque = itemEstoque.iti_qtde_estoque;
            itemInventario.iti_qtde_invent = itemEstoque.iti_qtde_invent;
            await itemInventario.Salvar();
        }

        return {
            inventario: {
                inv_id: inventarios.inv_id,
                inv_date: inventarios.inv_date,
                inv_dep_id: inventarios.inv_dep_id,
                inv_med_tipo_codigo: inventarios.inv_med_tipo_codigo,
                inv_status: inventarios.inv_status,
                inv_mes_ref: inventarios.inv_mes_ref,
                inv_ano_ref: inventarios.inv_ano_ref,
            },
            total_itens: itensEstoque.length,
        };
    }

    static async ListarItens(connection: Connection, inv_id: number): Promise<iItemInventarioListagem[]> {

        const inventarios = new Inventarios(connection);
        const itensInventario = new ItensInventario(connection);

        await inventarios.BuscarPorId(inv_id);

        if (!inventarios.found) {
            const error = new Error('Inventário não encontrado.') as Error & { statusCode?: number };
            error.statusCode = 404;
            throw error;
        }

        return itensInventario.ListarPorInventario(inv_id) as Promise<iItemInventarioListagem[]>;
    }

    static async AtualizarContagem(
        connection: Connection,
        params: iAtualizarContagemParams,
    ): Promise<iItensInventarioFields> {

        const itensInventario = new ItensInventario(connection);

        await itensInventario.BuscarPorIdParaAtualizacao(params.iti_id);

        if (!itensInventario.found) {
            const error = new Error('Item de inventário não encontrado.') as Error & { statusCode?: number };
            error.statusCode = 404;
            throw error;
        }

        const inventarios = new Inventarios(connection);

        await inventarios.BuscarPorIdParaAtualizacao(itensInventario.iti_inv_id);

        if (!inventarios.found) {
            const error = new Error('Inventário não encontrado.') as Error & { statusCode?: number };
            error.statusCode = 404;
            throw error;
        }

        if (inventarios.inv_status === 1) {
            const error = new Error('Inventário fechado não pode ser alterado.') as Error & { statusCode?: number };
            error.statusCode = 409;
            throw error;
        }

        itensInventario.iti_qtde_invent = params.iti_qtde_invent;
        await itensInventario.Salvar();

        return {
            iti_id: itensInventario.iti_id,
            iti_inv_id: itensInventario.iti_inv_id,
            iti_med_id: itensInventario.iti_med_id,
            iti_lote: itensInventario.iti_lote,
            iti_validade: itensInventario.iti_validade,
            iti_qtde_estoque: itensInventario.iti_qtde_estoque,
            iti_qtde_invent: itensInventario.iti_qtde_invent,
            iti_qtde_dif: itensInventario.iti_qtde_estoque - itensInventario.iti_qtde_invent,
        };
    }

    static async Fechar(connection: Connection, inv_id: number): Promise<iFecharInventarioResultado> {

        const inventarios = new Inventarios(connection);
        const itensInventario = new ItensInventario(connection);

        await inventarios.BuscarPorIdParaAtualizacao(inv_id);

        if (!inventarios.found) {
            const error = new Error('Inventário não encontrado.') as Error & { statusCode?: number };
            error.statusCode = 404;
            throw error;
        }

        if (inventarios.inv_status === 1) {
            const error = new Error('Inventário já está fechado e não pode ser reaberto.') as Error & { statusCode?: number };
            error.statusCode = 409;
            throw error;
        }

        const itens = await itensInventario.ListarPorInventarioParaFechamento(inv_id);

        for (const item of itens) {
            const [rows] = await connection.query(
                `SELECT *
                 FROM tb_estoque
                 WHERE est_dep_id = :dep_id
                   AND est_med_id = :med_id
                   AND est_lote = :lote
                 FOR UPDATE`,
                {
                    dep_id: inventarios.inv_dep_id,
                    med_id: item.iti_med_id,
                    lote: item.iti_lote,
                },
            ) as [iEstoqueRow[], unknown];

            if (!rows.length) {
                const error = new Error(
                    `Item de estoque não encontrado para medicamento ${item.iti_med_id} e lote ${item.iti_lote}.`,
                ) as Error & { statusCode?: number };
                error.statusCode = 404;
                throw error;
            }

            const estoque = rows[0];

            await connection.query(
                `UPDATE tb_estoque
                 SET est_saldo = :est_saldo
                 WHERE est_id = :est_id`,
                {
                    est_id: estoque.est_id,
                    est_saldo: item.iti_qtde_invent,
                },
            );
        }

        inventarios.inv_status = 1;
        await inventarios.Salvar();

        return {
            inventario: {
                inv_id: inventarios.inv_id,
                inv_date: inventarios.inv_date,
                inv_dep_id: inventarios.inv_dep_id,
                inv_med_tipo_codigo: inventarios.inv_med_tipo_codigo,
                inv_status: inventarios.inv_status,
                inv_mes_ref: inventarios.inv_mes_ref,
                inv_ano_ref: inventarios.inv_ano_ref,
            },
            itens_ajustados: itens.length,
        };
    }
}
