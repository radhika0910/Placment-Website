let multer = require("multer");

// Resume Storage
let resumeStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __basedir + "/public/assets/uploads/resumes/");
  },
  filename: function (req, file, cb) {
    if (!file.originalname.match(/\.(pdf)$/)) {
      let err = new Error();
      err.code = "filetype";
      return cb(err);
    }
    cb(null, Date.now() + "_" + file.originalname.replace(/ /g, ""));
  },
});

// Profile Pic Storage
let profilePicStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __basedir + "/public/assets/uploads/profilePics/");
  },
  filename: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      let err = new Error();
      err.code = "filetype";
      return cb(err);
    }
    cb(null, Date.now() + "_" + file.originalname.replace(/ /g, ""));
  },
});

// Middleware
let uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
}).single("resume");

let uploadProfilePic = multer({
  storage: profilePicStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single("profilePic");

module.exports = { uploadResume, uploadProfilePic };
