exports.error404 = (req, res, next) =>{
    res.status(404).json({message:"Not Founde", success:false})
}