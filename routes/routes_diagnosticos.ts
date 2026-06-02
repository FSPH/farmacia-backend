import {Router} from 'express';
import Controller_Diagnosticos from '../controllers/controller_diagnosticos.js';

const router = Router();

router.get('/listar/:pesq',Controller_Diagnosticos.Listar);
router.get('/listar_ativos/:pesq',Controller_Diagnosticos.ListarAtivos);
router.get('/buscar/:diag_id',Controller_Diagnosticos.Buscar);
router.post('/salvar',Controller_Diagnosticos.Salvar);
router.delete('/excluir/:diag_id',Controller_Diagnosticos.Excluir);

export default router;