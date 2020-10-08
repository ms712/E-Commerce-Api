const { sortedLastIndexOf, sum, reject, result } = require("lodash"); 
const mongoose = require("mongoose");
var Promise = require("bluebird");
Promise.promisifyAll(require("mongoose"));
const Order = require("../models/admin.AddProducts.model").Order;
const Cart = require("../models/admin.AddProducts.model").Cart;
const Address = require("../models/admin.AddProducts.model").Address;
const moment =  require("moment");
const Product = require("../models/admin.AddProducts.model").Product;
const getallproducts = async (req,res,next)=>{
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
      $options:"i",}}
  }
  if(productColors){
     productColor = {"color":productColors}
  }
  if(categoryid) {
    catid = {"productCatid": categoryid}
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
  try {
    const product = await Product.aggregate([
      {$match:{$and:[   
            productsSearch,
            catid,
            productColor,
            price                           
      ]}},      
      {$skip:(page - 1) * pagination},
      {$limit:pagination},
      {$lookup:{
          from:"categories",
          let:{prcatid:"$productCatid",price:"$productPrice"},
          pipeline:[
            {$match:{$expr:{$and:[
                  {$eq:["$$prcatid","$_id"]},
          ]}}}],
          as:"catehory_info"
      }},
        {$unwind:"$catehory_info"}
    ])
    res.status(200).json(product)

  } catch (error) {
    throw new Error(error)
  }
}
const viewproductdetail = async (req,res,next)=>{
    const id = mongoose.Types.ObjectId(req.body.productid);
    try {
      const product = await Product.aggregate([
        {$match:{"_id":id}},
        {$lookup:{
          from:"categories",
          let:{product_id:"$productCatid"},
          pipeline:[
            {$match:{$expr:
                {$and:[
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
      ])
      res.status(200).json(product)
    } catch (error) {
      throw new Error(error)
    }   
} 
const addtocart = async (req,res,next)=>{
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
        try {
          let cart = await Cart.findOne(filter)  
              if(await cart) {
                let ids =   cart.product.findIndex(id => (id.productid == prid))
                if(ids > -1){
                  let productcart = await Cart.findOneAndUpdate(productfilter,{$inc:{"product.$.qty":1}},{new:true})
                  res.status(200).json(productcart)
                }else{
                  const newcartproduct = Cart.findOneAndUpdate(filter,{$push:{product:{
                    productid:prid,
                    qty:qtyv,
                    productprice:productprice,
                    discount:discount,
                    date:date          
                  }}},{new:true})
                  const cart = await newcartproduct
                  res.status(200).json(cart)                              
              }
            }else{
              const addproduct = new Cart({     
                product:{
                    productid:prid,
                    qty:qtyv,
                    productprice:productprice,
                    discount:discount,
                    date:date          
                },
                usersid:userid
              })
             const saveproduct = await addproduct.save()
             res.status(200).json(saveproduct)
            }   
        } catch (error) {
              res.json(new Error(res.status))
        }  
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
    try {
          const response = await Address.findOneAndUpdate({userid:id},{$push:{address:{
            address:delieveryaddress,
            city:city,
            state:state,
            landmark:landmark,
            pincode:pincode,
            phonenumber:phonenumber,
        }}},{new:true})
        if (response == null) {
              const address =  new Address({
                    address:{
                      address:delieveryaddress,
                      city:city,
                      state:state,
                      landmark:landmark,
                      pincode:pincode,
                      phonenumber:phonenumber,
                  },
                  userid:id
              })
              const newaddress = await address.save()
              res.status(200).json(newaddress)
        } else {
              res.status(200).json(response)
        }
    } catch (error) { 
      res.json(new Error(res.status))
    }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
}
const orderproduct = async (req,res,next)=>{
  const delievery = moment().add(4,'day').calendar()
  const orderdate = moment().format('MMMM Do YYYY')
  const productid = mongoose.Types.ObjectId(req.body.productid);
  const productqty = req.body.qty;
  const product_price =  req.body.product_price;
  const addressid =  mongoose.Types.ObjectId(req.body.order_address_id)
  const id = mongoose.Types.ObjectId(req.user.id);
  console.log("my id...",id)
  const filter  = {
      usersid:id
    }
    try {
      const founcart = await Cart.findOne(filter)
      if(await founcart){
          const product = ()=>{
            let sum = 0;
            founcart.product.forEach(element => {
              sum =  sum + element.productprice * element.qty    
            });
            return sum;  
          }
          const discount = ()=>{
            let totaldiscount = 0;
            let totalprice =  0;
            founcart.product.forEach(element => {
                totaldiscount = ((element.discount) * (element.productprice) * (element.qty))/100;
                totalprice = totalprice + totaldiscount
             })                  
             return totalprice;  
           }
           const subtotalprice = product();
           const discountprice =  -Math.abs(discount());
           const totalpay  = subtotalprice + discountprice
           const order =  new Order({
              product:founcart.product,           
              userid:id,
              status:"Ordered",
              order_address_id:addressid,
              expecteddelievery:delievery,
              orderdate:orderdate,
              subtotal: product(),
              discount: discountprice,
              totalamountpay:totalpay
          })
          const orders = await order.save();
          if (await orders) {
            res.status(200).json(orders)
          } else {
            res.status(400).json(orders)
          }
      }else{
        const foundproduct = await Product.findOne({_id:productid})
          if (await foundproduct) {
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
              const saveorder = await order.save()
              res.status(200).json(saveorder)
          } else {
            res.status(400).json({})           
          }
      }
    } catch (error) {
      throw error
    }    
}
const displayorder = async (req,res,next)=>{
  const id = mongoose.Types.ObjectId(req.user.id);
  const addressid = mongoose.Types.ObjectId(req.body.addressid)
  try{
    const order =  await Order.aggregate([
        {$unwind:"$product"},
        {$lookup:{                                                                                                            
             from:"products",
            let:{prid:"$product.productid",usersid:"$userid"},
            pipeline:[{$match:{$expr:{$and:[
              {$eq:["$$prid","$_id"]},
              {$eq:["$$usersid",id]}
            ]}}}
            ],                                                                                                                            
            as:"productdetails"}},
        {$lookup:{
            from:"addresses",
            localField:"userid",                                                                                                                                                                                                                                                                                                                                                                  
            foreignField:"userid",
            as:"myaddress"  
          }},
        {$unwind:"$myaddress"},
        {$unwind:"$productdetails"},
        {$unwind:"$myaddress.address"},  
        {$match:{"myaddress.address._id":addressid}},
        {$project:{
            "order_address_id":0,
            "productdetails.productPrice":0,
            "productdetails.productCatid":0,
            "userid":0
        }}        
    ])
    res.status(200).json(order)
  } catch(error) {
    throw new Error(error)
  }
  
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