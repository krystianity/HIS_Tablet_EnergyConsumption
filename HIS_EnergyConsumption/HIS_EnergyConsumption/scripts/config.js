/* Config File */
var _app_scope = null;
var _current_page = null;

var _devices = [];
var _days = []; //loaded in config.js from the json files

var _config = {
    "web_version": true, //running a webbrowser?
    "swipe_threshold": 72, //min. swipe distance that triggers swipe event
    "hold_threshold": 950, //ms to raise a touch hold event
    "boot_page": "boot", //first view that is loaded on app start
    "boot_time": 2500, //time to fade out bootscreen
    "start_page": "manage_items", //view that is shown after boot-screen
    "view_dir": "views/",
    "view_format": ".html",
    "item_view": "edit_item",
    "item_list": "manage_items",

    "db_days_path": "db/days.json",
    "db_devices_path": "db/devices.json",

    //fillgauge with adaption in %
    "fillgauge_portrait": 28,
    "fillgauge_landscape": 20,

    //takes care of swipe gesture navigation
    "navigation": {
        "boot": {
            "left": null,
            "right": null,
            "up": null,
            "down": null
        },
        "green": {
            "left": "history",
            "right": "manage_items",
            "up": null,
            "down": null
        },
        "manage_items": {
            "left": "green",
            "right": "history",
            "up": null,
            "down": null
        },
        "edit_item": {
            "left": null,
            "right": null,
            "up": "manage_items",
            "down": "manage_items"
        },
        "history": {
            "left": "manage_items",
            "right": "green",
            "up": null,
            "down": null
        },
        "item_save": "down",
        "item_delete": "up"
    }

};