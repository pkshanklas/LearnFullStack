var dispatcher = require('./../dispatcher.js');
var helper = require('./../helpers/RestHelper.js');

function GroceryItemStore() {
    var items = [];

    var listeners = [];

    helper.get("/api/items")
    .then(function(data) {
        items = data;
        triggerListeners();
    })

    function getItems() {
        return items;
    }

    function onChange(listener) {
        listeners.push(listener);
    }

    function addGroceryItem(item) {
        items.push(item);
        triggerListeners();

        helper.post("/api/items", item);
    }

    function setGroceryItemBought(item, isBought) {
        var _item = items.filter(function(a){ return a.name == item.name})[0];
        _item.purchased = isBought || false;

        triggerListeners();

        helper.patch('/api/items/' + item._id, item);
    }

    function deleteGroceryItem(item) {
        var index;
        items.filter(function(_item, _index) {
            if(_item.name == item.name) {
                index = _index;
            }
        });

        items.splice(index, 1);
        triggerListeners();

        console.log("the item to be removed is: "+ item._id);
        helper.del('/api/items/' + item._id);
    }

    function triggerListeners() {
        listeners.forEach(function(listener) {
            listener(items);
        })
    }

    dispatcher.register( function(event) {
        var split = event.type.split(':');
        if( split[0] === 'grocery-item' ) {
            switch( split[1] ) {
                case "add":
                    addGroceryItem(event.payload);
                    break;
                case "delete":
                    deleteGroceryItem(event.payload);
                    break;
                case "unbuy":
                    setGroceryItemBought(event.payload, false);
                    break;
                case "buy":
                    setGroceryItemBought(event.payload, true);
                    break;
                default:
                    console.log("This action is not support in store");
            }
        }
    })

    return {
        getItems:getItems,
        onChange:onChange
    }
}

module.exports = new GroceryItemStore();