import mongoose from 'mongoose';


const missionSchema = mongoose.Schema(
  {
    alt: {
      type: Number,
      required: true,
    },
    speed: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    waypoints: [
        {
            alt: {
                type: Number,
                required: true,
            },
            lat: {
                type: Number,
                required: true,
            },
            lng: {
                type: Number,
                required: true,
            },
        },
    ],
    drone: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Drone',
        required: true
      }, 
    site: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Site',
        required: true,
      },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        default: "64b38cd775f0fb6560af8ee4",
      },
    deleted_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    deleted_on: {
      type: Date,
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
excludeDeletedMiddleware(missionSchema);
const Mission = mongoose.model('Mission', missionSchema);
export {Mission};
