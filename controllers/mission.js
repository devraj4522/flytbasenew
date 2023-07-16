import { Drone } from '../models/droneModel.js';
import { Mission } from '../models/missionModel.js';
import { Category } from '../models/categoryModel.js';
import expressAsyncHandler from 'express-async-handler';


const createMission = async (req, res) => {
    try {
        const { alt, speed,  name,  waypoints,  drone,  site} = req.body;

        const droneObj = await Drone.findOne({ _id: drone });
        const site_id = droneObj.site.toString();
        // console.log(droneObj);
        if (site_id !== site)
        {
            console.log(site_id, site);
            res.status(201).json({
                "message": "Users can run missions only on drones that are assigned to the site where the mission belongs. ",
            });
        }
        else{
            const newMission = new Mission({
                name: name,
                alt: alt,
                speed: speed,
                waypoints,
                drone,
                site,
                user: req.user._id,
            });
            
            await newMission.save();
            res.status(201).json({ message: 'Mission created successfully', newMission });
    
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const createCategory = async (req, res) => {
    try {
        const { name, color, tag_name} = req.body;

        const newCategory = new Category({
            name: name,
            color: color,
            tag_name: tag_name,
            user: req.user._id,
        });
        
        await newCategory.save();
        res.status(201).json({ message: 'Category created successfully', newCategory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const filterMissionWithCategory = async (req, res) => {
    try {
      const categoryId = req.query.categoryId;
      const page = parseInt(req.query.page) || 1; 
      const limit = parseInt(req.query.limit) || 10; 
  
      const skip = (page - 1) * limit;
  
      const missions = await Mission.find({ category: categoryId })
        .populate('category')
        .skip(skip)
        .limit(limit);
  
      res.json({missions, limit, "currentPage": page});
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  const updateMission = async (req, res) => {
    try {
      const { id } = req.params;
      const updatedValues = req.body;
      const mission = await Mission.findOne({_id: id});
  
      if (!mission) {
        return res.status(404).json({ message: 'Mission not found' });
      }
  
      Object.keys(updatedValues).forEach((key) => {
        if (key == 'deleted_by' || key == 'deleted_on' || key == 'user') {
          return res.status(400).json({ message: 'Invalid field' });
        };
        mission[key] = updatedValues[key];
      });
  
      await mission.save();
      res.json({ message: 'Mission updated successfully', mission });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  
  const deleteMission = async (req, res) => {
    try {
      const { id } = req.params;
  
      const mission = await Mission.findById(id);
      mission.deleted_by = req.user._id;
      mission.deleted_on = Date.now();
      await mission.save();
  
      res.json({ message: 'Mission deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

const viewMissionWiteSite = expressAsyncHandler(async (req, res) => {
    try {
    //   console.log("dev raj", req.query);
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const site = req.query.site;
      const totalMissions = await Mission.countDocuments({
      });
      const missions = await Mission.find({ site: site}).skip((page - 1) * limit)
                                                            .limit(limit);
      console.log(missions, limit, page, totalMissions);
      const missionsList = [];
      missions.forEach((mission) => {
        missionsList.push({
          mission: mission.id,
          name: mission.name,
          site: mission.site,
          drone: mission.drone
        });
      });
      res.json({dronesList: missionsList, 
        "totalPages": Math.ceil(totalMissions / limit),
        "currentPage": page,}
      );
    } catch (error) {
      res.status(400).send({ message: `Something went wrong : \n${error}` });
    }
  });

  const viewMissionWiteCategory = expressAsyncHandler(async (req, res) => {
    try {
    //   console.log("dev raj", req.query);
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const category = req.query.category;
      const totalMissions = await Mission.countDocuments({
        category
      });
      const missions = await Mission.find({ category}).skip((page - 1) * limit)
                                                            .limit(limit);
      console.log(missions, limit, page, totalMissions);
      const missionsList = [];
      missions.forEach((mission) => {
        missionsList.push({
          mission: mission.id,
          name: mission.name,
          site: mission.site,
          drone: mission.drone
        });
      });
      res.json({dronesList: missionsList, 
        "totalPages": Math.ceil(totalMissions / limit),
        "currentPage": page,}
      );
    } catch (error) {
      res.status(400).send({ message: `Something went wrong : \n${error}` });
    }
  });
export {
    createMission,
    createCategory,
    filterMissionWithCategory,
    updateMission,
    viewMissionWiteSite,
    viewMissionWiteCategory,
    deleteMission
};
