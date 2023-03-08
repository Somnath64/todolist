const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _= require("lodash");


const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

mongoose.connect("mongodb+srv://Somnath:somnath123@cluster0.ynwnj2x.mongodb.net/todolistDB?retryWrites=true&w=majority");


const itemsSchema = {
  name: {
    type: String,
    required: [false, "Enter item Name"]
  }
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome todo list!"
});
const item2 = new Item({
  name: `Hit the + button to add item.`
});
const item3 = new Item({
  name: "<-- Hit this to delete item."
});
const defaultItems = [item1, item2, item3];

const ListSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("list", ListSchema);


app.get("/", function(req, res) {

  const day = date.getDate();

  Item.find().then(data => {

    if (data.length === 0) {
      Item.insertMany(defaultItems).then(data => {
        console.log("Successfully inserted items");
          res.redirect("/");
      }).catch(err => {
        console.error(err);
      });

    } else {
      res.render("list", {
        listTitle: "Today",
        newItemLists: data
      });
    }

  }).catch(err => {
    console.error(err);
  });
});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;


  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save().then(data => console.log(data)).catch(err => console.error("Enter item name"));
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }).then(data => {

      data.items.push(item);
      data.save();
      res.redirect(`/${listName}`);

    }).catch(err => console.error("Enter item name"));
  }
});

app.post("/delete", function(req, res) {

  const checkedItemId = req.body.checkBoX;

  const listName = req.body.listName;



  if (listName === "Today") {
    Item.findByIdAndDelete(req.body.checkBoX)
      .then((data) => {
        console.log("Successfully removed item");
        res.redirect("/");
      })
      .catch(err => console.error("Fail! Item is not removed"))

  } else {
    List.findOneAndUpdate({
        name: listName
      }, {
        $pull: {
          items: {
            _id: checkedItemId
          }
        }
      })
      .then((data) => {
        console.log("Successfully removed item from list");
        res.redirect(`/${listName}`);
      })
      .catch(err => console.error("fail! item not removed from list"))
  }
});

app.get("/about", function(req, res) {
  res.render("about")
})


app.get("/:customListName", function(req, res) {
  const customListName =_.capitalize(req.params.customListName);


  List.findOne({
    name: customListName
  }).then(data => {
    if (!data) {
      const list = new List({
        name: customListName,
        items: defaultItems
      });

      list.save().then(data => {
        console.log(data);
        res.redirect(`/${data.name}`);
      }).catch(err => console.error("Enter item name"));
          // res.redirect(`/${data.name}`);
    } else {
      res.render("list", {
        listTitle: data.name,
        newItemLists: data.items
      });
    }
  }).catch(err => {
    console.error(err);
  });
});


app.listen(process.env.PORT || 3000, function() {
  console.log("server started Successfully");
});
