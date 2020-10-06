const { sortedLastIndexOf, sum, reject } = require("lodash");
var Promise = require("promise");
const mongoose = require("mongoose");
const User = require("../models/Users.Admin.Models");
const { use } = require("../routes/auth.route");
const Order = require("../models/admin.addproducts.Model").Order;
const Cart = require("../models/admin.addproducts.Model").Cart;
const Address = require("../models/admin.addproducts.Model").Address;
const moment =  require("moment");
var d = new Date(Date.now());
const Product = require("../models/admin.addproducts.Model").Product;
const getallproducts = (req,res,next)=>{
  //for pagination
    const pagination = req.body.pagination ? parseInt(req.body.pagination) : 3
    const page = req.body.pageno ? req.body.pageno:1;
    const productname = req.body.productName ? req.body.productName : "";
    const belowPrice = req.body.belowPrice ? parseInt(req.body.belowPrice) : "";
    const abovePrice = req.body.abovePrice ? parseInt(req.body.abovePrice) : "";  
    const productColors = req.body.color ? req.body.color : "";   
    const categoryid = (req.body.catid) ? mongoose.Types.ObjectId(req.body.catid) : "";

  let productsSearch = {};
  let productColor = {};
  let catid = {};
  let price = {};
  if(productname){
    productsSearch = {"productName":{
      $regex:productname,
      $options:"i",
    }}
  }
  if(productColors){
    productColor = {"color":productColors
    }
  }
  if(categoryid) {
    catid = {"productCatid": categoryid
    }
  }
  if(belowPrice && abovePrice){
    price ={ 
      $and:[{"productPrice":{$lte:belowPrice}},{"productPrice":{$gte:abovePrice}}]
    }
  }else if(abovePrice){
    price = {"productPrice":{
      $gte:abovePrice
    }}
  }else if(belowPrice){
    price = {"productPrice":{
      $lte:belowPrice
    }}
  }

  Product.aggregate([
      {
        $match:{
          $and:[   
            productsSearch,
            catid,
             productColor,
             price                           
          ]
        }      
      },      
      {
        $skip:(page - 1) * pagination
      },
      {
        $limit:pagination
      },
      {
        $lookup:{
          from:"categories",
          let:{prcatid:"$productCatid",price:"$productPrice"},
          pipeline:[
            {$match:{$expr:{
                
                $and:[
                  {$eq:["$$prcatid","$_id"]},
                ]
            }}}
          ],
          as:"catehory_info"
        }
      },
      {
        $unwind:"$catehory_info"
      }
    ]).exec((err,product)=>{
        if (err) {
            res.status(400) .json({
              message:err
            })
        } else {
            res.status(200).json({
              products:product
            })        
        }
  
      })
}
const viewproductdetail = (req,res,next)=>{
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
const addtocart = (req,res,next)=>{
  const qtyv = req.body.qty ? parseInt(req.body.qty) : 1;
  const userid = mongoose.Types.ObjectId(req.user.id)
  const prid  = req.body.productid;
  const productprice = req.body.productprice;
  const discount = req.body.discount ?  req.body.discount : 0;
  console.log(prid);
  const productfilter = {
    usersid:userid,
    product:{$elemMatch:{productid:mongoose.Types.ObjectId(prid)}}
  }
  const filter = {usersid:mongoose.Types.ObjectId(req.user.id)}
  const date = moment().format('LL'); 
  Cart.findOne(filter,function(err,cartproduct){
         if(err){
            res.json({
               message:err
            })
          }
         if(cartproduct) {      
             
              let ids =   cartproduct.product.findIndex(id => (id.productid == prid))                
               if(ids > -1)
                  {                 
                      Cart.findOneAndUpdate(productfilter,{
                        $inc:{  
                            "product.$.qty":1, 
                          }     
                      },{new:true},function(err,updateqty){ 
                            if (err) {
                                res.json({
                                  message:err
                                })
                            } else {
                                res.json({
                                  update:updateqty
                                })                                 
                            }
                      })                     
                  } else{
                      Product.findOne({_id:prid},function(err,pro){                   
                          Cart.findOneAndUpdate(filter,{$push:{product:{
                              productid:pro._id,
                              qty:qtyv,
                              productprice:productprice,
                              discount:discount,
                              date:date          
                            }}},{new:true},function(err,updateqty){
                              if (err) {
                                res.json({
                                  message:err
                                })
                              } else {
                                res.json({
                                  update:updateqty
                                })                                 
                              }
                          })
                    }) 
                }                         
          }else {
            Product.findOne({_id:prid},function(err,pro){ 
              let cart = new Cart({
                  product:{
                    qty:qtyv,
                    productid:pro._id,
                    productprice:productprice,
                    discount:discount,
                    date:date
                  },                               
                  usersid:userid               
              })
              cart.save((err,add)=>{
                  if (err) {
                    res.status(400).json({
                      message:err
                    })
                  } else {
                    res.status(200).json({
                      cart:add
                    })
                  }                   
              })  
           })
        }
  })  
   
}
const displaycart = (req,res,next)=>{ 
  const userid = mongoose.Types.ObjectId(req.user.id);
  Cart.aggregate([
    {$unwind:"$product"},    
    {
      $lookup:{
          from:"products",
          localField:"product.productid",
          foreignField:"_id",
          as:"product.proinfo"
      }
    },
    {$match:{usersid:userid}},
    {$unwind:"$product.proinfo"},
      {
        $group:{           
          _id:userid,
            Product:{$push:"$product"}
        }
      },
      {
        $project:{
          "usersid":1,
          "Product.qty":1,
          "Product.productid":1,
          "Product.productprice":1,
          "Product.discount":1, 
          "Product.proinfo.productImage":1     
        }
      }
  ]).exec((err,cart)=>{
      if (err) {
        res.status(400).json({
          message:err
        })
      } else {
        res.status(200).json({
            carts:cart
        })        
      }
  })
} 
const addaddress = async (req,res,next)=>{   
     
    const delieveryaddress =  req.body.address;
    const city = req.body .city;
    const state = req.body.state;
    const landmark = req.body.landmark;
    const pincode = req.body.pincode;
    const phonenumber = req.body.phonenumber;
    const typeofaddress = req.body.typeofaddress; 
    const id = mongoose.Types.ObjectId(req.user.id);
    let promise =  new Promise(async (resolve,reject)=>{
       let result =  Address.findOneAndUpdate({userid:id},{$push:{address:{
            address:delieveryaddress,
            city:city,
            state:state,
            landmark:landmark,
            pincode:pincode,
            phonenumber:phonenumber,
         }}},{new:true})
       let newresult = await promise
       resolve(newresult)
     })
     promise.then((result)=>{
        res.json({
          message:result
        })     
      }).catch((err)=>{
        res.json({
          message:err
       })
      })
      


    //,function(err,user){
    //     if (err) {
    //       res.json({
    //         message:err
    //       })
    //     }
    //     if (!user) {
    //         const  address = new Address({
    //           address:[{
    //             address:delieveryaddress,
    //             city:city,
    //             state:state,
    //             landmark:landmark,
    //             pincode:pincode,
    //             phonenumber:phonenumber,
    //             typeofaddress:typeofaddress 
    //           }],
    //           userid:id,  
    //        })
    //        address.save((err,add)=>{
    //           if (err) {
    //             res.json({
    //               message:err
    //             })
    //           } else {
    //             res.json({
    //               address:add
    //             })          
    //           }
    //       })
    //     }else{
    //         res.json({
    //           address:user
    //         })
    //     }      
    // })
}
const orderproduct = (req,res,next)=>{
  const delievery = moment().add(4,'day').calendar()
  const orderdate = moment().format('MMMM Do YYYY')
  const productid = mongoose.Types.ObjectId(req.body.productid);
  const productqty = req.body.qty;
  const product_price =  req.body.product_price;
  const addressid =  mongoose.Types.ObjectId(req.body.order_address_id)
  const id = mongoose.Types.ObjectId(req.user.id);
    const filter  = {
      usersid:id
    }
      Cart.findOne(filter,function(err,products){
          if(err) {
            res.json({
              message:err 
            })
          }
          if(products) {
              const product = ()=>{
                 let sum = 0;
                 products.product.forEach(element => {
                   sum =  sum + element.productprice * element.qty    
                 });
                 return sum;  
              }
              const discount = ()=>{
                let totaldiscount = 0;
                let totalprice =  0;
                 products.product.forEach(element => {
                    totaldiscount = ((element.discount) * (element.productprice) * (element.qty))/100;
                    totalprice = totalprice + totaldiscount
                 })                  
                 return totalprice;  
               }    
               const subtotalprice = product();
               const discountprice =  -Math.abs(discount());
               const totalpay  = subtotalprice + discountprice;
               
          
              const order =  new Order({
                  product:products.product,           
                  userid:id,
                  status:"Ordered",
                  order_address_id:addressid,
                  expecteddelievery:delievery,
                  orderdate:orderdate,
                  subtotal: product(),
                  discount: discountprice,
                  totalamountpay:totalpay
              })
          order.save((err,added)=>{
            if (err) {
                res.json({
                  message:err
                })
            } else {
                res.json({
                  order:added
                })            
            }
          }) 
    }else{
          Product.findOne({_id:productid},function(err,product){
            if(err) {
                res.json({
                  message:err 
                })
            }  
            if(product){
                const totoalprice =  product_price * productqty
                const discount = totoalprice -  discount * totoalprice;  
                const order =  new Order({
                  product:{
                    productid:productid,
                    qty:productqty,
                    productprice:product_price          
                  },  
                  subtotal:product_price * productqty,
                  userid:id,
                  status:"Ordered",
                  order_address_id:addressid,
                  expecteddelievery:delievery,
                  orderdate:orderdate
                  
                }) 
                order.save((err,order)=>{
                  if (err) {
                    res.json({
                      message:err
                    })
                  } else {
                    res.json({
                      orderproduct:order
                    })
                }
            })
        }
      })
    }
  })    
}
const displayorder = (req,res,next)=>{
  const id = mongoose.Types.ObjectId(req.user.id);
  const addressid = mongoose.Types.ObjectId(req.body.addressid)
Order.aggregate([
    {$unwind:"$product"},
    {
      $lookup:{
        from:"products",
        let:{prid:"$product.productid",usersid:"$userid"},
        pipeline:[{$match:{$expr:{$and:[
          {$eq:["$$prid","$_id"]},
          {$eq:["$$usersid",id]}
        ]}}}
        ],
        as:"productdetails"
      }
    },
    {
      $lookup:{
        from:"addresses",
        localField:"userid",
        foreignField:"userid",
        as:"myaddress"  
      }
    },
    {
      $unwind:"$myaddress"
    },
    {
      $unwind:"$productdetails"
    },
    {
      $unwind:"$myaddress.address"
    },
    {$match:{
        "myaddress.address._id":addressid   
    }},
    {
      $project:{
        "order_address_id":0,
        "productdetails.productPrice":0,
        "productdetails.productCatid":0,
        "userid":0
      }  
    }        
]).exec((err,order)=>{
    if (err) {
      res.json({
        message:err
      })
    } else {
      res.json({
        myorder:order
      })         
    }
  })
} 
module.exports = {
  getallproducts,
  viewproductdetail,
  addtocart,
  orderproduct,
  displayorder,
  displaycart,
  addaddress     
}