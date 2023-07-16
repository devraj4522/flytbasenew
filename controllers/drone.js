import {Drone} from '../models/droneModel.js'
import User from '../models/userModel.js';
import { Site } from '../models/siteModel.js';
import { Mission } from '../models/missionModel.js';
import expressAsyncHandler from 'express-async-handler';

const createDrone = async (req, res) => {
  try {
    const { drone_type, make_name, name, user, site } = req.body;

    const newDrone = new Drone({
      drone_type, 
      make_name,
      name, 
      site,
      user: req.user._id
    });

    newDrone.save();
    
    const drone_site = await Site.findOne({ _id: newDrone.site });

    newDrone.site = drone_site;
    res.status(201).json({message: "Info fetched.", newDrone});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller function to update an existing drone
const updateDrone = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedValues = req.body;
    const drone = await Drone.findOne({'drone_id': id});

    if (!drone) {
      return res.status(404).json({ message: 'Drone not found' });
    }

    Object.keys(updatedValues).forEach((key) => {
      if (key == 'deleted_by' || key == 'deleted_on' || key == 'drone_id' || key == 'user') {
        return res.status(400).json({ message: 'Invalid field' });
      };
      drone[key] = updatedValues[key];
    });

    await drone.save();

    res.json({ message: 'Drone updated successfully', drone });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const searchDrones = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { name } = req.query;
    // console.log(req.query);

    const totalDrones = await Drone.countDocuments({
      name: { $regex: name, $options: 'i' },
    });

    const drones = await Drone.find({ name: { $regex: name, $options: 'i' } })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(201).json({drones, 
                        totalPages: Math.ceil(totalDrones / limit),
                        currentPage: page,});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller function to delete a drone
const deleteDrone = async (req, res) => {
  try {
    const { id } = req.params;

    const drone = await Drone.findOne({drone_id: id});
    drone.deleted_by = req.user._id;
    drone.deleted_on = Date.now();
    await drone.save();

    res.json({ message: 'Drone deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const viewDrone = expressAsyncHandler(async (req, res) => {
  try {
    // console.log(req.params)
    const drone_id = req.params.id;
    const drone = await Drone.findOne({ drone_id });
    if (drone) {
      res.json(drone);
    } else {
      res.status(400).send({ message: 'Drones not found' });
    }
  } catch (error) {
    res.status(400).send({ message: `Something went wrong : \n${error}` });
  }
});

const viewDrones = expressAsyncHandler(async (req, res) => {
  try {
    // console.log("dev raj", req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const userid = req.user._id;
    const user = await User.findById(userid);
    const totalDrones = await Drone.countDocuments({
      // 'user': user._id
    });
    const drones = await Drone.find({ }).skip((page - 1) * limit)
                                                          .limit(limit);
    console.log(drones, limit, page, totalDrones);
    const dronesList = [];
    drones.forEach((drone) => {
      dronesList.push({
        drone_id: drone.drone_id,
        name: drone.name,
        site: drone.site,
      });
    });
    res.json({dronesList, 
      "totalPages": Math.ceil(totalDrones / limit),
      "currentPage": page,}
    );
  } catch (error) {
    res.status(400).send({ message: `Something went wrong : \n${error}` });
  }
});

const viewDronesWiteSite = expressAsyncHandler(async (req, res) => {
  try {
    console.log("dev raj", req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const site = req.query.site;
    const userid = req.user._id;
    const user = await User.findById(userid);
    const totalDrones = await Drone.countDocuments({
    });
    const drones = await Drone.find({ site: site}).skip((page - 1) * limit)
                                                          .limit(limit);
    console.log(drones, limit, page, totalDrones);
    const dronesList = [];
    drones.forEach((drone) => {
      dronesList.push({
        drone_id: drone.drone_id,
        name: drone.name,
        site: drone.site,
      });
    });
    res.json({dronesList, 
      "totalPages": Math.ceil(totalDrones / limit),
      "currentPage": page,}
    );
  } catch (error) {
    res.status(400).send({ message: `Something went wrong : \n${error}` });
  }
});

const viewDronesWiteCategory = expressAsyncHandler(async (req, res) => {
  try {
    console.log("dev raj", req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const missions = await Mission.find({ category: category });

    const droneIds = missions.map(mission => mission.drone);

    // Find all drones with the extracted drone IDs
    const totalDrones = await Drone.countDocuments({
      _id: { $in: droneIds }
    });
    const drones = await Drone.find({ _id: { $in: droneIds } }).skip((page - 1) * limit)
                                                          .limit(limit);
    console.log(drones, limit, page, totalDrones);
    const dronesList = [];
    drones.forEach((drone) => {
      dronesList.push({
        drone_id: drone.drone_id,
        name: drone.name,
        site: drone.site,
      });
    });
    res.json({dronesList, 
      "totalPages": Math.ceil(totalDrones / limit),
      "currentPage": page,}
    );
  } catch (error) {
    res.status(400).send({ message: `Something went wrong : \n${error}` });
  }
});


const createSite = async (req, res) => {
  try {
      const { name, position } = req.body;

      const newSite = new Site({
          site_name: name,
          position: position,
          user: req.user._id,
      });

      await newSite.save();
      res.status(201).json({ message: 'Site created successfully', newSite });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

const updateSite = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedValues = req.body;
    const site = await Site.findOne({_id: id});

    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    Object.keys(updatedValues).forEach((key) => {
      if (key == 'deleted_by' || key == 'deleted_on' || key == 'user') {
        return res.status(400).json({ message: 'Invalid field' });
      };
      site[key] = updatedValues[key];
    });

    await site.save();

    res.json({ message: 'Site updated successfully', site });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const deleteSite = async (req, res) => {
  try {
    const { id } = req.params;

    const site = await Site.findById(id);
    site.deleted_by = req.user._id;
    site.deleted_on = Date.now();
    await site.save();

    res.json({ message: 'Site deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export {
  createDrone,
  updateDrone,
  deleteDrone,
  viewDrone,
  viewDrones,
  searchDrones,
  createSite,
  updateSite,
  deleteSite, 
  viewDronesWiteSite,
  viewDronesWiteCategory
};
