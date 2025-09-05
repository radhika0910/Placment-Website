const Student = require("../models/user.model");
const nodemailer = require("nodemailer");

const templateService = require("../services/template.service");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "radhikabhoyarbusiness@gmail.com",
    pass: "nbxvnbsixuufxkfp",
  },
});

async function sendDM(user, mailType) {
  try {
    console.log("Calling Mailer service with payload ", JSON.stringify(user));
    const opts = templateService.getEmailOpts(user, mailType);
    const data = await transporter.sendMail(opts);
    return { success: true, message: "Email sent.", data: data };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      message: "Email service not working.",
      error: err,
    };
  }
}

async function sendDMWithSubject(user, mailType, subject, content) {
  try {
    console.log("Calling Mailer service with payload ", JSON.stringify(user));
    const email = user.email;
    console.log("email--->", email);

    // Try to find user by college_email or alternate_email
    let userDoc = await Student.findOne({
      $or: [
        { college_email: email },
        { alternate_email: email }
      ]
    }).select("student_name");

    let nameToUse = "Student";
    if (userDoc && userDoc.student_name) {
      nameToUse = userDoc.student_name;
    }

    const emailData = {
      recipient: user.email,
      name: nameToUse,
      subject: subject,
      content: content,
    };

    console.log("user-->data", emailData);
    const opts = templateService.getEmailOpts(emailData, mailType);
    const data = await transporter.sendMail(opts);
    return { success: true, message: "Email sent.", data: data };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      message: "Email service not working.",
      error: err,
    };
  }
}

async function sendBulkEmails(recipients, subject, content) {
  for (const recipient of recipients) {
    const user = { email: recipient };
    console.log(user, "subject-->", subject);
    const mailType = "notification"; // Adjust the mail type as needed
    const result = await sendDMWithSubject(user, mailType, subject, content);
    console.log(`Email sent to ${recipient}`);
  }
}

module.exports = { sendBulkEmails, sendDM };
