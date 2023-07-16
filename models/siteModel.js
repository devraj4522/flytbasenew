import mongoose from 'mongoose';


const siteSchema = mongoose.Schema({
    site_name: {
      type: String,
      required: true,
    },
    position: {
      latitude: {
        type: String,
        required: true,
      },
      longitude: {
        type: String,
        required: true,
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
excludeDeletedMiddleware(siteSchema);
const Site = mongoose.model('Site', siteSchema);
export {Site};
