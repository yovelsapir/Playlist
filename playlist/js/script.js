$(document).ready(() => {
    let url = "http://localhost:80/playlist-YovelSapir/playlist/api/playlist.php/playlist";
    $scope = (function () {
        return {
            playlist: (function () {
                playlistArray = [];
                return {
                    // ================== AJAX REQUESTS INTERACT =========================================== //
                    addPlaylistToDB: (title, image, songs) => {
                        return $.ajax({
                            dataType: 'json',
                            type: 'post',
                            url: `${url}?type=playlist`,
                            data: {
                                name: `${title}`,
                                image: `${image}`,
                                songs: songs
                            }
                        });
                    },
                    updatePlaylistInDB: (id, name, image) => {
                        return $.ajax({
                            dataType: 'json',
                            type: 'post',
                            url: `${url}?type=playlist&id=${id}`,
                            data: {
                                name: name,
                                image: image
                            }
                        });
                    },
                    updatePlaylistSongsInDB: (id, songs) => {
                        return $.ajax({
                            dataType: 'json',
                            type: 'post',
                            url: `${url}?id=${id}`,
                            data: {
                                songs: songs
                            }
                        });
                    },
                    removePlaylistFromDB: (id) => {
                        return $.ajax({
                            dataType: 'json',
                            type: 'delete',
                            url: `${url}?type=playlist&id=${id}`,
                            data: {
                                id: `${id}`
                            }
                        });
                    },
                    getPlaylistSongs: (id) => {
                        return $.ajax({
                            dataType: 'json',
                            type: 'get',
                            url: url + `?id=${id}/songs`
                        });
                    },
                    playlistsInit: () => {
                        return $.ajax({
                            type: 'get',
                            url: url + "?type=playlist",
                            dataType: 'json'
                        });
                    },
                    // ================== CLIENT ARRAY MANAGMANT =========================================== //
                    add: (id, name, image, songs) => {
                        //$scope.playlist.addDB(title, image, songs);
                        this.playlistArray.push({
                            id: id,
                            image: image,
                            name: name,
                            songs: songs
                        });
                        $scope.addPlaylist(id, name, image);
                        return this.playlistArray[id];
                    },
                    remove: (id) => {
                        $scope.playlist.removePlaylistFromDB(id).then(res => {
                            let playlist = $scope.playlist.findById(id);
                            $scope.removePlaylist(id);
                            this.playlistArray.splice(playlist.index, 1);
                        });
                    },
                    update: (id, title, image, songs) => {
                        Promise.all([
                            $scope.playlist.updatePlaylistInDB(id, title, image),
                            $scope.playlist.updatePlaylistSongsInDB(id, songs)
                        ]).then(results => {
                            $scope.updatePlaylist(id, title, image);
                            let playlist = $scope.playlist.findById(id);
                            this.playlistArray[playlist.index] = (() => {
                                return {
                                    id: id,
                                    name: title,
                                    image: image,
                                    songs: songs
                                }
                            })();
                        }, err => {
                            console.log(err);
                        });
                    },
                    all: () => this.playlistArray,
                    getPlaylistObject: (name, url, songsContainer) => {
                        return {
                            name: name,
                            url: url,
                            songs: (() => {
                                let songs = [];
                                $(songsContainer).each((index, elm) => {
                                    songs.push({
                                        name: $($(elm).find("input")[0]).val(),
                                        url: $($(elm).find("input")[1]).val()
                                    })
                                })
                                return songs;
                            })()
                        }
                    },
                    findById(id) { // find index in the array by the playlist id. 
                        let count = 0;
                        let result = $scope.playlist.all().find((elm, index) => {
                            count = index;
                            return elm.id == id;
                        });
                        return {
                            result: result,
                            index: count
                        };
                    },
                    getMaxId() { // not relevant yet.
                        let max = 0;
                        $scope.playlist.all().forEach((elm) => {
                            if (max < elm.id) {
                                max = elm.id;
                            }
                        });
                        return max;
                    }
                }
            })(),
            // ================== CLIENT DOM MANIPULATION =========================================== //
            removePlaylist: (id) => {
                if (id == parseInt($("#playlist-audio-container").val())) {
                    $("#playlist-audio-container").empty();
                }
                $(`#playlist_${id}`).remove();
            },
            updatePlaylist: (id, title, img) => {
                if (id == parseInt($("#playlist-audio-container").val())) {
                    $scope.createPlaylistAudio(id);
                }
                $(`#title_${id}`).text(title);
                $(`#playlist_img_${id}`).attr("src", img);
            },
            addPlaylist: (id, title, img) => {
                $("#playlist-container").append(`
                    <div class="col-md-3 col-md-sm-6 col-xs-12 col-lg-3 playlist_item" id="playlist_${id}">
                        <div class="playlist-body">
                            <div class="playlist-title text-center">
                                <span id="title_${id}">${title}</span>
                            </div>

                            <div class="playlist-player">
                                <div class="playlist-buttons">
                                    <span id="playlist-remove_${id}" class="glyphicon glyphicon-remove"></span>
                                    <span id="playlist-update_${id}" class="glyphicon glyphicon-pencil"></span>
                                </div>

                                <div class="playlist-thumb">
                                    <div class="playlist-icon">
                                        <span id="playlist-play_${id}" class="glyphicon glyphicon-play"></span>
                                    </div>
                                    <img class="img img-responsive img-thumb" id="playlist_img_${id}" src=${img}/>
                                </div>
                            </div>
                        </div>
                    </div>
                `);

                $(`playlist_${id}`).val(id);

                const titleElement = new CircleType($(`#title_${id}`)[0]).radius(90);
                $(`.playlist-title`).fitText();

                // EVENT REMOVE
                $(`#playlist-remove_${id}`).click((e) => {
                    $("#delete_playlist_modal").val(id);
                    $("#delete_playlist_modal").modal({
                        fadeDelay: 500,
                        fadeDuration: 0.50
                    });
                });
                
                // EVENT UPDATE
                $(`#playlist-update_${id}`).click(() => {

                   
                    let playlist = $scope.playlist.findById(id);
                    $("#update_playlist_form")[0].reset();
                    $("#update_playlistName").val(playlist.result.name);
                    $("#update_playlistUrl").val(playlist.result.image);
                    $(`#update_songs_form`).val(`${id}`);
                    $(`#update_playlist_form`).val(`${id}`);
                    $($(".update_playlist_image_preview")[0]).attr("src", playlist.result.image);
                    $("#update_playlist_modal").modal({
                        fadeDuration: 500,
                        fadeDelay: 0.50
                    });

                     // ADD EVENT KEY UP TO THE PLAYLIST IMAGE URL
                     $scope.addPlaylistImageModalChange($("#update_playlistUrl"), $($(".update_playlist_image_preview")[0]));

                });

                // EVENT PLAY
                $(`#playlist-play_${id}`).click((e) => {
                    $scope.createPlaylistAudio(id);
                });
            },
            createPlaylistAudio: (id) => { // create playlist container
                $("#playlist-audio-container").empty();
                $("#playlist-audio-container").val(id);
                let result_li = "";
                let playlist = $scope.playlist.findById(id);
                $scope.playlist.all()[playlist.index].songs.forEach((elm) => {
                    result_li += `<li audio_url="${elm.url}" class="list-group-item playlist-item">${elm.name}</li>`;
                });

                $("#playlist-audio-container").append(`
                    <div class="playlist-audio">

                        <div class="playlist-audio-panel">
                            <div class="container-fluid-fixed">
                                <div class="playlist-audio-body">
                                    <div class="player-audio">
                                        <div class="player-audio-playlist">
                                            <div class="playlist-icon">
                                                <span id="playlist-audio-play" class="glyphicon glyphicon-play"></span>
                                            </div>
                                            <img id="player-playlist-img" class="img img-responsive img-thumb" style="z-index: 0;" src="${$scope.playlist.all()[playlist.index].image}"/>
                                        </div>
                                    </div>

                                    <section class="audio-player player-audio-songs">
                                        <div class="p-0 m-0" id="now-playing">
                                            <p class="font-italic mb-0">Now Playing: <span class="lead" id="title"></span></p>
                                            
                                        </div>
                                        <ul class="playlist list-group list-group-flush">
                                            ${result_li}
                                        </ul>
                                        <audio id="audio-player" class="d-none" src="" type="audio/mp3" controls="controls"></audio>
                                    </section>
                               
                                </div>
                            </div>
                        </div>
                        <div class="playlist-audio-panel-buttons">
                            <span id="playlist_remove_modal" class="glyphicon glyphicon-remove"></span>
                            <span id="playlist_update" class="glyphicon glyphicon-pencil"></span>
                        </div>
                    </div>
                `);

                loadPlaylist();

                // ADD EVENT CLICK(PLAY) TO PLAYLIST AUDIO PLAY BUTTON
                $("#playlist-audio-play").click(() => {
                    if (audioPlayer['0'].paused === true) {
                        audioPlayer['0'].play();
                        if(!audioPlayer['0'].paused){
                            $("#playlist-audio-play").attr("class", "glyphicon glyphicon-pause");
                        }
                    }
                    else {
                        audioPlayer['0'].pause();
                        $("#playlist-audio-play").attr("class", "glyphicon glyphicon-play");
                    }
                });

                audioPlayer.on('pause', function (e) { // check if playlist is now pause
                    $("#player-playlist-img").css({ "animation-name": "" });
                    $("#playlist-audio-play").attr("class", "glyphicon glyphicon-play");
                });

                audioPlayer.on('play', function (e) { // if playlist is now playing
                    $("#player-playlist-img").css({ "animation-name": "playlist-circled" });
                    $("#playlist-audio-play").attr("class", "glyphicon glyphicon-pause");
                });

                // EVENT REMOVE IN PLAYLIST CONTAINER
                $("#playlist_remove_modal").click((e) => {
                    $("#delete_playlist_modal").val(id);
                    $("#delete_playlist_modal").modal({
                        fadeDelay: 500,
                        fadeDuration: 0.50
                    });
                });

                // EVENT UPDATE IN PLAYLIST CONTAINER
                $("#playlist_update").click(() => {
                    let playlist = $scope.playlist.findById(id);
                    $("#update_playlist_form")[0].reset();
                    $("#update_playlistName").val(playlist.result.name);
                    $("#update_playlistUrl").val(playlist.result.image);
                    $(`#update_songs_form`).val(`${id}`);
                    $(`#update_playlist_form`).val(`${id}`);
                    $($(".update_playlist_image_preview")[1]).attr("src", playlist.result.image);
                    $("#update_playlist_modal").modal({
                        fadeDuration: 500,
                        fadeDelay: 0.50
                    });
                    // ADD EVENT KEY UP TO THE PLAYLIST IMAGE URL IN THE PLAYLIST CONTAINER
                    $scope.addPlaylistImageModalChange($("#update_playlistUrl"), $($(".update_playlist_image_preview")[0]));
                });
            },
            validArray: (arr, object) => { // define jquery validator inside a array of forms element.
                arr.forEach((e) => {
                    $(e).validate(object);
                });
            },
            addPlaylistImageModalChange: (input, image) => {
                $(input).keyup(() => {
                    if ($(input).valid()) {
                        $(image).attr("src", $(input).val());
                    } else {
                        let src = "images/noimg.jpg";
                        if ($(image).attr("src") != src) {
                            $(image).attr("src", src);
                        }
                    }
                });
            },
            addSongsBody: (flag, tag, vals) => {
                if (flag) {
                    $($(`#${tag}_songs_form .${tag}_songs_form_body`)[0]).empty();
                    $(`#${tag}_songs_form`)[0].reset();
                }
                let formElement = $($(`#${tag}_songs_form .${tag}_songs_form_body`)[0]);
                let index = $(formElement[0]).children().length;
                let haveName = vals.name ? vals.name : "";
                let haveUrl = vals.url ? vals.url : "";
                let element = formElement.append(`
                    <div class="${tag}_playlist_songs_body">
                        <div class="form-group" class="${tag}_new_playlist_song" style="width: 45%;">
                            <label for="${tag}_playlist_song_name_${index}">Song Name: </label>
                            <input type="text" class="form-control" id="${tag}_playlist_song_name_${index}" name="${tag}_playlist_song_name_${index}" value="${haveName}" placeholder="Song name">
                        </div>

                        <div class="form-group" class="${tag}_new_playlist_song" style="width: 45%;">
                            <label for="${tag}_playlist_song_url_${index}">Playlist Song url: </label>
                            <input type="text" class="form-control" id="${tag}_playlist_song_url_${index}" name="${tag}_playlist_song_url_${index}" value="${haveUrl}" placeholder="Playlist song url">
                        </div>
                    </div>
                `);

                $(`#${tag}_playlist_song_name_${index}`).rules("add", { required: true });
                $(`#${tag}_playlist_song_url_${index}`).rules("add", {
                    required: true,
                    url: true,
                    extension: "mp3|ogg"
                });
            }
        }
    })();

    // SEARCH INPUT
    $("#srch-term").keyup((e) => {
        $(".playlist_item").hide();
        let result = $scope.playlist.all().filter((elm) => {
            return !elm.name.toLowerCase().search(e.target.value.toLowerCase());
        });

        result.forEach((a_elm) => {
            let flag = false;
            for (let index in $scope.playlist.all()) {
                if (a_elm.id == $scope.playlist.all()[index].id) {
                    flag = true;
                    break;
                }
            }
            if (flag) {
                $(`#playlist_${a_elm.id}`).show();

            }
        });
        $('#playlist-audio-container').empty();
    });

    $("#add_new_playlist").click(() => { // ADD NEW PLAYLIST STEP 1
        $("#add_playlist_form")[0].reset();
        $("#add_playlist_body").empty();

        $("#add_playlist_body").append(`<div class="add_playlist_form">
              <div class="form-group">
                <label for="add_playlistName">Playlist Name: </label>
                <input type="text" class="form-control" id="add_playlistName" name="name" placeholder="Playlist Name">
              </div>
              <div class="form-group">
                <label for="add_playlistUrl">Playlist image url: </label>
                <input type="text" class="form-control playlist_url_regex" name="url" id="add_playlistUrl" placeholder="Playlist image url">
              </div>
            </div>

            <div class="add_playlist_image">
              <img id="add_playlist_image" class="img img-responsive add_playlist_image_preview" src="images/noimg.jpg"
                alt="preview" />
            </div>`);

        $scope.addPlaylistImageModalChange($("#add_playlistUrl"), $("#add_playlist_image"));

        $("#add_playlist_modal").modal({
            fadeDuration: 500,
            fadeDelay: 0.50
        });
    });

    $("#add_playlist_form").submit((e) => { // ADD NEW PLATLIST STEP 1 SUBMITTED
        e.preventDefault();
        if ($(e.target).valid()) { // if form is valid
            $scope.addSongsBody(true, "add", {});

            $("#add_playlist_modal_songs").modal({
                fadeDuration: 500,
                fadeDelay: 0.50
            });
        }
    });

    $scope.validArray([$("#add_playlist_form"), $("#update_playlist_form")], { // ADD FORM VALIDATION
        rules: {
            name: {
                required: true
            },
            url: {
                required: true,
                url: true,
                extension: "png|jpg",
            }
        },
        messages: {
            url: {
                extension: "Please enter a value with a valid extension.<br/>png or jpg only."
            }
        }
    });

    // Add new playlist
    $("#add_songs_form").submit((e) => {
        e.preventDefault();
        if ($("#add_songs_form").valid()) {
            let playlist = $scope.playlist.getPlaylistObject($("#add_playlistName").val(), $("#add_playlistUrl").val(), $(".add_playlist_songs_body"));
            $scope.playlist.addPlaylistToDB(playlist.name, playlist.url, playlist.songs).then(res => {
                $scope.playlist.add(res.data.id, playlist.name, playlist.url, playlist.songs);
            }, err => {
                console.log(err);
            });

            $.modal.close();
        }
    });

    $("#add_new_song_button").click(() => { // ADD NEW SONG BUTTON
        $scope.addSongsBody(false, "add", {});
    });

    $("#update_playlist_form").submit((e) => { // UPDATE PLAYLIST STEP 1 SUBMITTED
        e.preventDefault();
        if ($(e.target).valid()) {
            let id = parseInt($("#update_playlist_form").val());
            let playlist = $scope.playlist.findById(id);
            $($("#update_songs_form .update_songs_form_body")[0]).empty();
            $scope.playlist.all()[playlist.index].songs.forEach((song) => {
                $scope.addSongsBody(false, "update", { name: song.name, url: song.url });
            });
            $("#update_playlist_modal_songs").modal({
                fadeDuration: 500,
                fadeDelay: 0.50
            });
        }
    });

    $("#update_songs_form").submit((e) => { // UPDATE PLAYLIST STEP 2 SUBMITTED
        e.preventDefault();
        if ($(e.target).valid()) {
            let id = parseInt($("#update_songs_form").val());
            let playlist = $scope.playlist.findById(id);
            let result = $scope.playlist.getPlaylistObject($("#update_playlistName").val(), $("#update_playlistUrl").val(), $(".update_playlist_songs_body"));
            $scope.playlist.update(id, result.name, result.url, result.songs);
            $.modal.close();
        }
    });

    $("#update_new_song_button").click(() => { // ADD NEW SONG IN UPDATE SONGS FORM
        $scope.addSongsBody(false, "update", {});
    });

    $("#playlist_remove").click(() => { // REMOVE PLAYLIST IN PLAYLIST CONTAINER EVENT
        console.log($("#delete_playlist_modal").val());
        $scope.playlist.remove($("#delete_playlist_modal").val());
        $.modal.close();
    });

    // INIT ALL PLAYLISTS
    $scope.playlist.playlistsInit().then((res) => {
        let data = res.data;
        data.forEach((elm) => {
            $scope.playlist.getPlaylistSongs(elm.id).then(song => {
                $scope.playlist.add(elm.id, `${elm.name}`, elm.image, song.data.songs);
            }, err => console.log(err));
        });
    }, err => {
        console.log(err);
    });

    $("#add_songs_form").validate({}); // add jquery validation to the form. 
    $("#update_songs_form").validate({}); // add jquery validation to the form. 
});