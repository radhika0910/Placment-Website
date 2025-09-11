const User = require('../models/user.model');
const { uploadResume, uploadProfilePic } = require('../services/multer.service');

// Upload Resume
exports.uploadResume = (req, res) => {
    uploadResume(req, res, function (err) {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.json({ success: false, message: 'File is too large to upload.' });
            } else if (err.code === 'filetype') {
                return res.json({ success: false, message: 'File type invalid. Only PDF files accepted.' });
            } else {
                return res.json({ success: false, message: 'File was not able to be uploaded. Try again later.' });
            }
        }

        if (!req.file) {
            return res.status(200).json({ success: false, message: 'File is missing.' });
        }

        User.updateOne(
            { college_id: req.decoded.college_id },
            { resume_url: req.file.filename }
        )
        .then(() => {
            res.status(200).json({ success: true, message: 'Resume successfully uploaded.' });
        })
        .catch(err => {
            console.log(err);
            res.status(200).json({ success: false, message: 'Something went wrong!' });
        });
    });
};

// Upload Profile Picture
exports.uploadProfilePic = (req, res) => {
    uploadProfilePic(req, res, function (err) {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.json({ success: false, message: 'File is too large to upload.' });
            } else if (err.code === 'filetype') {
                return res.json({ success: false, message: 'File type invalid. Only image files accepted.' });
            } else {
                return res.json({ success: false, message: 'File was not able to be uploaded. Try again later.' });
            }
        }

        if (!req.file) {
            return res.status(200).json({ success: false, message: 'File is missing.' });
        }

        User.updateOne(
            { college_id: req.decoded.college_id },
            { profilePic_url: req.file.filename }
        )
        .then(() => {
            res.status(200).json({ success: true, message: 'Profile picture successfully uploaded.' });
        })
        .catch(err => {
            console.log(err);
            res.status(200).json({ success: false, message: 'Something went wrong!' });
        });
    });
};
