package com.stock.management.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int quantity;
    private LocalDate date;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    // Constructors
    public Sale() {}

    public Sale(Product product, int quantity, LocalDate date) {
        this.product = product;
        this.quantity = quantity;
        this.date = date;
    }

    // Getters & Setters
    public Long getId() { return id; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
}