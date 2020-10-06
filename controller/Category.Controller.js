const Category = require("../models/admin.addproducts.Model").Category;
const mongoose = require("mongoose");
const { Product } = require("../models/admin.addproducts.Model");
//1.Create Category:Done
const createCategory =  (req,res,next)=>{ 
        const catname = req.body.categoryname;
        Category.findOne({categoryname:{$regex:catname,$options:"i"}},function(err,category) {
            if (err) {
                res.json({
                    message:err
                })
            } 
            if(category) {
                res.json({
                    message:"Already Exist Category",
                    category:category
                })
            } else{
                let addnewcategory = new Category({
                    categoryname:catname
                })
                addnewcategory.save((err,addCategory)=>{
                    if (err) {
                        res.status(400).json({
                            message:err
                        })
                    } else {
                        res.status(200).json({
                            categories:addCategory
                        })
                    }
                })
            }   
        })     
} 
//2.Get category details:Done 
const getcategorydetails = (req,res,next)=>{
    const id = mongoose.Types.ObjectId(req.body.catid);
    Category.aggregate([
        {$lookup:{
            from:"products",
            let:{cat_id:"$_id"},
            pipeline:[
             {$match:{
                 $expr:{
                     $and:[
                        {$eq:[id,"$productCatid"]},
                        {$eq:["$$cat_id","$productCatid"]}]                
                  }}}
            ],
            as:"products"
         }},
         {
             $unwind:"$products"
         }
    ]).exec((err,categorywise)=>{
        if (err) {
            res.status(400).json({
                message:err
            })
        } else {
            res.status(200).json({
                products:categorywise
            })            
        }
    })
}
//3.update Category then:Done
const updatecategory = (req,res,next)=>{
    console.log("updating....");
    const filter = {_id:mongoose.Types.ObjectId(req.body.catid)};
    const prfilter = {productCatid:mongoose.Types.ObjectId(req.body.catid)}
    const update = {categoryname:req.body.categoryname};
    const prupdate = {productCategory:req.body.categoryname};
    const options = {new:true}

    Category.findOneAndUpdate(filter,{$set:update},options,function(err, updatedcategory){   
        if (err) {
            res.json({
                message:err
            })
        } else {
            Product.update(prfilter,prupdate,{multi:true},function(err, updateall){
                if (err) {
                    res.json({
                        message:err
                    })
                } else {
                    res.json({
                        catupates:updatedcategory,
                        productcat:updateall
                    })               
                }            
            })
        }
    })
}
//4.Delete Category then products should also delete:Done
const removecategory = (req,res,next)=>{
    const id = mongoose.Types.ObjectId(req.body.catid);
    Category.findOneAndDelete({_id:id},function(err, removecat){
        if (err) {
            res.json({
                message:err
            })      
        }
        if(removecat == null) {
            Product.remove({productCatid:id},function(err, remove){
                if(err){
                    res.json({
                        message:err
                    })
                }else {
                    res.json({
                        message:"removed",
                        removes:remove,  
                    })
                }
            })
        }                       
    })                    
}  
////5.list all cactegories with search and pagination:Done
const getallcategory = (req,res,next)=>{
    const searchcat =  req.body.categoryname ? req.body.categoryname : "";
    const pagination = req.body.pagination ? parseInt(req.body.pagination) : 3
    const page = req.body.pageno ? req.body.pageno:1;
    Category.aggregate([
        {$match:{
            categoryname:{
                $regex:searchcat,
                $options:"i"
            },  
    
          }
        },
        {
            $skip:((page - 1) * pagination)
        },
        {
            $limit:pagination
        }
    ]).exec((err,searchcat)=>{
          if (err) {
              res.json({
                  message:err
              })
          } else {
              res.json({
                  category:searchcat
              })                  
          }
    })
    
}
module.exports = {
    createCategory,
    getallcategory,
    removecategory,
    updatecategory,
    getcategorydetails
}


















