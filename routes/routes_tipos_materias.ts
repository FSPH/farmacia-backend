import {Router} from 'express'
import Controller_TiposMedicamentos from '../controllers/controller_tipos_medicamentos.js';

const router = Router();

router.get('/listar/:pesq',Controller_TiposMedicamentos.Listar);
router.get('/buscar/:tipo_id',Controller_TiposMedicamentos.Buscar);
router.get('/buscar-codigo/:tipo_codigo',Controller_TiposMedicamentos.BuscarPorCodigo);
router.post('/salvar',Controller_TiposMedicamentos.Salvar);
router.delete('/excluir/:tipo_id',Controller_TiposMedicamentos.Excluir);

export default router;
