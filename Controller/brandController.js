import Brand from "../Model/brand.js";
import Product from "../Model/productModel.js";
import fs from 'fs'
import ReferralOffer from "../Model/referralOffer.js";

const createBrand = async (req, res) => {
  try {
    const { name } = req.body;
    const image = `/img/brand/${req.file.filename}`;

    if (!name.trim()) {
      res.status(400).json({ success: false, message: "Please Enter Name" });
      return;
    }

    const exists = await Brand.findOne({ name: name.toLowerCase() });
    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: "Brand Name Already Exist" });
    }

    const newBrand = new Brand({
      name:name.toLowerCase(),
      image,
    });
    await newBrand.save();

    res
      .status(200)
      .json({ success: true, message: "Brand created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
};


const getAllBrands = async(req,res)=>{

    try {
        const brands = await Brand.find()
      
       
        res.status(200).json({success:true , message:"fetched all brands" ,brands})

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Internal Server error" });
    }

}

const deleteBrand  = async (req,res)=>{
    try {
        const {id }= req.params
    
        const brand = await Brand.findOne({_id:id})
        if(!brand){
            res.status(400).json({success:false,message:"No brand found"})
            return
        }
        const existProduct = await Product.findOne({brand:id})

        if(existProduct){
          res.status(409).json({success:false,message:"Can't delete this brand have products"})
          return
        }

        fs.unlinkSync(`.${brand.image}`)
        await Brand.findByIdAndDelete(id)
        res.status(200).json({success:true,message:"Brand Deleted Successfully"})
        

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Internal Server error" });
    }
}

const topSellingBrands = async(req,res)=>{
  try {
   
    const brands = await Brand.find({buyCount:{$ne:0}}).sort({buyCount:-1}).limit(10)
    res.status(200).json({success:true,brands})
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
}

export { createBrand ,getAllBrands ,deleteBrand,topSellingBrands};
