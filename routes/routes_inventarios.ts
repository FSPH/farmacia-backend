import { Router } from 'express';
import Controller_Inventarios from '../controllers/controller_inventarios.js';

const router = Router();

router.get('/', Controller_Inventarios.Listar);
router.get('/listar/:mes_ref?/:ano_ref?', Controller_Inventarios.Listar);
router.get('/:inv_id/itens', Controller_Inventarios.ListarItens);
router.get('/itens/:inv_id', Controller_Inventarios.ListarItens);
router.post('/', Controller_Inventarios.Criar);
router.post('/criar', Controller_Inventarios.Criar);
router.put('/:inv_id/itens/:iti_id', Controller_Inventarios.AtualizarContagem);
router.put('/:iti_id/itens/contagem', Controller_Inventarios.AtualizarContagem);
router.put('/itens/:iti_id/contagem', Controller_Inventarios.AtualizarContagem);
router.post('/:inv_id/fechar', Controller_Inventarios.Fechar);
router.post('/fechar/:inv_id', Controller_Inventarios.Fechar);

export default router;
