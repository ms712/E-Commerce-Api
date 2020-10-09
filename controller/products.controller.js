var Promise = require("bluebird");
Promise.promisifyAll(require("mongoose"))  
const Product = require("../models/admin.addProducts.model").Product;
const mongoose = require("mongoose");

//task 6:create products categoryise
const addproduct = async (req, res, next) => {
  const { productName, productPrice, color ,productCatid, companyname } = req.body;
    try {
      let product = new Product({
        productName: productName,
        productPrice: productPrice,
        color:color,
        productCatid: mongoose.Types.ObjectId(productCatid),
        companyname: companyname,
        productImage: req.file.path || req.body.productImage,
      })
      const addedproduct  = await product.save()
      if (addedproduct) {
        res.status(200).json(addedproduct)
      } 
    } catch (error) {
      throw new Error(error)
    }
} 
//task 7: Get Products Details with category Details
const getproductdetails = (req,res,next)=>{
    const id = mongoose.Types.ObjectId(req.body.productid);
    try {
      
    } catch (error) {
      
    }
    Product.aggregate([
      { $match:{               
          _id:id
        }},
      {$lookup:{
          from:"categories",
          let:{product_id:"$productCatid"},
          pipeline:[
          {$match:{$expr:{
              $and:[
                {$eq:["$$product_id","$_id"]}                           
              ]                 
            }}}],
          as:"product_with_cat"              
      }},
      {$unwind:"$product_with_cat"},
      {$project:{
          "productCategory":0,
          "productCatid":0                   
        }
      }
    ]).exec((err,product)=>{
        if (err) {
            res.status(400).json({
                message:err
            })
        } else {
            res.status(200).json({
                products:product
            })                
        }
    })   
}
//task 8:update products
const updateproduct = async (req, res, next) => {
  const update = {
    productName:req.body.productName,
    productPrice:req.body.productPrice,
    productImage:req.file.path || req.body.productImage,
    companyname:req.body.companyname,
  }
  const option = { new: true };
  try {
    const updateproduct = await Product.findOneAndUpdate({
      _id:mongoose.Types.ObjectId(req.params.prid)
    }, { $set: update }, option)
    console.log(updateproduct)    
    if (await updateproduct) {
      res.status(200).json(updateproduct)
    }else{
      res.status(400).json(updateproduct) 
    }
  } catch (error) {
    throw new Error("something wrong..")
  }
}
//task 9:delete products
const removeproduct = async (req, res, next) => {
  const removproductid = req.body.productid;
  try {
    const removedproduct = await Product.findOneAndDelete({ _id: removproductid })
    res.status(200).json(removedproduct)    
  } catch (error) {
    throw error
  }
}
//task 10:list all products with category 
const productlist = (req, res, next)=>{
    const productname =  req.body.productName ? req.body.productName : "";
    const pagination = req.body.pagination ? parseInt(req.body.pagination) : 3
    const page = req.body.pageno ? req.body.pageno : 1;
    const id = mongoose.Types.ObjectId(req.body.catid); 
    Product.aggregate([
      {$match:{
        "productCatid":{
          $eq:id
        }   
       },      
      },
    {
      $lookup:{
          from:"categories",
          let:{"product_id":"$productCatid"},
          pipeline:[{$match:{$expr:{                               
                $and:[
                  {$eq:["$$product_id","$_id"]},                    
                ]
              } 
            }}
          ],
          as:"all_products"   
        }},
        {$unwind:"$all_products"},
        {
          $project:{
              "productCatid":0,
              "productCategory":0
          }
        },
        {$skip:((page - 1) * pagination)},
        {$limit:pagination}
          
]).exec((err,product)=>{
        if (err) {
          res.json({
            message:err
          })
        } else {
          res.status(200).json({
              products:product
          })         
        }
    })
}
module.exports = {
  addproduct,
  updateproduct,
  removeproduct,
  getproductdetails,
  productlist
}
//sudo lsof -i:3000,
//kill -9 pid