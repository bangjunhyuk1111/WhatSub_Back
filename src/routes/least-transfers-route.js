const express = require('express');
const LeastTransfersController = require('../controllers/least-transfers-controller');

const router = express.Router();

router.get('/', LeastTransfersController.getLeastTransfersPaths);

module.exports = router;
