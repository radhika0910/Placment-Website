function resumes(data) {
    let files = [];

    data.forEach(function (student) {
        let file = {};

        // File name format
        file.name = student.student_name.split(' ').join('_') + '_' + student.college_id + '.pdf';
        file.path = __basedir + '/public/assets/uploads/resumes/' + student.resume_url;

        files.push(file);
    });

    return files;
}

function profilePics(data) {
    let files = [];

    data.forEach(function (student) {
        let file = {};

        // If profile picture is uploaded, use it
        if (student.profilePic_url) {
            file.name = student.student_name.split(' ').join('_') + '_' + student.college_id + '.jpg'; 
            file.path = __basedir + '/public/assets/uploads/profilepics/' + student.profilePic_url;
        } else {
            // Default image (gender-based fallback)
            file.name = student.student_name.split(' ').join('_') + '_' + student.college_id + '_default.png';
            file.path = __basedir + '/public/assets/images/profile/' + student.gender + '.png';
        }

        files.push(file);
    });

    return files;
}

exports.resumes = resumes;
exports.profilePics = profilePics;
