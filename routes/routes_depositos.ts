import {Router} from 'express';
import Controller_Depositos from '../controllers/controller_depositos.js';

const router = Router();

router.get('/listar/:pesq',Controller_Depositos.Listar);
router.get('/buscar/:dep_id',Controller_Depositos.Buscar);
router.post('/salvar',Controller_Depositos.Salvar);
router.delete('/excluir/:dep_id',Controller_Depositos.Excluir);

export default router;