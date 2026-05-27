import { Router } from 'express';
import Controller_Estoque from '../controllers/controler_estoque.js';

const router = Router();

router.get('/', Controller_Estoque.Listar);
router.get('/listar/:pesq/:dep_id/:med_tipo_codigo', Controller_Estoque.Listar);
router.get('/alertas', Controller_Estoque.Alertas);
router.get('/movimentacao/:med_id/:lote', Controller_Estoque.Movimentacao);
router.get('/buscar/:med_id/:dep_id/:lote', Controller_Estoque.Buscar);
router.post('/salvar', Controller_Estoque.Salvar);
router.post('/transferencia', Controller_Estoque.Transferir);

export default router;
