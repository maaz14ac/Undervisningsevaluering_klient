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

    $(document).on('click', '#submitReview', function () {
        createReview();
    });

    $('#myModal').on('hidden.bs.modal', function (e) {
        $("#comments").empty();
        $("#inputComment").val("");
    });

    $(document).on('click', '#deleteComment', function () {
        deleteReview();
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
                    "<td><button type='button' class='btn btn-default' data-toggle='modal' data-target='#myModal' id='commentButton'>Bedøm eller kommentér</button></td>" +
                    "</tr>");
            });
        }
    );
}

function getReviews(){
    SDK.Review.getAll(function (err, data) {
            if (err){
                $(".form-horizontal").show();
                $("#submitReview").show();
                $("#deleteComment").hide();

                $('#lectureRating').barrating({
                    theme: 'fontawesome-stars-o-o',
                    initialRating: null
                });

                $("#comments").append("<h4 class='text-center'>Der er ingen bedømmelser og/eller kommentarer...</h4>");

                throw err;
            }
            var decrypted = $.parseJSON(SDK.Decrypt(data));
            var commentDiv = $("#comments");
            console.log(decrypted);
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
                    "</div>" +
                    "</div>");
                $('.submittedRating').barrating({
                    theme: 'fontawesome-stars-o',
                    readonly: true,
                    silent: false
                });
                $("#star" + starID).barrating("set", decrypted.rating);

                if(decrypted.userId != "" && decrypted.userId == SDK.Storage.load("userId")){
                    $(".form-horizontal").hide();
                    $("#submitReview").hide();
                    $("#deleteComment").show();
                    $("#deleteComment").attr("data-id", decrypted.id);
                }else{
                    $("#deleteComment").hide();
                }
                starID++
            });
        }
    );
}

function createReview() {
    var rating = $("#lectureRating").val();

    if(rating === ""){
        rating = 0;
    }

    var comment = $("#inputComment").val();
    var lecture = SDK.Storage.load("lectureId");
    var userID = SDK.Storage.load("userId");


    var review = {
        userId: userID,
        lectureId: lecture,
        rating: rating,
        comment: comment
    };

    SDK.Review.create(review, function (err, data) {
            if (err) throw err;
            location.reload();
        }
    );
}

function deleteReview() {
    var id = $("#deleteComment").attr("data-id");
    var userID = SDK.Storage.load("userId");

    var data = {
        id: id,
        userId: userID,
    };

    SDK.Review.delete(data, function (err, data) {
            if (err) throw err;
            location.reload();
        }
    );
}