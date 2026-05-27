import { Router} from "express";
import Controller_Medicamentos from "../controllers/controller_medicamentos.js";

const router = Router();

router.get('/listar/:pesq',Controller_Medicamentos.Listar);
router.get('/buscar/:med_id',Controller_Medicamentos.Buscar);
router.post('/salvar',Controller_Medicamentos.Salvar);
router.delete('/excluir/:med_id',Controller_Medicamentos.Excluir);

export default router;