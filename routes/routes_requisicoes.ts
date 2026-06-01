import {Router} from 'express'
import Controller_Requisicoes from '../controllers/controller_requisicoes.js';

const router = Router();

router.get('/listar/:dat_ini/:dat_fim/:aprova',Controller_Requisicoes.Listar);
router.get('/buscar/:req_id',Controller_Requisicoes.Buscar);
router.get('/aprovar_por_requisicao/:req_id/:user_aprova',Controller_Requisicoes.AprovacaoPorIDRequisicao);
router.post('/salvar',Controller_Requisicoes.Salvar);

export default router;