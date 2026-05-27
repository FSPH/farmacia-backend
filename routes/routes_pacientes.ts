import { Router } from 'express';
import Controller_Pacientes from '../controllers/controller_pacientes.js';

const router = Router();

router.get('/', Controller_Pacientes.Listar);
router.get('/listar/:q', Controller_Pacientes.Listar);
router.get('/:paciente_id', Controller_Pacientes.Buscar);

export default router;
