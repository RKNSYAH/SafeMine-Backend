import mongoose from 'mongoose';

const { Schema, model } = mongoose;


const detectionSchema = new Schema({
  warnLabel: {
    type: String, 
    required: true
  },
  timeStamp: {
    type: Date,
    default: Date.now
  },
  worker: {
    type: Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
});

const Detection = model('Detection', detectionSchema);

export default Detection;