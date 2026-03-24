import mongoose, { Document, Schema } from 'mongoose';

export interface IBlockedDate extends Document {
  vehicleId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  reason?: string; // e.g., "Maintenance", "Personal Use", "Unavailable"
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BlockedDateSchema = new Schema<IBlockedDate>(
  {
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      trim: true,
      default: 'Unavailable',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Composite index for efficient queries
BlockedDateSchema.index({ vehicleId: 1, startDate: 1, endDate: 1 });

// Validation: endDate must be >= startDate
BlockedDateSchema.pre('save', function (next) {
  if (this.endDate < this.startDate) {
    return next(new Error('End date must be greater than or equal to start date'));
  }
  next();
});

const BlockedDate =
  mongoose.models.BlockedDate ||
  mongoose.model<IBlockedDate>('BlockedDate', BlockedDateSchema);

export default BlockedDate;
