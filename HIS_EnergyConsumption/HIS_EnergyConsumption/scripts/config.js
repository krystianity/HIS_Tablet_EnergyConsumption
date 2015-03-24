/* Config File */
var _app_scope = null;
var _current_page = null;

var _devices = [];
var _days = []; //loaded in config.js from the json files

var _config = {
    "web_version": true, //running a webbrowser?
    "swipe_threshold": 212, //min. swipe distance that triggers swipe event
    "hold_threshold": 1250, //ms to raise a touch hold event
    "boot_page": "boot", //first view that is loaded on app start
    "boot_time": 1500, //time to fade out bootscreen
    "start_page": "raw_stats", //view that is shown after boot-screen
    "view_dir": "views/",
    "view_format": ".html",
    "item_view": "edit_item",
    "item_list": "manage_items",

    "db_days_path": "db/days.json",
    "db_devices_path": "db/devices.json",

    //takes care of swipe gesture navigation
    "navigation": {
        "boot": {
            "left": null,
            "right": null,
            "up": null,
            "down": null
        },
        "green_stats": {
            "left": null,
            "right": "raw_stats",
            "up": null,
            "down": null
        },
        "raw_stats": {
            "left": "green_stats",
            "right": "manage_items",
            "up": null,
            "down": null
        },
        "manage_items": {
            "left": "raw_stats",
            "right": null,
            "up": null,
            "down": null
        },
        "edit_item": {
            "left": null,
            "right": null,
            "up": "manage_items",
            "down": "manage_items"
        }
    }

};