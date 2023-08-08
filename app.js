//jshint esversion:6

const express = require("express");
const _=require("lodash");
const bodyParser = require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://0.0.0.0:27017/todolistDB",{useNewUrlParser:true});
//schema
const itemsSchema={
  name:String
}
const Item=mongoose.model("Item",itemsSchema)

const item1=new Item({
  name:"sleeping"
});

const item2=new Item({
  name:"study"
});
const item3=new Item({
  name:"painting"
});
const defaultItem=[item1,item2,item3];
//new schema

const ListSchema={
  name:String,
  items:[itemsSchema]
};
const List=mongoose.model("List",ListSchema);

//finding all the list items


app.get("/", function(req, res) {

  Item.find({}).then((foundItems)=>{
    console.log(foundItems);
    if(foundItems.length===0){
      //inserting the default items

Item.insertMany(defaultItem).then(()=>{
    console.log("successfully inserted");
  }).catch((err)=>{
    console.log(err);
  });
  res.redirect("/");
  }
  else{
    res.render("list", {listTitle:"Today", newListItems:foundItems});}}
  ).catch((err)=>{
    console.log(err);
  });



});

app.post("/", function(req, res){
//inserting new item
const itemName=req.body.newItem;
const listName=req.body.list
if(itemName.length!==0){
  const itemName = req.body.newItem;
  const listName=req.body.list
  const item=new Item({
    name:itemName
  })
  if (listName==="Today"){
  item.save();
  res.redirect("/");}
  else{
   List.findOne({name:listName}).then((foundList)=>{
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
   }).catch((err)=>{
    console.log(err);
   })
   
  }
  }
  else{
    
    res.redirect("/"+listName);
   
  }
});
app.post("/delete",function(req,res){
  const id=req.body.checkbox;
  const listName= req.body.listName;

  if(listName==="Today"){
  Item.findByIdAndRemove(id).then(()=>{
    console.log("successfully deleted");
    res.redirect("/");
  }).catch((err)=>{
    console.log(err);
  })}
 
  else{
     List.findOneAndUpdate({name:listName},{$pull:{items:{_id:id}}}).then((foundList)=>{
      res.redirect("/"+listName);
     }).catch((err)=>{
      console.log(err);
     })
  }


});

app.get("/:customListName",function(req,res){
  const CustomListName=_.capitalize(req.params.customListName);

 List.findOne({name:CustomListName}).then((foundList)=>{
 
 if(foundList){
  //if the list is exist
  
  res.render("list.ejs", {listTitle:foundList.name, newListItems:foundList.items});
 }
  else{
     //inserting new list
   
    const list=new List({
      name:CustomListName,
      items:defaultItem
    });
    list.save();
    res.redirect("/"+CustomListName)
    
 }
   
  }).catch((err)=>{
    console.log(err);
  })
  
});
app.post("/search",function(req,res){
  const CustomListName=_.capitalize(req.body.search);
  const deleteList=_.capitalize(req.body.delete);
  if(CustomListName.length===0 ){
    res.redirect("/"+CustomListName);
  }
  else{
 List.findOne({name:CustomListName}).then((foundList)=>{
 
 if(foundList){
  //if the list is exist
  
  res.render("list.ejs", {listTitle:foundList.name, newListItems:foundList.items});
 }


 
  else{
     //inserting new list
   
    const list=new List({
      name:CustomListName,
      items:defaultItem
    });
    list.save();
    res.redirect("/"+CustomListName)
    
 }
   
  }).catch((err)=>{
    console.log(err);
  })}
  if(deleteList.length===0){
    console.log("no value");
  }
  else{
    List.deleteMany({ name:deleteList}).then(function(){
      console.log("Data deleted");
      res.redirect("/") // Success
  }).catch(function(error){
      console.log(error); // Failure
  });
  }
  
});

//for all lists
app.post("/list",function(req,res){
 
 
 List.find({},{name:1}).then((foundList)=>{
 
 if(foundList){
  //if the list is exist
  
  
  res.render("name.ejs", {listTitle:foundList});}
 
 }).catch((err)=>{
    console.log(err);
  })
  
});
app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});





