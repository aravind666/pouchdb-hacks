(function() {
    'use strict';

    var displayTable = $('#pouch-data').DataTable({
        "lengthMenu": [2, 4, 6, 8, 10]
    });


    var db = null;
    var dbname = 'pouch_db_learning';
    var aiCounter = 0;

    window.addEventListener('load', loadPouch, false);

    function loadPouch() {
        windowLoadHandler();
        setupDB();
        showData();
    };

    function windowLoadHandler() {
        addEventListeners();
    };

    function setupDB() {
        aiCounter = 0;
        db = new PouchDB(dbname);
        db.changes({
            since: 'now',
            live: true
        }).on('change', showData);
    }

    function addEventListeners() {
        document.getElementById('save').addEventListener('click', addToDB, false);
        document.getElementById('grep').addEventListener('click', grep, false);
        document.getElementById('reset').addEventListener('click', reset, false);
    };

    var reset = function() {
        db.destroy(dbname, function(err1) {
            if (err1) {
                alert("Database destruction error")
            } else {
                setupDB();
                showData();
            }
        });
    };

    var grep = function() {
        var searchValue = $('#search-text').val();
        var query = {
            query: searchValue,
            fields: ['title'],
            include_docs: true,
            highlighting: true,
            mm: '100%'
        };
        console.log('searching with query: ' + JSON.stringify(query));
        db.search(query).then(function(res) {
            $("#find-results").empty();
            res.rows.forEach(function(item, index) {
                var x = document.createElement("TEXTAREA");
                var t = document.createTextNode(JSON.stringify(item.doc));
                x.appendChild(t);
                $("#find-results").append($(x));
            });
        });
    }

    var addToDB = function() {
        var text = $("#enter-text").val();
        var textToSave = {
            _id: guid(),
            title: text,
            created_at: new Date().toISOString()
        };
        db.put(textToSave, function callback(err, result) {
            if (!err) {
                console.log('Saved a text! in the DB');
                $("#enter-text").val("");
            }
        });
    };

    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    function guid() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }


    function displayData(row) {
        displayTable.row.add([
            row.doc._id,
            row.doc.title,
            row.doc.created_at
        ]).draw(false);
    }

    var showData = function() {
        // clear Data 
        displayTable.clear();
        displayTable.draw();

        db.allDocs({ include_docs: true }, function(err, res) {
            if (!err) {
                res.rows.forEach(function(element) {
                    displayData(element);
                });
            }
        })
    };

})();