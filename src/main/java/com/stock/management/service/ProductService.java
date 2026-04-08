package com.stock.management.service;

import com.stock.management.model.Product;
import com.stock.management.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    // Add product
    public Product saveProduct(@NonNull Product product) {
        return productRepository.save(product);

    }

    // Get all products
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Get product by id
    public Product getProductById(@NonNull Long id) {
        return productRepository.findById(id).orElse(null);
    }

    // Delete product
    public void deleteProduct(@NonNull Long id) {
        productRepository.deleteById(id);
    }

    public long countProducts() {
    return productRepository.count();
    }

    public List<Product> getLowquantityProducts() {
    return productRepository.findByQuantityLessThan(5);
    }


}