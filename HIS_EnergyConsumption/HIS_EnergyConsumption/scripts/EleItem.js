function EleItem(id) {
    this.id = id;

    this.active = true;
    this.hours = 0;
    this.age_num = 0;
    this.age_str = "mid";

    this.device = {};
    this.category = {};

    _addEleItemConsumptionGetter(this);
    _addEleWattageGetter(this);
};

EleItem.prototype.updateAgeStr = function () {
    switch (this.age_num) {
        case "-1": this.age_str = "old"; break;
        case "0": this.age_str = "mid"; break;
        case "1": this.age_str = "new"; break;
        default: this.age_num = "0"; this.age_str = "mid"; break;
    }
};

function _addEleItemConsumptionGetter(_o) {
    Object.defineProperty(_o, "getConsumption", {
        get: function getConsumption() {
            if (!this.device || !this.device.wattage || !this.age_num)
                return 0;
            else
                return (this.device.wattage[parseInt(this.age_num) + 1] * this.hours);
        }
    });
};

function _addEleWattageGetter(_o) {
    Object.defineProperty(_o, "getWattage", {
        get: function getWattage() {
            if (!this.device || !this.device.wattage || !this.age_num)
                return 0;
            else
                return this.device.wattage[parseInt(this.age_num) + 1];
        }
    });
};