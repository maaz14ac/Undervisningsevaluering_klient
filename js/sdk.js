var SDK = {

    serverURL: "http://localhost:8080/api",

    request: function (options, cb) {

        //Perform XHR
        $.ajax({
            url: SDK.serverURL + options.url,
            method: options.method,
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(options.data),
            success: function (data, status, xhr) {
                cb(null, data, status, xhr);
            },
            error: function (xhr, status, errorThrown) {
                cb({xhr: xhr, status: status, error: errorThrown});
            }
        });
    },

    /**
    * Henter kurser ned, som en bruger er tilmeldt.
    * */
    Course: {
        getAll: function (cb) {
            SDK.request({method: "GET", url: "/course/" + SDK.Storage.load("userId")}, cb);
        }
    },

    /**
     * Henter, opretter og sletter "reviews" på lektioner.
     * */
    Review: {
        getAll: function (cb) {
            SDK.request({method: "GET", url: "/review/" + SDK.Storage.load("lectureId")}, cb);
        },
        create: function (data, cb) {
            SDK.request({
                method: "POST",
                url: "/student/review",
                data: data
            }, cb);
        },
        delete: function (data, cb) {
            SDK.request({
                method: "DELETE",
                url: "/student/review",
                data: data
            }, cb);
        }
    },

    /**
     * Henter lektioner ned for et specifikt kursus.
     * */
    Lecture: {
        getAll: function (cb) {
            SDK.request({method: "GET", url: "/lecture/" + SDK.Storage.load("courseId")}, cb);
        }
    },

    /**
     * Henter brugeren ned, som man er logget ind med.
     * */
    User: {
        current: function () {
            return SDK.Storage.load("user");
        }
    },

    /**
     * Fjerner bruger data fra localStorage i forbindelse med at man logger ud.
     * */
    logOut: function () {
        SDK.Storage.remove("userId");
        SDK.Storage.remove("userType");
        SDK.Storage.remove("user");
    },

    login: function (email, password, cb) {
        this.request({
            data: {
                cbsMail: email,
                password: password
            },
            url: "/login",
            method: "POST"
        }, function (err, data) {

            //On login-error
            if (err) return cb(err);

            var user = JSON.parse(atob(data));

            SDK.Storage.persist("userId", user.id);
            SDK.Storage.persist("userType", user.type);

            cb(null, data);

            if (user.type == "student") {
                window.location.href = "student.html";
            } else if (user.type == "teacher") {
                window.location.href = "underviser.html";
            }
            else if (user.type == "admin") {
                window.location.href = "admin.html";
            }

        });
    },

    /**
     * Initialisere localStorage.
     * */
    Storage: {
        prefix: "ProjectCBS_SDK",
        persist: function (key, value) {
            window.localStorage.setItem(this.prefix + key, (typeof value === 'object') ? JSON.stringify(value) : value)
        },
        load: function (key) {
            var val = window.localStorage.getItem(this.prefix + key);
            try {
                return JSON.parse(val);
            }
            catch (e) {
                return val;
            }
        },
        remove: function (key) {
            window.localStorage.removeItem(this.prefix + key);
        }
    }
};