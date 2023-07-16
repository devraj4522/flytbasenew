import express from 'express';

import { createDrone, deleteDrone, updateDrone, viewDrone, viewDrones, searchDrones, createSite, updateSite, deleteSite, viewDronesWiteSite, viewDronesWiteCategory } from '../controllers/drone.js';
import { protect, admin } from "../middleware/authMiddleware.js";
import { createMission, deleteMission, filterMissionWithCategory, updateMission, viewMissionWiteSite } from '../controllers/mission.js';
import { createCategory } from '../controllers/mission.js';

const router = express.Router();

router.post('/create-drone', protect, createDrone);
router.post('/create-site', protect, admin, createSite);
router.post('/create-mission', protect, createMission);
router.post('/create-category', protect, admin, createCategory);
router.get('/search', protect, searchDrones);
router.get('/filter-mission-with-category', protect, filterMissionWithCategory);
router.put('/:id', protect, updateDrone);
router.put('/site/:id', protect, updateSite);

router.delete('/:id', protect, deleteDrone);
router.delete('/site/:id', protect, deleteSite);

router.get('/site/', protect, admin, viewDronesWiteSite);
router.get('/mission/', protect, admin, viewMissionWiteSite);
router.get('/mission-cat/', protect, admin, viewDronesWiteCategory);
router.get('/drones/', protect, admin, viewDronesWiteCategory);

router.get('/', protect, viewDrones);
router.get('/:id', protect, viewDrone);

// Missions update and delete
router.put('/mission/:id', protect, updateMission);
router.delete('/mission/:id', protect, deleteMission);

export default router;
