import {Router} from 'express';
import Controller_Locais from '../controllers/controller_locais.js';

const router = Router();

router.get('/buscar/:id_local',Controller_Locais.Buscar);
router.get('/listar/:pesq',Controller_Locais.Listar);
router.post('/salvar',Controller_Locais.Salvar);
router.delete('/excluir/:local_id',Controller_Locais.Excluir);

export default router;