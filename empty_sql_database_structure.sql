DROP DATABASE IF EXISTS Web_projekti_restaurant;
CREATE DATABASE IF NOT EXISTS Web_projekti_restaurant;
USE Web_projekti_restaurant;

CREATE TABLE `USERS` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `username` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE,
  `phone` varchar(255) UNIQUE,
  `password` VARCHAR(255),
  `role` VARCHAR(50) DEFAULT 'user'
);

CREATE TABLE `DISHES` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL,
  `image_url` VARCHAR(255),
  `dietary_tags` VARCHAR(255),
  `is_active` BOOLEAN DEFAULT true
);

CREATE TABLE `DAILY_MENUS` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `date` DATE NOT NULL,
  `day_name` VARCHAR(50),
  `theme_title` VARCHAR(255),
  `theme_image` VARCHAR(255)
);

CREATE TABLE `DAILY_MENU_DISHES` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `daily_menu_id` INT NOT NULL,
  `dish_id` INT NOT NULL
);

CREATE TABLE `ORDERS` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `pickup_time` DATETIME,
  `total_price` DECIMAL(10,2) NOT NULL,
  `status` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `ORDER_ITEMS` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `dish_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10,2) NOT NULL
);
