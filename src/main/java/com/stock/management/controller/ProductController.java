package com.stock.management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.lang.NonNull;


import com.stock.management.model.Product;
import com.stock.management.service.ProductService;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    // CREATE
    @PostMapping
    public Product addProduct(@RequestBody @NonNull Product product) {
        return productService.saveProduct(product);
    }

    // READ ALL
    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    // READ BY ID
    @GetMapping("/{id}")
    public Product getProduct(@PathVariable @NonNull Long id) {
        return productService.getProductById(id);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable @NonNull Long id) {
        productService.deleteProduct(id);
        return "Product deleted!";
    }
}