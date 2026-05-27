import { Router } from 'express';
import Controller_TiposRequisicoes from '../controllers/controller_tipos_requisicoes.js';

const router = Router();

router.get('/listar', Controller_TiposRequisicoes.Listar);
router.get('/buscar/:tip_id', Controller_TiposRequisicoes.Buscar);

export default router;
