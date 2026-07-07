import mongoose from 'mongoose';

const familyMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    relation: {
      type: String,
      required: true,
      trim: true,
    },
    photoFileId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { _id: false }
);

const emergencyContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    relation: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const patientProfileSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required'],
    unique: true,
  },
  preferredName: {
    type: String,
    trim: true,
    default: '',
  },
  familyMembers: [familyMemberSchema],
  keyFacts: [
    {
      type: String,
      trim: true,
    },
  ],
  homeAddress: {
    type: String,
    trim: true,
    default: '',
  },
  emergencyContacts: [emergencyContactSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PatientProfile = mongoose.model('PatientProfile', patientProfileSchema);

export default PatientProfile;
