import {Router} from 'express';
import Controller_Boname from '../controllers/controller_boname.js';

const router = Router();

router.get('/listar/:pesq',Controller_Boname.Listar);
router.get('/buscar/:bona_id',Controller_Boname.Buscar);
router.post('/salvar',Controller_Boname.Salvar);
router.delete('/excluir/:bona_id',Controller_Boname.Excluir);

export default router;