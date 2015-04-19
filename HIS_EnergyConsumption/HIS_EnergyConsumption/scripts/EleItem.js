﻿/*
   Copyright 2015 Dennis Stodko, Christian Fröhlingsdorf

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

function EleItem(id, item) {
    if (typeof item === "undefined") {
        this.id = id;

        this.active = true;
        this.hours = 0;
        this.age_num = 1;
        this.age_str = "D";
        this.description = "";

        this.device = {};
        this.category = {};

    } else {
        //load existing item but add getters
        this.id = item.id;
        this.active = item.active;
        this.hours = item.hours;
        this.age_num = item.age_num;
        this.age_str = item.age_str;
        this.description = item.description;
        this.device = item.device;
        this.category = item.category;
    }

    _addEleItemConsumptionGetter(this);
    _addEleWattageGetter(this);
    _addEleIsGreen(this);
    _addEleEffImg(this);
    _addEleIconImg(this);
};

EleItem.prototype.updateAgeStr = function () {
    switch (this.age_num) {
        case "1": this.age_str = "D"; break;
        case "2": this.age_str = "C"; break;
        case "3": this.age_str = "B"; break;
        case "4": this.age_str = "A"; break;
        case "5": this.age_str = "A+"; break;
        case "6": this.age_str = "A++"; break;
        case "7": this.age_str = "A+++"; break;
        default: this.age_num = "1"; this.age_str = "D"; break;
    }
};

function _addEleItemConsumptionGetter(_o) {
    Object.defineProperty(_o, "getConsumption", {
        get: function getConsumption() {
            if (!this.device || !this.device.wattage || !this.age_num)
                return 0;
            else
                return Number((this.device.wattage[parseInt(this.age_num) - 1] * this.hours).toFixed());
                //return (this.device.wattage[parseInt(this.age_num) - 1] * this.hours);
        }
    });
};

function _addEleWattageGetter(_o) {
    Object.defineProperty(_o, "getWattage", {
        get: function getWattage() {
            if (!this.device || !this.device.wattage || !this.age_num)
                return 0;
            else
                return this.device.wattage[parseInt(this.age_num) - 1];
        }
    });
};

function _addEleIsGreen(_o) {
    Object.defineProperty(_o, "isGreen", {
        get: function isGreen() {
            if (!this.device || !this.age_num) {
                return false;
            } else {
                if (this.age_num >= 5)
                    return true;
                else
                    return false;
            }
        }
    });
};

function _addEleEffImg(_o) {
    Object.defineProperty(_o, "getEffImage", {
        get: function getEffImage() {
            return "images/ratings/rating_" + this.age_num + ".png";
        }
    });
};

function _addEleIconImg(_o) {
    Object.defineProperty(_o, "getIconImage", {
        get: function getIconImage() {
            if (!this.device)
                return null;

            return "images/devices/" + this.device.id + ".png";
        }
    });
};
