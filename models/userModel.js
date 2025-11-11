import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const supervisorSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  supervisorID: {
    type: Number,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});
const workerSchema = new Schema({
  fullName: {
    type: String,
    required: true
  },
  workerID: {
    type: Number,
    required: true,
    unique: true
  },
  isLoggedIn: {
    type: Boolean,
    default: false,
    required: true
  },
  supervisor: {
    type: Schema.Types.ObjectId,
    ref: 'Supervisor',
    required: true
  },
}, {toJSON: {virtuals: true}, toObject: {virtuals: true}});

workerSchema.virtual('detections', {
  ref: 'Detection',
  localField: '_id',
  foreignField: 'worker'
});

const Supervisor = model('Supervisor', supervisorSchema);
const Worker = model('Worker', workerSchema);

export { Supervisor, Worker };