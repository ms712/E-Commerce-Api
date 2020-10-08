const Category = require("../models/admin.AddProducts.model").Category;
const mongoose = require("mongoose");
const { Product } = require("../models/admin.AddProducts.model");
//1.Create Category:Done
const createCategory = async (req,res,next)=>{ 
    const catname = req.body.categoryname;
    try {
        const foundcat = await Category.findOne({categoryname:{$regex:catname,$options:"i"}})  
        console.log(foundcat)
        if (foundcat) {
            res.status(200).json({message:"Already Exist Category"})  
        } else {
            let addnewcategory = new Category({categoryname:catname}) 
            const addcat =  await addnewcategory.save()
            res.status(200).json(addcat)
        }    
    } catch (error) {
        throw error   
    }     
} 
//2.Get category details:Done 
const getcategorydetails = async (req,res,next)=>{
const id = mongoose.Types.ObjectId(req.body.catid);
try {
    const categorywise = await Category.aggregate([
        {$lookup:{
            from:"products",
            let:{cat_id:"$_id"},
            pipeline:[
             {$match:{$expr:{
                $and:[
                {$eq:[id,"$productCatid"]},
                {$eq:["$$cat_id","$productCatid"]}]}}}],
            as:"products"
         }},
         {$unwind:"$products"}
    ])
    res.status(200).json(categorywise)   
} catch (error) {
    throw new Error(error)
}
}
//3.update Category then:Done
const updatecategory = async (req,res,next)=>{
    console.log("updating....");
    const filter = {_id:mongoose.Types.ObjectId(req.body.catid)};
    const prfilter = {productCatid:mongoose.Types.ObjectId(req.body.catid)}
    const update = {categoryname:req.body.categoryname};
    const prupdate = {productCategory:req.body.categoryname};
    const options = {new:true}
    try {
        const updatecategory = await Category.findOneAndUpdate(filter,{$set:update},options)
        const updateproductcat = await Product.update(prfilter,prupdate,{multi:true})      
        if (await updatecategory) {
            res.status(200).json({update:updatecategory})
        }else{
            res.status(400).json({update:updatecategory})
        }    
    } catch (error) {
        throw error    
    }
}
//4.Delete Category then products should also delete:Done
const removecategory = async (req,res,next)=>{
    const id = mongoose.Types.ObjectId(req.body.catid);
    try {
        const remove =  await Category.findOneAndDelete({_id:id})
        console.log(remove)     
        if (remove == null) {
           const removeproduct =  Product.remove({productCatid:id})
           res.status(200).json(remove) 
        } 
    } catch (error) {
        throw error
    }                    
}  
////5.list all cactegories with search and pagination:Done
const getallcategory = async (req,res,next)=>{
    const searchcat =  req.body.categoryname ? req.body.categoryname : "";
    const pagination = req.body.pagination ? parseInt(req.body.pagination) : 3
    const page = req.body.pageno ? req.body.pageno:1;
    try {
        const allcat =  await Category.aggregate([
            {$match:{
                categoryname:{
                    $regex:searchcat,
                    $options:"i"
            },}},
            {$skip:((page - 1) * pagination)},
            {$limit:pagination}
        ])
        res.status(200).json(allcat)
    } catch (error) {
        throw new Error(error)
    }
}
module.exports = {
    createCategory,
    getallcategory,
    removecategory,
    updatecategory,
    getcategorydetails
}   


















