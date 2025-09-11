var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");
const bcryptjs = require("bcryptjs");
var titlize = require("mongoose-title-case");
var validate = require("mongoose-validator");
mongoose.set("useCreateIndex", true);

// Backend mongoose validators
var nameValidator = [
  validate({
    validator: "matches",
    arguments: /^(([a-zA-Z]{3,10})+[ ]+([a-zA-Z]{3,10})+)+$/,
    message:
      "Name must have minimum 3 and maximum 20 character, Space in between the name, No special letters or numbers!",
  }),
  validate({
    validator: "isLength",
    arguments: [3, 20],
    message: "Name should be between {ARGS[0]} and {ARGS[1]} characters",
  }),
];

var passwordValidator = [
  validate({
    validator: "matches",
    arguments: /^(?=.*?[a-z])(?=.*[A-Z])(?=.*[\d])(?=.*[\W]).{8,25}$/,
    message:
      "Password must have one lowercase, one uppercase, one special character, one number and minimum 8 and maximum 25 character",
  }),
  validate({
    validator: "isLength",
    arguments: [8, 25],
    message: "Password should be between {ARGS[0]} and {ARGS[1]} characters",
  }),
];

var userSchema = new mongoose.Schema({
  student_name: {
    type: String,
    required: true,
  },
  college_id: {
    type: Number,
    unique: true,
  },
  passout_batch: {
    type: Number,
  },
  program: {
    type: String,
  },
  gender: {
    type: String,
    default: "M",
  },
  status: {
    type: String,
  },
  contact_no: {
    type: String,
  },
  college_email: {
    type: String,
  },
  alternate_email: {
    type: String,
  },
  degree: {
    type: String,
  },
  dob: {
    type: String,
  },
  department: {
    type: String,
  },
  cgpa: {
    type: mongoose.Types.Decimal128,
  },
  placement_status: {
    type: String,
    default: "Unplaced",
  },
  year_gap: {
    type: String,
    default: "No",
  },
  Back: {
    type: Number,
    default: 0,
  },
  matric_marks: {
    type: mongoose.Types.Decimal128,
  },
  matric_board: {
    type: String,
  },
  senior_marks: {
    type: mongoose.Types.Decimal128,
  },
  senior_board: {
    type: String,
  },
  alternate_contact_no: {
    type: Number,
  },
  address: {
    type: String,
  },
  city: {
    type: String,
  },
  post_code: {
    type: String,
  },
  state: {
    type: String,
  },
  country: {
    type: String,
  },
  linkedln_link: {
    type: String,
  },
  login_otp: {
    type: String,
  },
  resume_url: {
    type: String,
  },
  profilePic_url: {
    type: String,
  },
  password: {
    type: String,
    //select : false
  },
   active_backlogs: { type: Number, required: true },
   
  active: {
    type: Boolean,
    default: true,
  },
  token: {
    type: String,
    default: "",
  },
  company1: {
    type: String,
    default: "",
  },
  company2: {
    type: String,
    default: "",
  },
  company3: {
    type: String,
    default: "",
  },
  company4: {
    type: String,
    default: "",
  },
  permission: {
    type: String,
    required: true,
    default: "student",
  },
});

userSchema.pre("save", async function (next) {
  var user = this;

  // if(user.isModified("password")) {
  //   this.password = await bcryptjs.hash(user.password, 12);
  // }
  next()
  // bcrypt.hash(user.password, null, null, function (err, hash) {
  //   // Store hash in your password DB.
  //   if (err) {
  //     return next(err);
  //     //res.send('Error in hashing password');
  //   } else {
  //     user.password = hash;
  //     next();
  //   }
  // });
});

// Mongoose title case plugin
userSchema.plugin(titlize, {
  // addition here also
  paths: ["address", "city", "state", "country"], // Array of paths
});

// Password compare method
userSchema.methods.comparePassword = function (password) {
  return password === this.password;
};

module.exports = mongoose.model("User", userSchema);
