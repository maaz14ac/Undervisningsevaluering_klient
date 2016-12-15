$(document).ready(function () {
    //Henter eventuelle kurser forbundet til brugeren ved load.
    getCourses();

    $('#logoutButton').on('click', function () {
        logout();
    });

    $(document).on('click', '#showLecture', function () {
        $("#lectureTableBody").empty();

        var $row = $(this).closest("tr"),
            $tds = $row.find("td:nth-child(2)").text();

        SDK.Storage.persist("courseId", $tds);

        $('#lectureRating').barrating({
            theme: 'fontawesome-stars-o',
            initialRating: null
        });

        getLectures();
    });

    $(document).on('click', '#commentButton', function () {
        var $row = $(this).closest("tr"),
            $tds = $row.find("td:nth-child(1)").text();

        SDK.Storage.persist("lectureId", $tds);

        getReviews();
    });

    $('#myModal').on('hidden.bs.modal', function (e) {
        $("#comments").empty();
    });

    $(document).on('click', '.deleteComment', function () {
        var id = $(this).attr("data-id");
        var userID = $(this).attr("data-user");

        deleteReview(id, userID);
    });

});

function logout() {
    SDK.logOut();
    window.location.href = "login.html";
}

function getCourses() {
    SDK.Course.getAll(function (err, data) {
            if (err) throw err;

            var courseNr = 1;
            var $courseTableBody = $("#courseTableBody");
            var decrypted = $.parseJSON(SDK.Decrypt(data));

            decrypted.forEach(function (course) {

                $courseTableBody.append(
                    "<tr>" +
                    "<td>" + courseNr + "</td>" +
                    "<td>" + course.displaytext + "</td>" +
                    "<td>" + course.code + "</td>" +
                    "<td><button type='button' id='showLecture' class='btn btn-default'>Vis</button></td>" +
                    "</tr>");
                courseNr++
            });
        }
    );
}

function getLectures() {
    SDK.Lecture.getAll(function (err, data) {
            if (err) throw err;

            var $lectureTableBody = $("#lectureTableBody");
            var decrypted = $.parseJSON(SDK.Decrypt(data));

            decrypted.forEach(function (lecture) {
                $lectureTableBody.append(
                    "<tr>" +
                    "<td>" + lecture.id + "</td>" +
                    "<td>" + lecture.type + "</td>" +
                    "<td>" + lecture.description + "</td>" +
                    "<td>" + lecture.startDate + "</td>" +
                    "<td>" + lecture.endDate + "</td>" +
                    "<td><button type='button' class='btn btn-default' data-toggle='modal' data-target='#myModal' id='commentButton'>Se bedømmelser og kommentarer</button></td>" +
                    "</tr>");
            });
        }
    );
}

function getReviews(){
    SDK.Review.getAll(function (err, data) {
            if (err){
                $('#lectureRating').barrating({
                    theme: 'fontawesome-stars-o',
                    initialRating: null
                });

                $("#comments").append("<h4 class='text-center'>Der er ingen bedømmelser eller kommentarer...</h4>");

                throw err;
            }
            var decrypted = $.parseJSON(SDK.Decrypt(data));
            var commentDiv = $("#comments");
            var starID = 1;

            decrypted.forEach(function (decrypted) {
                commentDiv.append(
                    "<div class='media'>" +
                    "<div class='media-left'>" +
                    "<a href=#'>" +
                    "<img class='media-object' src='img/User-64.png' alt='...'>" +
                    "</a>" +
                    "</div>" +
                    "<div class='media-body'>" +
                    "<select class='media-heading submittedRating' id='star" + starID + "'>" +
                    "<option value=''></option>" +
                    "<option value='1'>1</option>" +
                    "<option value='2'>2</option>" +
                    "<option value='3'>3</option>" +
                    "<option value='4'>4</option>" +
                    "<option value='5'>5</option>" +
                    "</select>" +
                    decrypted.comment +
                    "<br>" +
                    "<button type='button' class='btn btn-danger btn-xs deleteComment' style='margin-top: 8px;' data-id='" + decrypted.id + "' data-user='" + decrypted.userId + "'><i class='fa fa-trash-o' aria-hidden='true'></i> Slet kommentar</button>" +
                    "</div>" +
                    "</div>");
                $('.submittedRating').barrating({
                    theme: 'fontawesome-stars-o',
                    readonly: true,
                    silent: false
                });
                $("#star" + starID).barrating("set", decrypted.rating);
                if(decrypted.comment === ''){
                    $('[data-id="'+ decrypted.id +'"]').hide();
                }
                starID++
            });
        }
    );
}

function deleteReview(id, userID) {
    var data = {
        id: id,
        userId: userID
    };

    SDK.Review.deleteComment(data, function (err, data) {
            if (err) throw err;

            console.log(id + " " + userID);
            location.reload();
        }
    );
}