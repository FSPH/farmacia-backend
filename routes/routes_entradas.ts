import {Router} from 'express';
import Controller_Entradas from '../controllers/controller_entradas.js';

const router = Router();

router.get('/listar/:pesq/:data_inicio/:data_fim',Controller_Entradas.ListarTodos);
router.get('/buscar/:ent_id',Controller_Entradas.BuscarPorId);
router.post('/salvar',Controller_Entradas.Salvar);

export default router;