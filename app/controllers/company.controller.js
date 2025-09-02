const User = require("../models/user.model");
const Mail = require("../services/mailer.service");
const Company = require("../models/company.model");
const mongoose = require("mongoose");

exports.getAll = async (req, res) => {
  const _b = req.body;

  const opts = { deadline_date: { $lt: new Date() } };

  if (_b.active) opts.deadline_date = { $gte: new Date() - 1 };

  try {
    const user = await User.findOne({ college_id: req.decoded.college_id })
      .select("passout_batch")
      .lean();

    const companies = await Company.find({
      passout_batch: user.passout_batch,
      ...opts,
    })
      .select("company_name job_profile package deadline_date")
      .lean();

    res.status(200).json({ success: true, companies: companies });
  } catch (err) {
    console.error(err);
    res.status(200).json({ success: false, message: "Something went wrong!" });
  }
};

exports.exportNotRegisteredStudentsCSV = async (req, res) => {
    try {
        const companyId = req.params.company_id;
        const allStudents = await User.find({});
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found.' });
        }
        const registeredIds = Array.isArray(company.candidates)
            ? company.candidates
            : [];
        // Convert CGPA and Active Backlogs to string/number
        const notRegistered = allStudents
            .filter(s => !registeredIds.includes(s.college_id))
            .map(s => ({
                student_name: s.student_name,
                college_id: s.college_id,
                degree: s.degree,
                branch: s.branch,
                personal_email: s.personal_email,
                personal_contact_no: s.personal_contact_no,
                cgpa: s.cgpa && s.cgpa.toString ? s.cgpa.toString() : s.cgpa,
                active_backlogs: s.active_backlogs && s.active_backlogs.toString ? s.active_backlogs.toString() : s.active_backlogs
            }));
 const numberOfNotRegistered = notRegistered.length;
        const fields = [
            { label: 'Name', value: 'student_name' },
            { label: 'College ID', value: 'college_id' },
            { label: 'Degree', value: 'degree' },
            { label: 'Branch', value: 'branch' },
            { label: 'Email', value: 'personal_email' },
            { label: 'Contact No', value: 'personal_contact_no' },
            { label: 'CGPA', value: 'cgpa' },
            { label: 'Active Backlogs', value: 'active_backlogs' }
        ];

        const { Parser } = require('json2csv');
        const parser = new Parser({ fields });
        const csv = parser.parse(notRegistered);

        res.status(200);
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Pragma', 'no-cache');
        res.header('Content-Type', 'text/csv');
        res.attachment('NotRegisteredStudents.csv');
        return res.send(csv);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not export CSV.' });
    }
};

exports.getNotRegisteredStudentsCount = async (req, res) => {
    try {
        const companyId = req.params.company_id;
        const allStudents = await User.find({});
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found.' });
        }
        const registeredIds = Array.isArray(company.candidates) ? company.candidates : [];
        const notRegisteredCount = allStudents.filter(s => !registeredIds.includes(s.college_id)).length;
        res.status(200).json({ success: true, count: notRegisteredCount });
        console.log("Not Registered Students Count: ", notRegisteredCount);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not fetch count.' });
    }
};

exports.getOne = (req, res) => {
  const _b = req.params;

  Company.findOne({ _id: _b.company_id })
    .select("-candidates")
    .lean()
    .then((companyDetail) => {
      res.status(200).json({ success: true, companyDetail: companyDetail });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(200)
        .json({ success: false, message: "Something went wrong!" });
    });
};

exports.add = (req, res) => {
  const _b = req.body;

  Company.create(_b)
    .then(async (data) => {
      res
        .status(200)
        .json({ success: true, message: "Successfully new company added." });

      const batch = Number(_b.passout_batch);

      let email = [];

      // eligibility
      for (let course in _b.eligibility) {
        if (course == "UG") {
          email.push(batch - 4 + "@ycce.in");
        } else if (course == "MTech") {
          email.push(batch - 2 + "@ycce.in");
        } else if (course == "MPlan") {
          email.push(batch - 2 + "_PAR@ycce.in");
        } else if (course == "MSc") {
          email.push(batch - 2 + "_MSC@ycce.in");
        } else if (course == "MBA") {
          email.push(batch - 2 + "_PBM@ycce.in");
        }
      }

      //package details
      if (!_b.package) {
        _b.package = {
          UG: { ctc: "NA" },
          MTech: { ctc: "NA" },
          MPlan: { ctc: "NA" },
          MSc: { ctc: "NA" },
          MBA: { ctc: "NA" },
        };
      }
      try {
        _b.package.UG.ctc = _b.package.UG.ctc;
      } catch (err) {
        _b.package.UG = { ctc: "NA" };
      }
      try {
        _b.package.MTech.ctc = _b.package.MTech.ctc;
      } catch (err) {
        _b.package.MTech = { ctc: "NA" };
      }
      try {
        _b.package.MPlan.ctc = _b.package.MPlan.ctc;
      } catch (err) {
        _b.package.MPlan = { ctc: "NA" };
      }
      try {
        _b.package.MSc.ctc = _b.package.MSc.ctc;
      } catch (err) {
        _b.package.MSc = { ctc: "NA" };
      }
      try {
        _b.package.MBA.ctc = _b.package.MBA.ctc;
      } catch (err) {
        _b.package.MBA = { ctc: "NA" };
      }

      data.email = email;
      data.package = _b.package;

      const notif = await Mail.sendDM(data, "companyAdded");
    })
    .catch((err) => {
      console.error(err);
      res.status(200).json({
        success: false,
        message:
          "Something went wrong! Did you miss Company Name, Passout Batch, Job Profile or Deadline date?",
      });
    });
};

exports.update = (req, res) => {
  const _b = req.body;

  Company.updateOne({ _id: _b._id }, _b)
    .then((data) => {
      res.status(200).json({
        success: true,
        message: "Company Details successfully updated.",
      });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(200)
        .json({ success: false, message: "Something went wrong!" });
    });
};

exports.remove = (req, res) => {
  const _b = req.body;

  Company.findOneAndRemove({ _id: _b.company_id })
    .then((data) => {
      res
        .status(200)
        .json({ success: true, message: "Successfully deleted company." });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(200)
        .json({ success: false, message: "Something went wrong!" });
    });
};

exports.allApplied = (req, res) => {
  const _p = req.params;

  Company.aggregate([
    {
      // Document matching Company ID
      $match: {
        _id: mongoose.Types.ObjectId(_p.company_id),
      },
    },
    {
      // Lookup
      $lookup: {
        from: "users",
        localField: "candidates.college_id",
        foreignField: "college_id",
        as: "registered_candidates",
      },
    },
    {
      // Project and convert fields to string format
      $project: {
        company_name: 1,
        registered_candidates: {
          $map: {
            input: "$registered_candidates",
            as: "candidate",
            in: {
              student_name: "$$candidate.student_name",
              college_id: { $toString: "$$candidate.college_id" },
              alternate_contact_no: "$$candidate.alternate_contact_no",
              college_email: "$$candidate.college_email",
              program: "$$candidate.program",
              degree: "$$candidate.degree",
              department: "$$candidate.department",
              cgpa: { $toString: { $arrayElemAt: ["$$candidate.cgpa", 0] } },
              matric_marks: {
                $toString: { $arrayElemAt: ["$$candidate.matric_marks", 0] },
              },
              senior_marks: {
                $toString: { $arrayElemAt: ["$$candidate.senior_marks", 0] },
              },
              resume_url: "$$candidate.resume_url",
            },
          },
        },
      },
    },
  ])
    .then((company) => {
      res.status(200).json({ success: true, company: company[0] });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(200)
        .json({ success: false, message: "Something went wrong!" });
    });
};
exports.allApplied = (req, res) => {
  const _p = req.params;

  Company.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(_p.company_id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "candidates.college_id",
        foreignField: "college_id",
        as: "registered_candidates",
      },
    },
    {
      $project: {
        company_name: 1,
        "registered_candidates.student_name": 1,
        "registered_candidates.college_id": 1,
        "registered_candidates.alternate_contact_no": 1,
        "registered_candidates.college_email": 1,
        "registered_candidates.program": 1,
        "registered_candidates.degree": 1,
        "registered_candidates.department": 1,
        "registered_candidates.cgpa": 1,
        "registered_candidates.matric_marks": 1,
        "registered_candidates.senior_marks": 1,
        "registered_candidates.resume_url": 1,
      },
    },
  ])
    .then((companies) => {
      if (companies.length === 0) {
        return res
          .status(200)
          .json({ success: false, message: "Company not found" });
      }

      const company = companies[0];
      company.registered_candidates.forEach((candidate) => {
        candidate.cgpa = candidate.cgpa ? candidate.cgpa.toString() : "";
        candidate.senior_marks = candidate.senior_marks
          ? candidate.senior_marks.toString()
          : "";
        candidate.matric_marks = candidate.matric_marks
          ? candidate.matric_marks.toString()
          : "";
      });

      res.status(200).json({ success: true, company: company });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(200)
        .json({ success: false, message: "Something went wrong!" });
    });
};
