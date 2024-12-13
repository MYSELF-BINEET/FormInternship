import { Router } from 'express';
import {
  createForm,
  deleteForm,
  deleteForms,
  getAllForms,
  getForm,
  updateForm,
} from '../controllers/formController';
import verifyJWT from '../middleware/verifyJWT';
import {
  createResponse,
  exportcsv,
  getAllResponses,
} from '../controllers/formResponseController';

const router = Router();

router.route('/').get(getAllForms).post(verifyJWT,createForm);
router.patch('/bulk-delete', verifyJWT, deleteForms);
router
  .route('/:id')
  .get(getForm)
  .patch(verifyJWT, updateForm)
  .delete(verifyJWT, deleteForm);
router
  .route("/:id/csv")
  .get(exportcsv);
router
  .route('/:id/responses')
  .get(verifyJWT, getAllResponses)
  .post(createResponse);
export default router;
