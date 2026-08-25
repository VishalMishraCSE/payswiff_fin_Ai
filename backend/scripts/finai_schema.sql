-- ==========================================================
-- FinAI Merchant Intelligence Platform - MySQL Schema
-- Database: finai_db
-- Compatibility: MySQL 8.0+ / MySQL Workbench
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `finai_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `finai_db`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `hashed_password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(50) DEFAULT 'merchant',
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `ix_users_id` (`id`),
    INDEX `ix_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Merchants Table
CREATE TABLE IF NOT EXISTS `merchants` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `business_name` VARCHAR(255) NOT NULL,
    `user_id` INT NOT NULL UNIQUE,
    `kyc_status` VARCHAR(50) DEFAULT 'pending',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `ix_merchants_id` (`id`),
    CONSTRAINT `fk_merchants_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Transactions Table
CREATE TABLE IF NOT EXISTS `transactions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `reference_id` VARCHAR(100) NOT NULL UNIQUE,
    `merchant_id` INT NOT NULL,
    `customer_name` VARCHAR(255) NOT NULL,
    `customer_email` VARCHAR(255) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(10) DEFAULT 'INR',
    `status` VARCHAR(50) DEFAULT 'Pending',
    `payment_method` VARCHAR(50) NOT NULL,
    `is_fraud` BOOLEAN DEFAULT FALSE,
    `fraud_score` DOUBLE DEFAULT 0.0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `ix_transactions_id` (`id`),
    INDEX `ix_transactions_reference_id` (`reference_id`),
    INDEX `ix_transactions_merchant_id` (`merchant_id`),
    CONSTRAINT `fk_transactions_merchant_id` FOREIGN KEY (`merchant_id`) REFERENCES `merchants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Audit Logs Table
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `method` VARCHAR(20) NOT NULL,
    `path` VARCHAR(255) NOT NULL,
    `user_email` VARCHAR(255) NULL,
    `status_code` INT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `ix_audit_logs_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. KYC Documents Table
CREATE TABLE IF NOT EXISTS `kyc_documents` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `merchant_id` INT NOT NULL,
    `document_type` VARCHAR(50) NOT NULL,
    `file_path` VARCHAR(500) NOT NULL,
    `extracted_text` TEXT NULL,
    `blur_score` DOUBLE NULL,
    `status` VARCHAR(50) DEFAULT 'pending',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `ix_kyc_documents_id` (`id`),
    CONSTRAINT `fk_kyc_documents_merchant_id` FOREIGN KEY (`merchant_id`) REFERENCES `merchants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Merchant Settings Table
CREATE TABLE IF NOT EXISTS `merchant_settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `merchant_id` INT NOT NULL UNIQUE,
    `rate_limit_per_min` INT DEFAULT 100,
    `mfa_enabled` BOOLEAN DEFAULT FALSE,
    `settlement_buffer` DOUBLE DEFAULT 0.0,
    INDEX `ix_merchant_settings_id` (`id`),
    CONSTRAINT `fk_merchant_settings_merchant_id` FOREIGN KEY (`merchant_id`) REFERENCES `merchants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- Helpful Sample Queries for MySQL Workbench:
-- ==========================================================
-- 1. View all transactions:
-- SELECT * FROM transactions ORDER BY created_at DESC LIMIT 50;

-- 2. View fraud alerts:
-- SELECT * FROM transactions WHERE is_fraud = 1 ORDER BY fraud_score DESC;

-- 3. View merchants & KYC status:
-- SELECT m.id, m.business_name, m.kyc_status, u.email FROM merchants m JOIN users u ON m.user_id = u.id;

-- 4. View latest audit log entries:
-- SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 20;
