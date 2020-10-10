const { cond } = require("lodash");
const mongoose = require("mongoose");

const productschema = mongoose.Schema({
   productName:{
       type:String
   },
   productPrice:{
       type:Number
   },
   productCategory:{
       type:String
   },
   companyname:{
       type:String
   },
   productImage:{          
       type:String
   },
   productCatid:{
       type:mongoose.ObjectId
   },
   isAdmin:{
       type:Boolean
   },
   discount:{
       type:Number
   },
   color:{
       type:String
   }
})
const orderschema = mongoose.Schema({
    product:[{
        productid:{
            type:mongoose.ObjectId
        },       
        qty:{
            type:Number
        },
        productprice:{
            type:Number
        },
        discount:{
            type:Number
        }
    }],
    product_price:{
        type:Number
    },
    order_address_id:{
        type:mongoose.ObjectId
    },
    totalamountpay:{
        type:Number
    },
    discount:{
        type:Number
    },
    subtotal:{
        type:Number
    },
    status:{
        type:String
    },
    order_status:{
        type:String
    },
    payment_method:{
        type:String,
        default:"cod"
    },
    payment_status:{
        type:String,
        default:"Pending"
    },
    userid:{
        type:mongoose.ObjectId
    },
    orderdate:{    
        type:String
    },
    expecteddelievery:{
        type:String
    },

})
const cartschema = mongoose.Schema({
    product:[{
        productid:{
            type:mongoose.ObjectId
        },       
        qty:{
            type:Number
        },
        productprice:{
            type:Number  
        },
        discount:{
            type:Number
        },
        date:{
            type:String
        }
    }], 
    usersid:{
        type:mongoose.ObjectId
    },
    totalamount:{
        type:Number
    }
})
const categoryschema = mongoose.Schema({
    categoryname:{
        type:String
    }
})
const addresSchema = mongoose.Schema({
    address:[{
        address:{
            type:String
        },
        city:{
            type:String
        },
        State:{
             type:String   
        },
        landmark:{
            type:String
        },
        phonenumber:{
            type:Number
        },
        trackstatus:{
            type:String
        },
        pincode:{
            type:Number
        },
        typeofaddress:{
            type:String,
            default:"Home"
        } 
    }],
    userid:{
        type:mongoose.ObjectId   
    }
})

const Cart =  new mongoose.model("cart",cartschema)
const Category =  new mongoose.model("category",categoryschema);
const Product  =  new mongoose.model("product",productschema);
const Order = new mongoose.model("order",orderschema);
const Address = new mongoose.model("address",addresSchema)

module.exports = {
    Category,
    Product,
    Order,
    Cart,
    Address
}




