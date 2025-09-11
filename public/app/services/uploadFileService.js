angular.module('uploadFileService', [])
.service('uploadFile', function ($http) {
    // Upload Student Resume
    this.uploadStudentResume = function (file) {
        let fd = new FormData();
        fd.append('resume', file.resume);
        return $http.post('/api/upload/resume', fd, {
            transformRequest: angular.identity,
            headers: { 'content-type': undefined }
        });
    };
})
.service('uploadProfilePic', function ($http) {
    // Upload Student Profile Picture
    this.uploadStudentProfilePic = function (file) {
        let fd = new FormData();
        fd.append('profilePic', file.profilePic);
        return $http.post('/api/upload/profilepic', fd, {
            transformRequest: angular.identity,
            headers: { 'content-type': undefined }
        });
    };
});
