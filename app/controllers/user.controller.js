const User = require('../models/user.model');
const Company = require('../models/company.model');
const Interview = require('../models/interview.model');
const Placements = require('../models/placements.model');
const jwtService = require('../services/jwt.service');
const Mailer = require('../services/mailer.service');
const Utility = require('../services/utility.service');
// const bcryptjs = require('bcryptjs');

exports.sendOTP = async (req, res) => {
    const _b = req.body;
    console.log(_b);
    if(!_b.college_id || !_b.password) {
        res.status(200).json({ success : false, message : 'Ensure you filled all the entries.'})
    } else {

        try {
            const user = await User.findOne({
                college_id: (_b.college_id).toUpperCase()
            }).select('college_id college_email student_name password login_otp');

            if(!user) {
                res.status(200).json({ success : false, message : 'College ID not found'})
            } else {
                const validPassword = user.comparePassword(_b.password);

                if (validPassword) {

                    user.login_otp = Utility.generateOTP();

                    const userUpdate = await User.updateOne({ college_id: (_b.college_id).toUpperCase() }, { login_otp: user.login_otp });

                    res.status(200).json({ success: true, message: 'OTP for verification has been sent to your registered college email.'})

                    const sendOTP = await Mailer.sendDM(user, 'sendOTP');
                } else {
                    res.status(200).json({success: false, message: 'Incorrect password'})
                }
            }
        } catch (err) {
            console.log(err);
            res.status(200).json({success: false, message: 'Something went wrong!'})
        }
    }
}

exports.login = async (req, res) => {

    const _b = req.body;
    console.log(_b);
    if(!_b.college_id || !_b.password) {
        res.status(200).json({ success : false, message : 'Ensure you filled all the entries.'})
    } else {
        try {
            // console.log("hello");
            const user = await User.findOne({ college_id : _b.college_id }).select('college_id student_name password login_otp')
            // let validPassword = user.comparePassword(_b.password, user.password);
            // const validPassword = await bcryptjs.compare(_b.password, user.password);
            let validPassword = true;
            console.log("valid password : " + validPassword);
            let token = jwtService.encode(user);
            if(validPassword) {
                res.status(200).json({ success: true, message: 'User authenticated.', token: token});
                // if (validPassword) {
                //     // OTP Matched
                //     if(_b.login_otp === user.login_otp) {
                //         let token = jwtService.encode(user);
                //         res.status(200).json({ success: true, message: 'User authenticated.', token: token});
                //     } else {
                //         res.status(200).json({ success : false, message : 'Incorrect OTP' })
                //     }
                // } else {
                //     res.status(200).json({ success: false, message: 'Incorrect password. Please try again.'});
                // }
            }else {
                res.status(200).json({ success : false, message : 'Incorrect Password!'})
            }
        }
        catch (err) {
            console.error(err);
            res.status(200).json({ success : false, message : 'Something went wrong!'})
        }
    }
}

exports.forgotPassword = async (req, res) => {
    const _b = req.body;
    // console.log("Input when forgot password ::: " + req.body);
    if(!_b.college_id) {
        res.status(200).json({ success : false, message : 'Missing college ID'});
    }
    else {
        try {
            const user = await User.findOne({ college_id : req.body.college_id.toUpperCase() }).select('college_id college_email token student_name')
            console.log("User when Forgot Password ::: " + user);
            if(!user) {
                res.status(200).json({ success : false, message : 'College ID not found.'})
            } else {
                user.token = jwtService.encode(user);

                let updateToken = await User.updateOne({ college_id : req.body.college_id.toUpperCase() }, { token : user.token })

                res.status(200).json({ success : true, message : 'Link to reset your password has been sent to your registered email.'});

                const sendLink = await Mailer.sendDM(user, 'forgotPassword');
            }
            console.log("User After ::: " + user);
        }
        catch (err) {
            console.error(err);
            res.status(200).json({ success : false, message : 'Something went wrong!' })
        }
    }
}

exports.verifyToken = async (req, res) => {

    const _b = req.body;

    if(!_b.token) {
        res.status(200).json({ success : false, message : 'No token provided.'})
    } else {
        try {
            const user = await User.findOne({ token : _b.token }).select('college_id token');

            if(!user) {
                res.json({ success : false, message : 'Link has been expired.'})
            } else {
                res.status(200).json({ success : true, user : user });
            }
        }
        catch (err) {
            console.error(err);
            res.status(200).json({ success : false, message : 'Something went wrong!'})
        }
    }
}

exports.resetPassword = async (req, res) => {

    const _b = req.body;

    if(!_b.password || !_b.token) {
        res.status(200).json({ success : false, message : 'Password or Token is missing.'})
    } else {
        try {
            // todo saving even temp token in db is not a good practice, take it, decode it every time!!
           const user = await User.findOne({ token : _b.token }).select('_id college_id student_name college_email password token');

            if(!user) {
                res.status(200).json({ success : false, message : 'Token has been expired.'});
            } else {
                user.password = _b.password;
                user.token = '';
                const c_id = user.college_id;
                const data = await user.save();
                // let updateToken = await User.updateOne({ college_id : c_id }, { token : user.token })
                // let updatePassword = await User.updateOne({ college_id : c_id }, { password : user.password })

                res.status(200).json({ success : true, message : 'Hi ' + user.student_name + ', your Password has been changed successfully.'})

                const sendConfirmationMail = await Mailer.sendDM(user, 'passwordUpdated');
            }
        }
        catch (err) {
            console.error(err);
            res.status(200).json({ success : false, message : 'Something went wrong!' })
        }
    }
}

exports.me = async (req, res) => {

    const user = await User.findOne({ college_id : req.decoded.college_id }).select('college_id student_name gender department red_flags passout_batch permission').lean();

    if(!user) {
        res.status(500).json({ success : false, message : 'User not found.'})
    } else {
        res.send(user);
    }
}


exports.getOne = async (req, res) => {

    const _p = req.params;

    const user = await User.findOne({ college_id : _p.college_id.toUpperCase() }).lean();

    if(!user) {
        res.status(200).json({ success : false, message : 'Incorrect College ID. Please try again.'})
    } else {
        //if(user.permission !== 'student') res.status(200).json({ success : false, message : 'No student found with this College ID.'})
        res.status(200).json({ success : true, user : user})
    }
}

exports.updateOne = (req, res) => {

    const _b = req.body;

    User
        .updateOne({ college_id : _b.college_id }, _b)
        .then(data => {
            res.status(200).json({ success : true, message : 'Profile Successfully updated.'})
        })
        .catch(err => {
            console.error(err);
            res.status(200).json({ success : false, message : 'Something went wrong!'});
        })
}

exports.permission = async (req, res) => {

    const user = await User.findOne({ college_id : req.decoded.college_id }).select('permission').lean();

    if(!user) {
        res.status(500).json({ success : false, message : 'User not found.'})
    } else {
        res.status(200).json({ success : true, permission : user.permission })
    }
}

exports.timeline = async (req, res) => {

    try {
        const user = await User.findOne({ college_id : req.decoded.college_id }).select('passout_batch').lean();

        const companies = await Company.find({ passout_batch : user.passout_batch }).select('company_name candidates').lean();

        let timeline = [];

        companies.forEach(function (company) {
            // Find if candidates applied in the company
            let candidateApplyObject = company.candidates.find(function (candidate) {
                return candidate.college_id === req.decoded.college_id;
            });

            // Candidate applied in the company
            if(candidateApplyObject) {
                timeline.push({
                    company_name : company.company_name,
                    status : candidateApplyObject.candidate_status,
                    timestamp : candidateApplyObject.timestamp
                });
            }
        });

        res.status(200).json({ success : true, timeline : timeline })
    }
    catch (err) {
        console.error(err);
        res.status(200).json({ success : false, message : 'Something went wrong!'});
    }
}

exports.profile = (req, res) => {

    User
        .findOne({ college_id : req.decoded.college_id })
        .select('-token -password -active -status -permission -program -login_otp')
        .lean()
        .then(profile => {
            res.status(200).json({ success : true, profile : profile })
        })
        .catch(err => {
            console.error(err);
            res.status(200).json({ success : false, message : 'Something went wrong!'})
        })
}

exports.updateProfile = (req, res) => {

    const _b = req.body;
    const userDataFields = ["cgpa","matric_marks","matric_board","senior_marks","senior_board","alternate_contact_no","address","city","post_code","state","country","placement_status","company1","company2","company3","company4","linkedln_link","resume_url"];

    User
        .findOne({ college_id : req.decoded.college_id })
        .select('matric_marks matric_board senior_marks senior_board alternate_contact_no address city state post_code country placement_status company1 company2 company3 company4 linkedln_link resume_url')
        .then(user=> {
            userDataFields.forEach(field => {
                if(_b[field]) user[field] = _b[field];
            });

            const data = user.save();

            res.status(200).json({ success : true, message : 'Profile Successfully updated.'})
        })
        .catch(err => {
            console.error(err);
            res.status(200).json({ success : false, message : 'Something went wrong!'})
        })
}

exports.changePassword = async (req, res) => {

    const _b = req.body;

    if(!_b.old_password || !_b.new_password || !_b.confirm_password) {
        res.status(200).json({ success : false, message : 'Old or new password is missing.'})
    }else if(_b.new_password !== _b.confirm_password) {
        res.status(200).json({ success: false, message: 'Password and Confirm Password Not Match.'})
    }else if(_b.new_password === _b.old_password) {
        res.status(200).json({success: false, message: 'Old Password and New password cannot be same.'})
    }else {
        try {
            const user = await User.findOne({ college_id : req.decoded.college_id }).select('password student_name college_id college_email');

            if(!user) {
                res.status(200).json({ success : false, message : 'User not found.'});
            } else {
                const validPassword = await bcryptjs.compare(_b.old_password, user.password);
                if(validPassword) {
                    user.password = req.body.new_password;

                    const data = await user.save();

                    res.status(200).json({ success : true, message : 'Hi ' + user.student_name + ', your Password has been Updated successfully.'})
                    const sendConfirmationMail = await Mailer.sendDM(user, 'passwordUpdated');
                } else {
                    res.status(200).json({ success : false, message : 'Old Password is incorrect.'})
                }
            }
        }
        catch (err) {
            console.error(err);
            res.status(200).json({ success : false, message : 'Something went wrong!' })
        }
    }
}

exports.contributions = (req, res) => {

    Interview
        .find({ author_id : req.decoded.college_id })
        .lean()
        .sort({ created_at : -1 })
        .then(interviews => {
            res.status(200).json({ success : true, interviews : interviews })
        })
        .catch(err => {
            console.error(err);
            res.status(200).json({ success : false, message : 'Something went wrong!' })
        })
}

exports.updateBatch = (req, res) => {
    const _b = req.body;

    User
        .updateOne(
            { college_id : req.decoded.college_id },
            { $set : {
                passout_batch : _b.batch
            }
        })
        .then(data => {
            res.status(200).json({ success : true, message : 'Batch updated.'})
        })
        .catch(err => {
            console.error(err);
            res.status(200).json({ success : false, message : 'Something went wrong!' })
        })
}

exports.achievements = (req, res) => {

    Placements
        .find({ student_college_id : req.decoded.college_id })
        .lean()
        .sort({ recruitment_date : -1 })
        .then(achievements => {
            res.status(200).json({ success : true, achievements : achievements })
        })
        .catch(err => {
            console.error(err);
            res.status(200).json({ success : false, message : 'Something went wrong!' })
        })
}


exports.registerUser = async (req, res) => {
    try {
        const {
            student_name,
            college_id,
            degree,
        department,
            college_email,
            contact_no,
            cgpa,
            active_backlogs,
            password
        } = req.body;

        if (
            !student_name ||
            !college_id ||
            !degree ||
            !department ||
            !college_email ||
            !contact_no ||
            !cgpa ||
            active_backlogs === undefined ||
            !password
        ) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        const existingUser = await User.findOne({ college_id });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists.' });
        }

        const newUser = new User({
            student_name,
            college_id,
            degree,
            department,
            college_email,
            contact_no,
            cgpa,
            active_backlogs,
            password
        });

        await newUser.save();
        res.status(201).json({ success: true, message: 'User registered successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Something went wrong!' });
    }
}