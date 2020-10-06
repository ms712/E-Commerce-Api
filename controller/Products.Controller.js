const Category = require("../models/admin.addproducts.Model").Category;
const Product = require("../models/admin.addproducts.Model").Product;
const mongoose = require("mongoose");

//task 6:create products categoryise
const addproduct = (req, res, next) => {
  console.log(req.file);
  const { productName, productPrice, color ,productCatid, companyname } = req.body;

      let product = new Product({
        productName: productName,
        productPrice: productPrice,
       // productCategory: category.categoryname,
        color:color,
        productCatid: mongoose.Types.ObjectId(productCatid),
        companyname: companyname,
        productImage: req.file.path || req.body.productImage,
      });
      product.save(function (err, addnewProduct) {
        if (err) {
          res.status(400).json({
            message: err,
          });
        } else {
          res.status(200).json({
            product: addnewProduct,
          });
        }
      });
  } 
//task 7: Get Products Details with category Details
const getproductdetails = (req,res,next)=>{
    const id = mongoose.Types.ObjectId(req.body.productid);
    Product.aggregate([
        {
            $match:{               
                  "_id":id
            }           
        },
        {$lookup:{
            from:"categories",
            let:{product_id:"$productCatid"},
            pipeline:[
                {$match:
                    {$expr:
                        {$and:[
                            {$eq:["$$product_id","$_id"]}                           
                        ]                 
                    }}}
            ],
            as:"product_with_cat"              
           }},
            {
                $unwind:"$product_with_cat"
                
            },
           {
               $project:{
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
const updateproduct = (req, res, next) => {
  console.log(req.body.productName);
  console.log(req.params.prid);  
  const filter = {
    _id: req.params.prid,
  };
  const update = {
    productName:req.body.productName,
    productPrice:req.body.productPrice,
    productImage:req.file.path || req.body.productImage,
    companyname:req.body.companyname,
  }
  
  console.log(req.body);
  console.log(req.file.path);
  const option = { new: true };

  Product.findOneAndUpdate(filter, { $set: update }, option, function (
    err,
    updateproduct
  ) {
    if (err) {
      res.status(400).json({
        message: err,
      });
    }
    if (updateproduct) {
      console.log("updating...", updateproduct);
      res.status(200).json({
        product: updateproduct,
      });
    } else {
      res.status(400).json({
        message: "Product Not Exist",
      });
    }
  });
}
//task 9:delete products
const removeproduct = (req, res, next) => {
  const removproductid = req.body.productid;
  Product.findOneAndDelete({ _id: removproductid }, function (err, removed) {
    if (err) {
      res.json({
        message: err,
      });
    } else {
      res.status(200).json({
        removeproduct: removed,
      });
    }
  });
}
//task 10:list all products with category
const productlist = (req, res, next)=>{
    const productname =  req.body.productName ? req.body.productName : "";
    const pagination = req.body.pagination ? parseInt(req.body.pagination) : 3
    const page = req.body.pageno ? req.body.pageno : 1;
    const id = mongoose.Types.ObjectId(req.body.catid);
    
    Product.aggregate([
      {
        $match:{
         "productCatid":{
           $eq:id
         }   
       },      
      },
      {
        $lookup:{
            from:"categories",
            let:{"product_id":"$productCatid"},
            pipeline:[
                {$match:{$expr:{                               
                  $and:[
                      {$eq:["$$product_id","$_id"]},                    
                    ]
                  } 
                }}
            ],
            as:"all_products"   
          }},
          {
              $unwind:"$all_products"
          },
          {
            $project:{
               "productCatid":0,
               "productCategory":0

            }
          },
          {
            $skip:((page - 1) * pagination)
          },
          {
            $limit:pagination
          },
          
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

//a.search
//b.pagination
//c.filter by categoryid
module.exports = {
  addproduct,
  updateproduct,
  removeproduct,
  getproductdetails,
  productlist
}

//sudo lsof -i:3000,
//kill -9 pid