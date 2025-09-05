angular
  .module("studentController", [
    "studentServices",
    "textAngular",
    "fileModelDirective",
    "uploadFileService",
  ])

  // Company Registration Controller
  .controller("companyRegistrationCtrl", function (student, admin, $scope) {
    let app = this;
    app.noUpcomingCompanies = false;
    app.fetchedUpcomingCompanies = false;

    // Get all upcoming companies
    function getAllUpcomingCompaniesFunction() {
      student.getAllUpcomingCompanies().then(function (data) {
        if (data.data.success) {
          app.upcomingCompanies = data.data.companies;
          app.fetchedUpcomingCompanies = true;
          app.noUpcomingCompanies = app.upcomingCompanies.length === 0;
        }
      });
    }

    getAllUpcomingCompaniesFunction();

    // update admin's passout batch
    $scope.updateBatch = function (batch) {
      app.fetchedUpcomingCompanies = false;

      admin.updateAdminBatch(batch).then(function (data) {
        if (data.data.success) {
          getAllUpcomingCompaniesFunction();
        }
      });
    };
  })

  // Previous Companies controller
  .controller("previousCompaniesCtrl", function (student, $scope, admin) {
    let app = this;

    app.noPreviousCompanies = false;
    app.fetchedPreviousCompanies = false;

    function getAllPreviousCompaniesFunction() {
      student.getAllPreviousCompanies().then(function (data) {
        if (data.data.success) {
          app.previousCompanies = data.data.companies;
          app.fetchedPreviousCompanies = true;
          app.noPreviousCompanies = app.previousCompanies.length === 0;
        }
      });
    }

    // Get All Previous Companies Function
    getAllPreviousCompaniesFunction();

    // update admin's passout batch
    $scope.updateBatch = function (batch) {
      app.fetchedUpcomingCompanies = false;

      admin.updateAdminBatch(batch).then(function (data) {
        if (data.data.success) {
          getAllPreviousCompaniesFunction();
        }
      });
    };
  })

  // company controller
  .controller("companyCtrl", function (student, $routeParams, $scope) {
    let app = this;

    app.applyStatus = false;
    app.deleteSuccessMsg = "";
    app.missedLastDate = true;
    app.fetchedCompanyDetails = false;

    function checkDateDifference(deadline) {
      let deadline_date = new Date(deadline);
      let today = new Date();

      //console.log(deadline_date.getTime());
      //console.log(today.getTime());

      if (deadline_date.getTime() <= today.getTime()) {
        return true;
      } else {
        return false;
      }
    }

    student.getCompanyDetails($routeParams.company_id).then(function (data) {
      if (data.data.success) {
        app.companyDetail = data.data.companyDetail;
        convertAllDateStringsToDateObj(app.companyDetail);
        app.fetchedCompanyDetails = true;
        if (checkDateDifference(app.companyDetail.deadline_date) === true) {
          app.missedLastDate = true;
        } else {
          app.missedLastDate = false;
        }
      }
    });

    // Convert all date strings to date objects for editing
    function convertAllDateStringsToDateObj(company) {
      if ("selection_process" in company) {
        if ("pre_placement_talk" in company.selection_process) {
          if ("date" in company.selection_process.pre_placement_talk) {
            if (company.selection_process.pre_placement_talk.date == null) {
              app.companyDetail.selection_process.pre_placement_talk.date = "";
            } else {
              app.companyDetail.selection_process.pre_placement_talk.date =
                new Date(company.selection_process.pre_placement_talk.date);
            }
          }
        }
        if ("aptitude_test" in company.selection_process) {
          if ("date" in company.selection_process.aptitude_test) {
            if (company.selection_process.aptitude_test.date == null) {
              app.companyDetail.selection_process.aptitude_test.date = "";
            } else {
              app.companyDetail.selection_process.aptitude_test.date = new Date(
                company.selection_process.aptitude_test.date
              );
            }
          }
        }
        if ("technical_test" in company.selection_process) {
          if ("date" in company.selection_process.technical_test) {
            if (company.selection_process.technical_test.date == null) {
              app.companyDetail.selection_process.technical_test.date = "";
            } else {
              app.companyDetail.selection_process.technical_test.date =
                new Date(company.selection_process.technical_test.date);
            }
          }
        }
        if ("group_discussion" in company.selection_process) {
          if ("date" in company.selection_process.group_discussion) {
            if (company.selection_process.group_discussion.date == null) {
              app.companyDetail.selection_process.group_discussion.date = "";
            } else {
              app.companyDetail.selection_process.group_discussion.date =
                new Date(company.selection_process.group_discussion.date);
            }
          }
        }
        if ("personal_interview" in company.selection_process) {
          if ("date" in company.selection_process.personal_interview) {
            if (company.selection_process.personal_interview.date == null) {
              app.companyDetail.selection_process.personal_interview.date = "";
              //console.log(app.companyDetail.selection_process.personal_interview.date)
            } else {
              app.companyDetail.selection_process.personal_interview.date =
                new Date(company.selection_process.personal_interview.date);
            }

            app.companyDetail.selection_process.personal_interview.date =
              new Date(company.selection_process.personal_interview.date);
          }
        }
      }
      if ("joining_date" in company) {
        if ("joining_date" in company) {
          if (company.joining_date == null) {
            app.companyDetail.joining_date = "";
          } else {
            app.companyDetail.joining_date = new Date(company.joining_date);
          }
        }
      }
      if (company.deadline_date) {
        app.companyDetail.deadline_date = new Date(company.deadline_date);
      }
    }

    app.notMarkedAttendance = false;

    function getCandidateApplyStatusFunction() {
      student
        .getCandidateApplyStatus($routeParams.company_id)
        .then(function (data) {
          if (data.data.success) {
            app.applyStatus = true;
            document.getElementById("oneClickApplyButton").className =
              "btn btn-danger btn-rounded";
            document.getElementById("oneClickApplyButton").innerHTML =
              data.data.status + " Successfully!";
            if (data.data.status === "Applied") {
              app.notMarkedAttendance = true;
            } else {
              app.notMarkedAttendance = false;
            }
          } else {
            app.applyStatus = false;
            document.getElementById("oneClickApplyButton").className =
              "btn btn-success btn-rounded";
            document.getElementById("oneClickApplyButton").innerHTML =
              "One Click Apply";
          }
        });
    }

    getCandidateApplyStatusFunction();

    app.oneClickApply = function () {
      document.getElementById("oneClickApplyButton").className =
        "btn btn-primary btn-rounded";
      document.getElementById("oneClickApplyButton").innerHTML =
        "Applying.....Please wait!!";
      document.getElementById("oneClickApplyButton").disabled = true;
      student.oneClickApply($routeParams.company_id).then(function (data) {
        if (data.data.success) {
          getCandidateApplyStatusFunction();
        } else {
          app.errorMsg = data.data.message;
          app.applyStatus = false;
          document.getElementById("oneClickApplyButton").disabled = false;
          document.getElementById("oneClickApplyButton").className =
            "btn btn-success btn-rounded";
          document.getElementById("oneClickApplyButton").innerHTML =
            "One Click Apply";
        }
      });
    };

    app.withdrawApplication = function () {
      student
        .withdrawApplication($routeParams.company_id)
        .then(function (data) {
          if (data.data.success) {
            getCandidateApplyStatusFunction();
          }
        });
    };

    app.attendanceStatus = false;
    app.company_otp = "";

    function getAttendanceStatus() {
      student
        .getAttendanceStatus($routeParams.company_id)
        .then(function (data) {
          //console.log(data);
          if (data.data.success) {
            app.attendanceStatus = data.data.attendanceStatus;
            app.company_otp = data.data.company_otp;
          }
        });
    }

    getAttendanceStatus();

    app.updateAttendanceStatus = function () {
      student
        .updateAttendanceStatus($routeParams.company_id)
        .then(function (data) {
          //console.log(data);
          if (data.data.success) {
            getAttendanceStatus();
          }
        });
    };

    app.markCompanyAttendanceSuccessMsg = "";
    app.markCompanyAttendanceErrorMsg = "";

    app.markCompanyAttendance = function (attendanceData) {
      student
        .markCompanyAttendance(app.attendanceData, $routeParams.company_id)
        .then(function (data) {
          //console.log(data);
          if (data.data.success) {
            app.markCompanyAttendanceSuccessMsg = data.data.message;
            getCandidateApplyStatusFunction();
          } else {
            app.markCompanyAttendanceErrorMsg = data.data.message;
          }
        });
    };

    app.doneWithAttendance = function () {
      student.doneWithAttendance($routeParams.company_id).then(function (data) {
        //console.log(data);
        if (data.data.success) {
          getAttendanceStatus();
          /*student.sendEmailToAbsentAndMarkRedFlag($routeParams.company_id).then(function (data) {
                    //console.log(data);
                    if(data.data.success) {
                        getAttendanceStatus();
                    }
                });*/
        }
      });
    };
  })

  .controller("announcementsCtrl", function (student, admin, $scope) {
    let app = this;

    app.notZeroAnnouncements = false;
    app.fetchedAnnouncements = false;

    // update admin's passout batch
    $scope.updateBatch = function (batch) {
      admin.updateAdminBatch(batch).then(function (data) {
        if (data.data.success) {
          app.fetchedAnnouncements = false;
          getAnnouncementsFunction();
        }
      });
    };

    // Get all announcements
    function getAnnouncementsFunction() {
      student.getAnnouncements().then(function (data) {
        // console.log(data);
        if (data.data.success) {
          // console.log("heidie");
          app.announcements = data.data.announcements;
          app.fetchedAnnouncements = true;
          app.notZeroAnnouncements = data.data.announcements.length > 0;
        }
      });
    }

    getAnnouncementsFunction();

    app.successMsg = false;
    app.errorMsg = false;
    app.postingAnnouncementsLoading = false;

    // Admin Stuff of posting announcement
    app.postAnnouncement = function (announcementData) {
      //console.log(announcementData);
      app.postingAnnouncementsLoading = true;

      admin.postAnnouncement(announcementData).then(function (data) {
        //console.log(data);
        if (data.data.success) {
          app.successMsg = data.data.message;
          app.postingAnnouncementsLoading = false;
          getAnnouncementsFunction();
        } else {
          app.errorMsg = data.data.message;
          app.postingAnnouncementsLoading = false;
        }
      });
    };
  })
  .controller("filterStudentCtrl", function (student, admin, $scope, $window) {
    let app = this;

    app.getStudent = function (filterCriteria) {
      console.log(filterCriteria, "I am hereeeeee");
      admin
        .getStudent(filterCriteria)
        .then(function (response) {
          console.log("here is the response", response.data.students);
          $scope.students = response.data.students;
        })
        .catch(function (error) {
          console.log(error);
        });
    };

    app.downloadCSV = function () {
      let csvContent = "data:text/csv;charset=utf-8,";
      let headers = [
        "Email",
        "Name",
        "Department",
        "Passout Batch",
        "CGPA",
        "Back",
        "10th %",
        "12th %",
        "Placement Status",
        "Contact Number",
        "Resume URL",
      ];
      csvContent += headers.join(",") + "\r\n";
      $scope.students.forEach(function (student) {
        let row = [];
        row.push(student.college_id + "@GHRCE.in");
        row.push(student.student_name);
        row.push(student.department);
        row.push(student.passout_batch);
        row.push(student.cgpa); // Convert cgpa to string
        row.push(student.Back);
        row.push(student.matric_marks); // Convert matric_marks to string
        row.push(student.senior_marks);
        row.push(student.placement_status);
        row.push(student.contact_no);
        row.push(student.resume_url);
        csvContent += row.join(",") + "\r\n";
      });
      let encodedUri = encodeURI(csvContent);
      let link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "filtered_students.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  })
  //bulk mail controller
  .controller("bulkMailCtrl", function ($scope, admin, $http, $window) {
    let app = this;
    app.extractedEmails = [];

    app.sendBulkEmail = function (mailcriteria) {
      let file = mailcriteria.excelFile;
      let reader = new FileReader();

      reader.onload = function (e) {
        let data = new Uint8Array(e.target.result);
        let workbook = XLSX.read(data, { type: "array" });
        let worksheet = workbook.Sheets[workbook.SheetNames[0]];
        let jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: true,
        });
        if (jsonData.length > 0 && jsonData[0].Email !== undefined) {
          let emailAddresses = jsonData.map(function (item) {
            return item.Email;
          });

          app.extractedEmails = emailAddresses;

          let emailData = {
            recipients: emailAddresses,
            subject: mailcriteria.subject,
            content: mailcriteria.content,
          };

          admin.sendMail(emailData);
          $scope.$apply(function () {
            $scope.isEmailColumnRequired = false; // Hide the validation message
          });
          // Rest of the code
        } else {
          // Invalid file, display validation message
          console.log("reaching ehereererere");
          $scope.$apply(function () {
            $scope.isEmailColumnRequired = true; // Show the validation message
          });
        }
      };

      reader.readAsArrayBuffer(file);
    };
  })

  // User Profile Controller
  .controller("profileCtrl", function (student, $timeout, $scope, uploadFile) {
    let app = this;

    // Success - Error Messages
    app.profileUpdateSuccessMsg = "";
    app.profileUpdateErrorMsg = "";

    // getting user profile
    function getUserProfileFunction() {
      student.getUserProfile().then(function (data) {
        //console.log(data.data.profile);
        if (data.data.success) {
          app.userProfile = data.data.profile;
        }
      });
    }

    // get Student Profile
    getUserProfileFunction();

    // User user profile
    app.updateProfile = function (profileData) {
      // loading
      app.profileUpdateLoadingMsg = true;
      app.profileUpdateSuccessMsg = "";
      app.profileUpdateErrorMsg = "";

      // API call
      student.updateProfile(app.profileData).then(function (data) {
        if (data.data.success) {
          app.profileUpdateSuccessMsg = data.data.message;
          app.profileUpdateLoadingMsg = false;
          // Remove Message after 3 seconds
          $timeout(function () {
            app.profileUpdateSuccessMsg = "";
          }, 3000);
        } else {
          app.profileUpdateErrorMsg = data.data.message;
          app.profileUpdateLoadingMsg = false;
        }
      });
    };
    
app.registerUser = function (userData) {
        app.registerUserSuccessMsg = false;
        app.registerUserErrorMsg = false;

        student.registerUser(userData).then(function (data) {
            if (data.data.success) {
                app.registerUserSuccessMsg = data.data.message;
            } else {
                app.registerUserErrorMsg = data.data.message;
            }
        });
    };
    

    // Resume Loading/Error/Success Message
    app.resumeUploadLoading = false;
    app.resumeUploadErrorMsg = "";
    app.resumeUploadSuccessMsg = "";

    // Upload Student Resume
    app.updateStudentResume = function () {
      // Loading & Error Msg
      app.resumeUploadLoading = true;
      app.resumeUploadErrorMsg = "";

      // Upload Resume to Server.
      uploadFile.uploadStudentResume($scope.file).then(function (data) {
        if (data.data.success) {
          // Uploaded Resume
          app.resumeUploadSuccessMsg = data.data.message;
          app.resumeUploadLoading = false;66
          getUserProfileFunction();
        } else {
          // Something went wrong!
          app.resumeUploadErrorMsg = data.data.message;
          app.resumeUploadLoading = false;
        }
      });
    };
  })
  // User timeline controller
  .controller("timelineCtrl", function (student) {
    let app = this;
    app.timelineLengthZero = false;
    // get student timeline controller function
    student.getTimeline().then(function (data) {
      // Loading timeline message
      app.getTimelineLoadingMsg = true;
      if (data.data.success) {
        app.getTimelineLoadingMsg = false;
        app.timeline = data.data.timeline;
        if (app.timeline.length === 0) {
          app.timelineLengthZero = true;
        } else {
          app.timelineLengthZero = false;
        }
      } else {
        app.errorMsg = data.data.message;
        app.getTimelineLoadingMsg = false;
      }
    });
  })

  // technical controller
  .controller("technicalCtrl", function (student) {
    let app = this;

    app.feedbackTitle = "";
    app.successMsg = "";
    app.errorMsg = "";

    app.selectFeedbackBox = function (id) {
      document.getElementById(id).className = "btn btn-" + id;
      if (id === "danger") {
        app.feedbackTitle = "bug";
        document.getElementById("info").className = "btn btn-outline-info";
        document.getElementById("primary").className =
          "btn btn-outline-primary";
      } else if (id === "info") {
        app.feedbackTitle = "suggestion";
        document.getElementById("danger").className = "btn btn-outline-danger";
        document.getElementById("primary").className =
          "btn btn-outline-primary";
      } else {
        app.feedbackTitle = "compliment";
        document.getElementById("info").className = "btn btn-outline-info";
        document.getElementById("danger").className = "btn btn-outline-danger";
      }
    };

    // Send feedback function
    app.sendFeedback = function (feedbackData) {
      app.loading = true;
      app.errorMsg = "";

      if (!app.feedbackTitle) {
        app.errorMsg = "Select one category!";
        app.loading = false;
      } else {
        //  Set Title
        app.feedbackData.title = app.feedbackTitle;

        student.sendFeedback(app.feedbackData).then(function (data) {
          if (data.data.success) {
            app.successMsg = data.data.message;
            app.loading = false;
          } else {
            app.errorMsg = data.data.message;
            app.loading = false;
          }
        });
      }
    };
  })

  .controller("settingsCtrl", function (student) {
    let app = this;

    app.loading = false;

    app.changePassword = function (passwordData) {
      app.loading = true;
      app.successMsg = "";
      app.errorMsg = "";

      if (app.passwordData.new_password === app.passwordData.confirm_password) {
        student.changePassword(app.passwordData).then(function (data) {
          if (data.data.success) {
            app.loading = false;
            app.successMsg = data.data.message;
          } else {
            app.loading = false;
            app.errorMsg = data.data.message;
          }
        });
      } else {
        app.loading = false;
        app.errorMsg = "Confirm password did not match.";
      }
    };
  })

  .controller("interviewCtrl", function (student) {
    let app = this;

    // get all interview experiences
    student.getAllInterviewExperiences().then(function (data) {
      if (data.data.success) {
        app.interviews = data.data.interviews;
        app.fetchedInterviewExperiences = true;
      } else {
        app.fetchedInterviewExperiences = true;
        app.errorMsg = data.data.message;
      }
    });
  })

  // Get all Pending experiences
  .controller("pendingCtrl", function (student) {
    let app = this;

    // get all interview experiences
    student.getAllPendingInterviewExperiences().then(function (data) {
      if (data.data.success) {
        app.pending = data.data.interviews;
        app.fetchedInterviewExperiences = true;
      } else {
        app.fetchedInterviewExperiences = true;
        app.errorMsg = data.data.message;
      }
    });
  })

  // read experience ctrl
  .controller("experienceCtrl", function (student, $routeParams, admin) {
    let app = this;

    // get interview experience function
    function getInterviewExperience() {
      student.getExperience($routeParams.experience_id).then(function (data) {
        console.log(data);
        if (data.data.success) {
          app.experience = data.data.experience;
          app.fetchedInterviewExperience = true;
        } else {
          app.errorMsg = data.data.message;
          app.fetchedInterviewExperience = true;
        }
      });
    }

    getInterviewExperience();

    // change status of interview experience - admin stuff
    app.changeStatus = function () {
      app.loading = true;
      admin.changeStatus($routeParams.experience_id).then(function (data) {
        //console.log(data);
        if (data.data.success) {
          app.loading = false;
          app.errorMsg = "";
          app.successMsg = data.data.message;
          getInterviewExperience();
        } else {
          app.loading = false;
          app.successMsg = "";
          app.errorMsg = data.data.message;
        }
      });
    };
  })

  .controller("contributionsCtrl", function (student) {
    let app = this;

    // get all contributions of student
    student.getContributions().then(function (data) {
      //console.log(data);
      if (data.data.success) {
        app.interviews = data.data.interviews;
      } else {
        app.errorMsg = data.data.message;
      }
    });
  })

  .controller("composeCtrl", function ($scope, student) {
    let app = this;

    // Tags array
    app.tags = [];

    // Add tag to an array
    app.addTag = function (tag) {
      if (tag) {
        if (app.tags.indexOf(tag.toLowerCase()) === -1) {
          app.tags.push(tag.toLowerCase());
          $scope.tag = "";
          app.errorMsg = "";
        } else {
          app.errorMsg = "Tag already selected.";
        }
      } else {
        app.errorMsg = "Tag can't be empty!";
      }
    };

    // remove tag
    app.removeTag = function (tag) {
      app.tags.splice(app.tags.indexOf(tag.toLowerCase()), 1);
    };

    // add interview experience
    app.postInterviewExperience = function (experienceData) {
      if (app.tags.length === 0) {
        app.errorMsg = "Tags can't be empty!";
      } else {
        app.loading = true;
        app.experienceData.tags = app.tags;
        //console.log(app.experienceData);
        student
          .postInterviewExperience(app.experienceData)
          .then(function (data) {
            //console.log(data);
            if (data.data.success) {
              app.loading = false;
              app.successMsg = data.data.message;
            } else {
              app.loading = false;
              app.errorMsg = data.data.message;
            }
          });
      }
    };
  })

  // Notifications Controller
  .controller("notificationsCtrl", function (admin, student) {
    let app = this;

    // get notifications
    admin.getNotifications().then(function (data) {
      if (data.data.success) {
        app.notifications = data.data.notifications;
        wipeNotifications();
      } else {
        app.errorMsg = data.data.message;
      }
    });

    // wipe all notifications as well
    function wipeNotifications() {
      student.wipeNotifications().then(function (data) {
        if (data.data.success) {
          app.successMsg = data.data.message;
        } else {
          app.errorMsg = data.data.message;
        }
      });
    }
  })

  // achievements controller
  .controller("achievementsCtrl", function (student) {
    let app = this;

    function getAchievements() {
      app.loading = true;
      student.getAchievements().then(function (data) {
        if (data.data.success) {
          app.loading = false;
          app.achievements = data.data.achievements;
        } else {
          app.loading = false;
          app.errorMsg = data.data.message;
        }
      });
    }

    getAchievements();
  })

  // red flag history
  .controller("redFlagHistoryCtrl", function (student) {
    let app = this;

    student.getMyRedFlagHistory().then(function (data) {
      if (data.data.success) {
        app.redFlagHistory = data.data.redFlagHistory;
        app.redFlags = data.data.redFlags;
        app.fetchedRedFlagHistory = true;
      } else {
        app.errorMsg = data.data.message;
      }
    });
  })

  // placements controller
  .controller("placementsCtrl", function (admin) {
    let app = this;

    function generatePlacements(placements) {
      let companies = [];
      let degrees = [];
      let branches = {};

      placements.forEach((placement) => {
        companies.push(placement.company_name);

        placement.department = placement.students[0].department;
        placement.degree = placement.students[0].degree;

        degrees.push(placement.degree);

        if (branches.hasOwnProperty(placement.degree)) {
          branches[placement.degree].push(placement.department);
          branches[placement.degree] = [...new Set(branches[placement.degree])];
        } else {
          branches[placement.degree] = [placement.department];
        }
      });

      companies = [...new Set(companies)];
      degrees = [...new Set(degrees)];

      return {
        placements,
        companies,
        degrees,
        branches,
      };
    }

    function getPlacementsData() {
      app.loading = true;
      admin.getPlacementsData().then(function (data) {
        if (data.data.success) {
          app.loading = false;
          let result = generatePlacements(data.data.placements);
          app.placements = result.placements;
          app.companies = result.companies;
          app.degrees = result.degrees;
          app.branches = result.branches;
          console.log(app.placements);
          //app.placements = data.data.placements;
        } else {
          app.loading = false;
          app.errorMsg = data.data.message;
        }
      });
    }

    getPlacementsData();
  })

  // Placement Stats Controller
  .controller("placementStatsCtrl", function ($scope) {
    let app = this;

    app.placements = [
      {
        "B.Tech.": [
          {
            "S.No.": "1",
            Name: "dummy1",
            "College ID": "158456952",
            Branch: "CT",
            Company: "dummyCompany",
            Package: "10",
            "Company visited on": "PPO",
            "Result Date": "3 August",
          },
        ],
      },
    ];

    // status
    app.selectedProgram = "B.Tech.";
    app.selectedBranch = "";
    app.programs = [];
    app.branches = [];
    app.students = [];

    // all programs
    app.placements.forEach(function (program) {
      app.programs.push(Object.keys(program)[0]);
    });

    app.programs = [...new Set(app.programs)];

    // change branch method
    $scope.changedProgram = function () {
      app.placements.forEach(function (program) {
        if (Object.keys(program)[0] === app.selectedProgram) {
          app.students = [...new Set(Object.values(program)[0])];
          //console.log(app.students);
          app.branches = [];

          app.students.forEach(function (student) {
            //console.log(student.Branch);
            app.branches.push(student.Branch);
          });
          app.branches = [...new Set(app.branches)];
          //console.log(app.branches);
        }
      });
    };

    $scope.changedProgram();

    // change branch
    $scope.changeBranch = function () {
      $scope.changedProgram();

      if (app.selectedBranch.length > 0) {
        app.students = app.students.filter(function (student) {
          return student.Branch === app.selectedBranch;
        });
      }
    };
  });

  
