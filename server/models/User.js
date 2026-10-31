const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { encryptToken, decryptToken } = require("../utils/cryptoUtil");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar: { type: String },
    githubId: { type: String },
    githubToken: { 
      type: String, 
      select: false,
      set: (val) => (val ? encryptToken(val) : val)
    },
    githubUsername: { type: String, trim: true },
    securityQuestion: { type: String, trim: true },
    securityAnswer: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
    plan: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
    monthlyScans: { type: Number, default: 0 },
    lastScanReset: { type: Date, default: Date.now },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.compareSecurityAnswer = function (candidate) {
  if (!this.securityAnswer || !candidate) return false;
  return bcrypt.compare(candidate.toLowerCase().trim(), this.securityAnswer);
};

userSchema.methods.getDecryptedGithubToken = function () {
  return decryptToken(this.githubToken);
};

module.exports = mongoose.model("User", userSchema);