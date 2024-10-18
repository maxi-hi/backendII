import express from "express";
const router = express.Router();
import CartManager from "../dao/db/cart-manager-db.js";
const cartManager = new CartManager();
import CartModel from "../dao/models/cart.model.js";
import CartController from "../controllers/cart.controller.js"
 

// crear un nuevo carrito
router.post("/", CartController.createCart);

// obtener los productos de un carrito
router.get("/:cid", CartController.getCartProducts);

// agregar productos a un carrito
router.post("/:cid/product/:pid", CartController.addProductToCart);

// obtener todos los carritos
router.get("/", CartController.getAllCarts);

// eliminar un carrito
router.delete("/:cid", CartController.deleteCart);

// eliminar un producto de un carrito
router.delete("/:cid/product/:pid", CartController.deleteProductFromCart);

// actualizar un carrito
router.put("/:cid", CartController.updateCart);

// actualizar cantidad de productos en un carrito
router.put("/:cid/products/:pid", CartController.updateProductQuantity);

import ProductModel from "../dao/models/product.model.js";
import UsuarioModel from "../dao/models/usuarios.model.js";
import TicketModel from "../dao/models/tickets.model.js";
import { calcularTotal } from "../util/util.js";

router.get("/:cid/purchase", async (req, res) => {
    const carritoId = req.params.cid;
    try {
        const carrito = await CartModel.findById(carritoId);
        const arrayProductos = carrito.products;

        const productosNoDisponibles = [];

        for (const item of arrayProductos) {
            const productId = item.product;
            const product = await ProductModel.findById(productId);
            if (product.stock >= item.quantity) {
                product.stock -= item.quantity;
                await product.save();
            } else {
                productosNoDisponibles.push(productId);
            }
        }

  

        const usuarioDelCarrito = await UsuarioModel.findOne({cart: carritoId});

        const ticket = new TicketModel({
            purchase_datetime: new Date(), 
            amount: calcularTotal(carrito.products),
            purchaser: usuarioDelCarrito.email
        })

        await ticket.save(); 

        carrito.products = carrito.products.filter(item => productosNoDisponibles.some(productoId => productoId.equals(item.product))); 

        await carrito.save(); 


        res.json({
            message: "Compra generada",
            ticket: {
                id: ticket._id,
                amount: ticket.amount,
                purchaser: ticket.purchaser
            }, 
            productosNoDisponibles
        })

    } catch (error) {
        res.status(500).send("error fatal super mortal");
    }
})

export default router;