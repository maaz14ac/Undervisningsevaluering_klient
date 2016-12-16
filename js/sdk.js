/**
 * En SDK over de grundlæggende AJAX-anmodninger. Udviklet på baggrund
 * af Jesper Bruun Hansens Javascript Crash Course @ CBS.
 * (https://github.com/Distribuerede-Systemer-2016/javascript-client)
 * */

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
        },
        getAvg: function (cb) {
            SDK.request({method: "GET", url: "/teacher/course/stat/" + SDK.Storage.load("courseId")}, cb);
        }
    },

    /**
     * Henter, opretter og sletter "reviews" på lektioner.
     * Sletter kommentarer på lektioner uden at berører rating.
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
        },
        deleteComment: function (data, cb) {
            SDK.request({
                method: "DELETE",
                url: "/admin/review",
                data: data
            }, cb);
        }
    },

    /**
     * Henter lektioner og et bedømmelses gennemsnit ned for et specifikt kursus.
     * */
    Lecture: {
        getAll: function (cb) {
            SDK.request({method: "GET", url: "/lecture/" + SDK.Storage.load("courseId")}, cb);
        },
        getAvg: function (cb) {
            SDK.request({method: "GET", url: "/teacher/lecture/stat/" + SDK.Storage.load("lectureId")}, cb);
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
    },

    /**
     * Metode til dekryptere den krypteret data fra serveren.
     * */
    Decrypt: function (string) {
        var Base64 = {
            _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            encode: function (e) {
                var t = "";
                var n, r, i, s, o, u, a;
                var f = 0;
                e = Base64._utf8_encode(e);
                while (f < e.length) {
                    n = e.charCodeAt(f++);
                    r = e.charCodeAt(f++);
                    i = e.charCodeAt(f++);
                    s = n >> 2;
                    o = (n & 3) << 4 | r >> 4;
                    u = (r & 15) << 2 | i >> 6;
                    a = i & 63;
                    if (isNaN(r)) {
                        u = a = 64
                    } else if (isNaN(i)) {
                        a = 64
                    }
                    t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
                }
                return t
            },
            decode: function (e) {
                var t = "";
                var n, r, i;
                var s, o, u, a;
                var f = 0;
                e = e.replace(/[^A-Za-z0-9+/=]/g, "");
                while (f < e.length) {
                    s = this._keyStr.indexOf(e.charAt(f++));
                    o = this._keyStr.indexOf(e.charAt(f++));
                    u = this._keyStr.indexOf(e.charAt(f++));
                    a = this._keyStr.indexOf(e.charAt(f++));
                    n = s << 2 | o >> 4;
                    r = (o & 15) << 4 | u >> 2;
                    i = (u & 3) << 6 | a;
                    t = t + String.fromCharCode(n);
                    if (u != 64) {
                        t = t + String.fromCharCode(r)
                    }
                    if (a != 64) {
                        t = t + String.fromCharCode(i)
                    }
                }
                t = Base64._utf8_decode(t);
                return t
            },
            _utf8_encode: function (e) {
                e = e.replace(/rn/g, "n");
                var t = "";
                for (var n = 0; n < e.length; n++) {
                    var r = e.charCodeAt(n);
                    if (r < 128) {
                        t += String.fromCharCode(r)
                    } else if (r > 127 && r < 2048) {
                        t += String.fromCharCode(r >> 6 | 192);
                        t += String.fromCharCode(r & 63 | 128)
                    } else {
                        t += String.fromCharCode(r >> 12 | 224);
                        t += String.fromCharCode(r >> 6 & 63 | 128);
                        t += String.fromCharCode(r & 63 | 128)
                    }
                }
                return t
            },
            _utf8_decode: function (e) {
                var t = "";
                var n = 0;
                var r = c1 = c2 = 0;
                while (n < e.length) {
                    r = e.charCodeAt(n);
                    if (r < 128) {
                        t += String.fromCharCode(r);
                        n++
                    } else if (r > 191 && r < 224) {
                        c2 = e.charCodeAt(n + 1);
                        t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                        n += 2
                    } else {
                        c2 = e.charCodeAt(n + 1);
                        c3 = e.charCodeAt(n + 2);
                        t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                        n += 3
                    }
                }
                return t
            }
        };
        return Base64.decode(string)
    }
};