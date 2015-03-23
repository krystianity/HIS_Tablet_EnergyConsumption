/* Config File */
var _app_scope = null;
var _current_page = null;

var _config = {
    "web_version": true, //running a webbrowser?
    "swipe_threshold": 50, //min. swipe distance that triggers swipe event
    "boot_page": "boot", //first view that is loaded on app start
    "boot_time": 1500, //time to fade out bootscreen
    "start_page": "raw_stats", //view that is shown after boot-screen
    "view_dir": "views/",
    "view_format": ".html",
    "item_view": "edit_item",
    "item_list": "manage_items",

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
    },
    //category and type for the eleitems
    "categories": [ 
        { "id" : "1" , "name" : "Dog" } , { "id" : "2" , "name" : "Cat" } , 
        { "id": "3", "name": "Bunny" }, { "id": "4", "name": "Frog" },
        { "id": "5", "name": "Banana" }
    ],
    "types": [
        { "id" : "1" , "name" : "Dog" } , { "id" : "2" , "name" : "Cat" } , 
        { "id": "3", "name": "Bunny" }, { "id": "4", "name": "Frog" },
        { "id": "5", "name": "Banana" }
    ],

};