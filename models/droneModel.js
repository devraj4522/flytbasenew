
import mongoose from 'mongoose';
import { default as shortid } from 'shortid';


// Create a Mongoose schema for the drone
const droneSchema = mongoose.Schema({
  drone_id: {
    type: String,
    default: shortid.generate,
    unique: true,
    required: true,
  },
  deleted_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  deleted_on: {
    type: Date,
  },
  drone_type: {
    type: String,
    enum: ["REAL_DRONE", "SIMULATED_DRONE", "SIMULATED_DRONE_WITHOUT_CAMERA", "SIMULATED_DRONE_WITHOUT_SENSORS", "SENSOR_SIMULATOR_DRONE", "OTHER"],
    default: "OTHER",
    required: true,
  },
  make_name: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  site: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
    default: '',
    required: true,
  },
},

{ timestamps: true }
);


const excludeDeletedMiddleware = function (schema) {
  const queryMiddleware = function (next) {
    this.where({ deleted_by: null });
    next();
  };

  schema.pre('find', queryMiddleware);
  schema.pre('findOne', queryMiddleware);
};

// Apply the middleware to the schema
excludeDeletedMiddleware(droneSchema);
const Drone = mongoose.model('Drone', droneSchema);


export {Drone};
