function readMore(req,res){
    try{
        let skipNumberNotif = req.query.skipNumber;
        console.log(skipNumberNotif);
    }catch(error){
        return res.status(500).send(error);
    }
}

module.exports = {
    readMore: readMore
}