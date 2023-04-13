import express from 'express';

import authorController from '../controllers/authorController.mjs';

const router = express.Router();

router.route('/').get(authorController.getAllAuthors).post(authorController.createAuthor);
router.route('/:id').get(authorController.getAuthor).patch(authorController.updateAuthor).delete(authorController.deleteAuthor);

export default router;