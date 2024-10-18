import mongoose from "mongoose"; 



mongoose.connect("mongodb+srv://maximoperret:coderhouse@cluster0.rclpj.mongodb.net/BackendII?retryWrites=true&w=majority&appName=Cluster0")
    .then( () => console.log("Conexion exitosa!")) 
    .catch( (error) => console.log("Tenemos un error", error))