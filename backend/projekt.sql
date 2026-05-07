-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               11.8.3-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.11.0.7065
-- --------------------------------------------------------
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */
;
/*!40101 SET NAMES utf8 */
;
/*!50503 SET NAMES utf8mb4 */
;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */
;
/*!40103 SET TIME_ZONE='+00:00' */
;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */
;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */
;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */
;
-- Dumping database structure for web_projekti_restaurant
DROP DATABASE IF EXISTS `web_projekti_restaurant`;
CREATE DATABASE IF NOT EXISTS `web_projekti_restaurant`
/*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */
;
USE `web_projekti_restaurant`;
-- Dumping structure for table web_projekti_restaurant.daily_menus
DROP TABLE IF EXISTS `daily_menus`;
CREATE TABLE IF NOT EXISTS `daily_menus` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `day_name` varchar(20) NOT NULL,
  `theme_title` varchar(120) DEFAULT NULL,
  `theme_image` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_daily_menus_date` (`date`),
  KEY `idx_daily_menus_date` (`date`)
) ENGINE = InnoDB AUTO_INCREMENT = 70 DEFAULT CHARSET = latin1 COLLATE = latin1_swedish_ci;
-- Dumping data for table web_projekti_restaurant.daily_menus: ~17 rows (approximately)
DELETE FROM `daily_menus`;
INSERT INTO `daily_menus` (
    `id`,
    `date`,
    `day_name`,
    `theme_title`,
    `theme_image`,
    `created_at`,
    `updated_at`
  )
VALUES (
    1,
    '2026-04-20',
    'Monday',
    '1',
    '/uploads/menu/test.jpg',
    '2026-04-21 14:54:25',
    '2026-04-25 15:34:06'
  ),
  (
    2,
    '2026-04-21',
    'Tuesday',
    '2',
    '/uploads/menu/test.jpg',
    '2026-04-21 14:54:25',
    '2026-04-25 15:34:05'
  ),
  (
    3,
    '2026-04-22',
    'Wednesday',
    '3',
    '/uploads/menu/test.jpg',
    '2026-04-23 21:18:32',
    '2026-04-25 15:34:04'
  ),
  (
    4,
    '2026-04-23',
    'Thursday',
    '4',
    'uploads/menu/test.jpg',
    '2026-04-23 21:18:46',
    '2026-04-24 15:15:22'
  ),
  (
    5,
    '2026-04-24',
    'Friday',
    '5',
    '/uploads/menu/test.jpg',
    '2026-04-23 15:27:59',
    '2026-04-25 15:34:00'
  ),
  (
    6,
    '2026-04-25',
    'Saturday',
    '6',
    '/uploads/menu/test.jpg',
    '2026-04-21 14:54:25',
    '2026-04-25 15:34:02'
  ),
  (
    7,
    '2026-04-26',
    'Sunday',
    '7',
    '/uploads/menu/test.jpg',
    '2026-04-21 14:54:25',
    '2026-04-25 15:33:55'
  ),
  (
    25,
    '2026-04-27',
    'Monday',
    'slop',
    '/uploads/menu/test.jpg',
    '2026-04-25 17:43:50',
    '2026-04-27 11:30:24'
  ),
  (
    29,
    '2026-04-30',
    'Thursday',
    'trash poop food',
    '/uploads/menu/test.jpg',
    '2026-04-27 09:37:54',
    '2026-04-27 11:31:04'
  ),
  (
    31,
    '2026-04-29',
    'Wednesday',
    'isoin kakka mailmassa',
    '/uploads/menu/kakka.jpg',
    '2026-04-27 11:00:22',
    '2026-04-27 11:07:00'
  ),
  (
    35,
    '2026-04-28',
    'Tuesday',
    'Casino food',
    '/uploads/menu/sid.jpg',
    '2026-04-27 11:11:34',
    '2026-04-27 11:15:48'
  ),
  (
    62,
    '2026-05-03',
    'Sunday',
    'dghhdggggg',
    '/uploads/menu/kakka.jpg',
    '2026-05-02 15:43:41',
    '2026-05-02 15:43:57'
  ),
  (
    63,
    '2026-05-04',
    'Monday',
    'jou kakka',
    '/uploads/menu/test.jpg',
    '2026-05-03 18:34:25',
    '2026-05-03 18:34:25'
  ),
  (
    64,
    '2026-05-06',
    'Wednesday',
    'fhhh',
    '/uploads/menu/1777566218887_sushi.jpg',
    '2026-05-03 18:49:04',
    '2026-05-03 18:49:04'
  ),
  (
    65,
    '2026-05-07',
    'Thursday',
    'ggg',
    '/uploads/menu/sid.jpg',
    '2026-05-05 11:31:55',
    '2026-05-05 11:31:55'
  ),
  (
    67,
    '2026-05-05',
    'Tuesday',
    'kakka kakka',
    '/uploads/menu/1777972796355_lentokentahavio4-1.jpg',
    '2026-05-05 16:07:06',
    '2026-05-05 16:07:06'
  ),
  (
    69,
    '2026-05-08',
    'Friday',
    'lkjhgfghjkuytghnmjhgf',
    '/uploads/menu/1777986447656_lentokonehavio3.jpg',
    '2026-05-06 13:41:04',
    '2026-05-06 13:41:04'
  );
-- Dumping structure for table web_projekti_restaurant.daily_menu_dishes
DROP TABLE IF EXISTS `daily_menu_dishes`;
CREATE TABLE IF NOT EXISTS `daily_menu_dishes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `daily_menu_id` int(11) NOT NULL,
  `dish_id` int(11) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_dmd_pair` (`daily_menu_id`, `dish_id`),
  KEY `idx_dmd_menu` (`daily_menu_id`),
  KEY `idx_dmd_dish` (`dish_id`),
  CONSTRAINT `fk_dmd_dish` FOREIGN KEY (`dish_id`) REFERENCES `dishes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dmd_menu` FOREIGN KEY (`daily_menu_id`) REFERENCES `daily_menus` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 52 DEFAULT CHARSET = latin1 COLLATE = latin1_swedish_ci;
-- Dumping data for table web_projekti_restaurant.daily_menu_dishes: ~27 rows (approximately)
DELETE FROM `daily_menu_dishes`;
INSERT INTO `daily_menu_dishes` (`id`, `daily_menu_id`, `dish_id`, `sort_order`)
VALUES (4, 1, 4, 1),
  (5, 2, 5, 2),
  (6, 3, 6, 3),
  (7, 4, 7, 1),
  (8, 5, 8, 2),
  (9, 6, 6, 3),
  (15, 7, 17, 0),
  (16, 7, 18, 0),
  (17, 7, 19, 0),
  (18, 25, 20, 0),
  (19, 25, 21, 0),
  (23, 31, 25, 0),
  (24, 31, 26, 0),
  (25, 31, 27, 0),
  (26, 31, 28, 0),
  (28, 35, 30, 0),
  (35, 29, 37, 0),
  (37, 62, 39, 0),
  (38, 63, 40, 0),
  (40, 65, 42, 0),
  (41, 65, 43, 0),
  (42, 64, 44, 0),
  (43, 64, 45, 0),
  (45, 67, 47, 0),
  (46, 67, 48, 0),
  (50, 69, 52, 0),
  (51, 69, 53, 0);
-- Dumping structure for table web_projekti_restaurant.dishes
DROP TABLE IF EXISTS `dishes`;
CREATE TABLE IF NOT EXISTS `dishes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(6, 2) NOT NULL,
  `current_dish_image` varchar(255) DEFAULT NULL,
  `dietary_tags` varchar(100) DEFAULT '',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_dishes_active` (`is_active`)
) ENGINE = InnoDB AUTO_INCREMENT = 58 DEFAULT CHARSET = latin1 COLLATE = latin1_swedish_ci;
-- Dumping data for table web_projekti_restaurant.dishes: ~54 rows (approximately)
DELETE FROM `dishes`;
INSERT INTO `dishes` (
    `id`,
    `name`,
    `description`,
    `price`,
    `current_dish_image`,
    `dietary_tags`,
    `is_active`,
    `created_at`,
    `updated_at`
  )
VALUES (
    2,
    'Miso Veggie Ramen',
    'Rich white miso broth, tofu, shiitake mushrooms & spring onion.',
    14.50,
    '/uploads/menu/test.jpg',
    'vegan,lactosefree',
    1,
    '2026-04-21 14:54:25',
    '2026-04-25 15:33:50'
  ),
  (
    3,
    'Gyoza (6 pcs)',
    'Pan-fried pork & cabbage dumplings with yuzu ponzu dipping sauce.',
    9.00,
    '/uploads/menu/test.jpg',
    '',
    1,
    '2026-04-21 14:54:25',
    '2026-04-25 15:33:48'
  ),
  (
    4,
    'Classic Smash Burger',
    'Double smash patty, aged cheddar, caramelised onion & wolf sauce.',
    13.90,
    '/uploads/menu/test.jpg',
    'glutenfree',
    1,
    '2026-04-21 14:54:25',
    '2026-04-25 15:33:46'
  ),
  (
    5,
    'Mushroom Smash',
    'Portobello patty, vegan cheese, sriracha aioli & pickled jalapeño.',
    13.50,
    '/uploads/menu/test.jpg',
    'vegan,glutenfree',
    1,
    '2026-04-21 14:54:25',
    '2026-04-25 15:33:44'
  ),
  (
    6,
    'Wolf Fries',
    'Crispy fries with rosemary salt & house aioli.',
    5.00,
    '/uploads/menu/test.jpg',
    'vegan,glutenfree,lactosefree',
    1,
    '2026-04-21 14:54:25',
    '2026-04-24 12:10:10'
  ),
  (
    7,
    'Birria Tacos',
    'Braised beef in adobo, Oaxaca cheese, consommé for dipping.',
    14.00,
    '/uploads/menu/test.jpg',
    '',
    1,
    '2026-04-21 14:54:25',
    '2026-04-25 15:33:43'
  ),
  (
    8,
    'Jackfruit Tacos',
    'Pulled jackfruit, guacamole, pico de gallo & lime crema.',
    13.00,
    '/uploads/menu/test.jpg',
    'vegan,glutenfree',
    1,
    '2026-04-21 14:54:25',
    '2026-04-25 15:33:41'
  ),
  (
    11,
    'Testiramen',
    'Päivitetty kuvaus',
    15.90,
    '/uploads/menu/test.jpg',
    'lactosefree',
    1,
    '2026-04-23 16:07:47',
    '2026-04-25 15:33:38'
  ),
  (
    12,
    'Smash Burger',
    NULL,
    13.90,
    '/uploads/menu/test.jpg',
    'glutenfree',
    1,
    '2026-04-24 09:08:11',
    '2026-04-24 09:43:04'
  ),
  (
    13,
    'hhhh',
    'ggggg',
    54.00,
    '/uploads/menu/test.jpg',
    'vegan',
    1,
    '2026-04-25 17:42:17',
    '2026-04-27 10:59:01'
  ),
  (
    14,
    'nnn',
    'ghgg',
    55.00,
    '/uploads/menu/test.jpg',
    'glutenfree',
    1,
    '2026-04-25 17:42:40',
    '2026-04-27 10:59:03'
  ),
  (
    15,
    'eeee',
    '1',
    1.00,
    '/uploads/menu/test.jpg',
    'lactosefree',
    1,
    '2026-04-25 18:39:30',
    '2026-04-27 10:59:05'
  ),
  (
    16,
    '123',
    '123',
    1231.00,
    '/uploads/menu/test.jpg',
    'vegan',
    1,
    '2026-04-25 18:39:55',
    '2026-04-27 10:59:09'
  ),
  (
    17,
    '1234',
    '1234',
    1234.00,
    '/uploads/menu/test.jpg',
    'glutenfree',
    1,
    '2026-04-25 18:45:00',
    '2026-04-27 10:59:07'
  ),
  (
    18,
    'www',
    'wwwew',
    12.00,
    '/uploads/menu/test.jpg',
    '',
    1,
    '2026-04-25 18:46:03',
    '2026-04-27 10:59:11'
  ),
  (
    19,
    'ggg',
    'ggg',
    333.00,
    '/uploads/menu/test.jpg',
    'vegan,glutenfree,lactosefree',
    1,
    '2026-04-25 18:46:16',
    '2026-04-27 10:59:13'
  ),
  (
    20,
    'penis',
    'hgrew',
    654.00,
    '/uploads/menu/test.jpg',
    'lactosefree',
    1,
    '2026-04-25 18:47:12',
    '2026-04-27 10:59:15'
  ),
  (
    21,
    'hjygjgf',
    'ytyhjhgydhgfjg',
    7654.00,
    '/uploads/menu/test.jpg',
    'vegan',
    1,
    '2026-04-25 18:47:29',
    '2026-04-27 10:59:18'
  ),
  (
    22,
    'kakka',
    'haiseva',
    1.00,
    '/uploads/menu/test.jpg',
    'vegan',
    1,
    '2026-04-25 18:48:00',
    '2026-04-27 10:59:20'
  ),
  (
    23,
    'gfhnf',
    'gdghd',
    3.00,
    '/uploads/menu/test.jpg',
    'lactosefree',
    1,
    '2026-04-27 09:39:19',
    '2026-04-27 10:59:22'
  ),
  (
    24,
    'hd kakka',
    'hd kasvis kakka',
    5.00,
    '/uploads/menu/test.jpg',
    'vegan,glutenfree',
    1,
    '2026-04-27 09:40:56',
    '2026-04-27 11:09:40'
  ),
  (
    25,
    'kakka',
    'kakka',
    213.00,
    '/uploads/menu/kakka.jpg',
    'vegan,glutenfree,lactosefree',
    1,
    '2026-04-27 11:00:45',
    '2026-04-27 11:07:28'
  ),
  (
    26,
    'kissasn kakka',
    'kissasn kakka',
    54.00,
    '/uploads/menu/kakka.jpg',
    'glutenfree',
    1,
    '2026-04-27 11:01:26',
    '2026-04-27 11:07:30'
  ),
  (
    27,
    'isoin kakka',
    'isoin kakka',
    555.00,
    '/uploads/menu/kakka.jpg',
    '',
    1,
    '2026-04-27 11:01:43',
    '2026-04-27 11:07:32'
  ),
  (
    28,
    'pieni kakka',
    'pieni kakka',
    2.00,
    '/uploads/menu/kakka.jpg',
    'lactosefree',
    1,
    '2026-04-27 11:02:11',
    '2026-04-27 11:07:34'
  ),
  (
    29,
    'casino',
    'casino',
    666.00,
    '/uploads/menu/test.jpg',
    'vegan',
    1,
    '2026-04-27 11:08:54',
    '2026-04-30 18:10:55'
  ),
  (
    30,
    'balls',
    'balls',
    9999.00,
    '/uploads/menu/balls.png',
    'glutenfree',
    1,
    '2026-04-27 11:12:14',
    '2026-04-27 11:19:13'
  ),
  (
    31,
    'ass',
    'ass',
    1.00,
    '/uploads/menu/test.jpg',
    '',
    1,
    '2026-04-27 11:22:18',
    '2026-04-27 11:23:45'
  ),
  (
    32,
    'penis',
    'penis',
    4.00,
    '/uploads/menu/1777561866644_asssssdddd.png',
    'lactosefree',
    1,
    '2026-04-27 11:22:53',
    '2026-04-30 18:11:13'
  ),
  (
    33,
    'balls',
    'balls',
    54.00,
    '/uploads/menu/test.jpg',
    'glutenfree',
    1,
    '2026-04-27 11:23:28',
    '2026-04-27 11:23:50'
  ),
  (
    34,
    'hygrhfgfgd',
    'gdrdfdgbdf',
    5434.00,
    NULL,
    'vegan,glutenfree',
    1,
    '2026-04-27 15:49:17',
    '2026-04-27 15:49:17'
  ),
  (
    35,
    'kissa sheet',
    'kissa sheet',
    6.00,
    '/uploads/menu/1777461685067_8njqhdxjafoppwdgom2sxo3wrk1jquyy__1_.jpg',
    'lactosefree',
    1,
    '2026-04-29 14:20:19',
    '2026-04-29 14:24:53'
  ),
  (
    36,
    'efefer',
    'rtytrhrth',
    9876.00,
    '/uploads/menu/1777469230152_dogggg.jpg',
    'vegan,glutenfree,lactosefree',
    1,
    '2026-04-30 19:15:58',
    '2026-04-30 19:15:58'
  ),
  (
    37,
    'jkhgfd',
    'kkk',
    6666.00,
    '/uploads/menu/1777566218887_sushi.jpg',
    'vegan,glutenfree,lactosefree',
    1,
    '2026-04-30 19:37:17',
    '2026-04-30 19:37:17'
  ),
  (
    38,
    'gggg',
    'ggggg',
    44.00,
    '/uploads/menu/1777561866644_asssssdddd.png',
    'vegan,lactosefree',
    1,
    '2026-05-02 11:32:12',
    '2026-05-02 11:32:12'
  ),
  (
    39,
    'gdhdhd',
    'bbddb',
    4.00,
    '/uploads/menu/sid.jpg',
    'vegan,glutenfree,lactosefree',
    1,
    '2026-05-02 15:44:11',
    '2026-05-02 15:44:11'
  ),
  (
    40,
    'pipi',
    'pipi',
    1122.00,
    '/uploads/menu/kakka.jpg',
    'vegan,glutenfree,lactosefree',
    1,
    '2026-05-03 18:34:50',
    '2026-05-03 18:34:50'
  ),
  (
    41,
    'ffss',
    'dgd',
    44.00,
    '/uploads/menu/1777823375669__________________________1_.jpg',
    'glutenfree',
    1,
    '2026-05-03 18:50:10',
    '2026-05-03 18:50:10'
  ),
  (
    42,
    'jo',
    'sdiufdjigdkakkag t jiojgoei ihihgitrn grthgtr ht htr hrt \nhrt htrh rj righ erh ugeihiuh uieu erh guhbeh hj fn jdf berin gvriniu nb nnnngort ifnb fibjfg  f ff  fgb fg gdghuir hgiuerhguihiuniue i',
    45.00,
    '/uploads/menu/test.jpg',
    'glutenfree',
    1,
    '2026-05-05 11:32:23',
    '2026-05-05 16:09:23'
  ),
  (
    43,
    'gopnik',
    'In Git, main and master are technically identical. They are both just pointers to the latest commit in your primary line of development. The difference is entirely about naminbbbg conventions and industry shifts.Key DifferencesThe Name Change: Historically, master was the default name for the primary branch. In 2020, major platforms like GitHub, GitLab, and Bitbucket switched the default to main to move toward more inclusive and neutral language [2].Git Versioning: Since Git version 2.28, users can choose their own default branch name. Modern Git installations often prompt you to use main [2, 3].Functionality: There is zero functional difference. Both act as the "source of truth" for your project’s production-ready code.',
    5563.00,
    '/uploads/menu/1777969982201_birria.jpg',
    'glutenfree,lactosefree',
    1,
    '2026-05-05 11:33:33',
    '2026-05-05 16:09:06'
  ),
  (
    44,
    'kissa',
    'and console -> Server running at http://127.0.0.1:3000/\ncreateOrder: Error: Cannot add or update a child row: a foreign key constraint fails (`andreits`.`order_items`, CONSTRAINT `fk_oi_dish` FOREIGN KEY (`dish_id`) REFERENCES `dishes` (`id`) ON DELETE SET NULL)\n    at createOrder (file:///C:/Users/andre/Documents/metropolia_tehtavat/Web-sovelluskehitys-koko-kurssi-2026/Web_projekti_restaurant/backend/src/api/controllers/orderController.js:193:18',
    7654.00,
    '/uploads/menu/1777972796355_lentokentahavio4-1.jpg',
    'vegan,glutenfree,lactosefree',
    1,
    '2026-05-05 12:19:21',
    '2026-05-05 12:20:08'
  ),
  (
    45,
    'siska',
    'and console -> Server running at http://127.0.0.1:3000/\ncreateOrder: Error: Cannot add or update a child row: a foreign key constraint fails (`andreits`.`order_items`, CONSTRAINT `fk_oi_dish` FOREIGN KEY (`dish_id`) REFERENCES `dishes` (`id`) ON DELETE SET NULL)\n    at createOrder (file:///C:/Users/andre/Documents/metropolia_tehtavat/Web-sovelluskehitys-koko-kurssi-2026/Web_projekti_restaurant/backend/src/api/controllers/orderController.js:193:18and console -> Server running at http://127.0.0.1:3000/\ncreateOrder: Error: Cannot add or update a child row: a foreign key constraint fails (`andreits`.`order_items`, CONSTRAINT `fk_oi_dish` FOREIGN KEY (`dish_id`) REFERENCES `dishes` (`id`) ON DELETE SET NULL)\n    at createOrder (file:///C:/Users/andre/Documents/metropolia_tehtavat/Web-sovelluskehitys-koko-kurssi-2026/Web_projekti_restaurant/backend/src/api/controllers/orderController.js:193:18',
    12.00,
    '/uploads/menu/test.jpg',
    '',
    1,
    '2026-05-05 12:20:36',
    '2026-05-05 12:20:36'
  ),
  (
    46,
    'fffgvfvfv',
    '54',
    1.00,
    '/uploads/menu/1777972796355_lentokentahavio4-1.jpg',
    'vegan',
    1,
    '2026-05-05 15:03:32',
    '2026-05-05 15:03:32'
  ),
  (
    47,
    'piu',
    'iugfcghjuytghjhyyghghghg',
    5455.00,
    '/uploads/menu/1777986447656_lentokonehavio3.jpg',
    'vegan,glutenfree,lactosefree',
    1,
    '2026-05-05 16:07:52',
    '2026-05-05 16:07:52'
  ),
  (
    48,
    'e bali',
    'govno',
    7654.00,
    '/uploads/menu/sid.jpg',
    'glutenfree',
    1,
    '2026-05-05 16:08:36',
    '2026-05-05 16:08:36'
  ),
  (
    49,
    'yyyyyy',
    '666666',
    6.00,
    '/uploads/menu/1777989722805_restaurand_er_2.png',
    'lactosefree',
    1,
    '2026-05-05 17:02:34',
    '2026-05-05 17:02:34'
  ),
  (
    50,
    'yu55gtr',
    'fssgvsvsvs',
    6.00,
    '/uploads/menu/kakka.jpg',
    '',
    1,
    '2026-05-05 17:04:29',
    '2026-05-05 17:04:29'
  ),
  (
    51,
    'tttt',
    'Kurssimateriaalin osat 0-8 ja 13 on tehnyt Matti Luukkainen. Osa 9 on Terveystalon ohjelmistokehittäjien tekemä. Osan 10 on tehnyt Kalle Ilves. Osa 11 on Smartlyn ohjelmistokehittäjien tekemä ja osa 12 on tehnyt Jami Kousa. Lukuisat henkilöt ovat parantaneet materiaalin laatua kirjoitus- ja asiavirhekorjauksin. Voit osallistua kurssimateriaalin parantamiseen myös itse.\n\nSivuston designin on suunnitellut ja toteuttanut Houston inc, joka on myös auditoinut kurssin sisällön.',
    55.00,
    '/uploads/menu/1777469230152_dogggg.jpg',
    'lactosefree',
    1,
    '2026-05-05 17:04:59',
    '2026-05-05 17:04:59'
  ),
  (
    52,
    'eggz',
    'eggg',
    9999.00,
    '/uploads/menu/1777975972232_ramen.jpg',
    'vegan,glutenfree,lactosefree',
    1,
    '2026-05-06 13:41:40',
    '2026-05-06 13:41:40'
  ),
  (
    53,
    'kakkkkklkkklkkklkkka',
    'kakkkkka',
    9999.00,
    '/uploads/menu/1777469230152_dogggg.jpg',
    'glutenfree',
    1,
    '2026-05-06 13:42:03',
    '2026-05-06 13:42:03'
  ),
  (
    54,
    'kissa',
    NULL,
    7654.00,
    NULL,
    '',
    0,
    '2026-05-06 18:18:28',
    '2026-05-06 18:18:28'
  ),
  (
    55,
    'siska',
    NULL,
    12.00,
    NULL,
    '',
    0,
    '2026-05-06 18:18:28',
    '2026-05-06 18:18:28'
  ),
  (
    56,
    'eggz',
    NULL,
    9999.00,
    NULL,
    '',
    0,
    '2026-05-06 18:19:51',
    '2026-05-06 18:19:51'
  ),
  (
    57,
    'jo',
    NULL,
    45.00,
    NULL,
    '',
    0,
    '2026-05-06 18:25:53',
    '2026-05-06 18:25:53'
  );
-- Dumping structure for table web_projekti_restaurant.orders
DROP TABLE IF EXISTS `orders`;
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `guest_name` varchar(120) DEFAULT NULL,
  `guest_email` varchar(120) DEFAULT NULL,
  `pickup_date` date NOT NULL,
  `pickup_time` time NOT NULL,
  `guest_count` int(11) NOT NULL DEFAULT 1,
  `total_price` decimal(8, 2) NOT NULL,
  `status` enum(
    'pending',
    'confirmed',
    'ready',
    'completed',
    'cancelled'
  ) NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_orders_user` (`user_id`),
  KEY `idx_orders_date` (`pickup_date`),
  KEY `idx_orders_status` (`status`),
  KEY `idx_orders_date_time` (`pickup_date`, `pickup_time`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE
  SET NULL
) ENGINE = InnoDB AUTO_INCREMENT = 38 DEFAULT CHARSET = latin1 COLLATE = latin1_swedish_ci;
-- Dumping data for table web_projekti_restaurant.orders: ~5 rows (approximately)
DELETE FROM `orders`;
INSERT INTO `orders` (
    `id`,
    `user_id`,
    `guest_name`,
    `guest_email`,
    `pickup_date`,
    `pickup_time`,
    `guest_count`,
    `total_price`,
    `status`,
    `notes`,
    `created_at`,
    `updated_at`
  )
VALUES (
    33,
    NULL,
    'Andrei Tsizikov',
    'andrei.tsizikov00@gmail.com',
    '2026-05-06',
    '20:00:00',
    2,
    84326.00,
    'pending',
    '3434',
    '2026-05-06 18:13:34',
    '2026-05-06 18:18:28'
  ),
  (
    34,
    NULL,
    'Andrei Tsizikov',
    'andrei.tsizikov00@gmail.com',
    '2026-05-08',
    '13:00:00',
    3,
    39996.00,
    'pending',
    'kkk',
    '2026-05-06 18:19:12',
    '2026-05-06 18:19:51'
  ),
  (
    35,
    NULL,
    'pisun',
    'pisun@gmail.com',
    '2026-05-07',
    '11:30:00',
    21,
    22522.00,
    'pending',
    'htrhhthdhdfhdfhdhfgfgbdf vgyv gyvbvf  d df dj',
    '2026-05-06 18:24:32',
    '2026-05-06 18:25:53'
  ),
  (
    36,
    NULL,
    'Andrei Tsizikov',
    'andrei.tsizikov00@gmail.com',
    '2026-05-06',
    '21:30:00',
    2,
    24.00,
    'pending',
    NULL,
    '2026-05-06 21:10:53',
    '2026-05-06 21:10:53'
  ),
  (
    37,
    NULL,
    'Andreiee Tsizikovee',
    'andrei.tsizeeikov00@gmail.com',
    '2026-05-06',
    '21:30:00',
    2,
    7654.00,
    'pending',
    NULL,
    '2026-05-06 21:11:08',
    '2026-05-06 21:11:08'
  );
-- Dumping structure for table web_projekti_restaurant.order_items
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `dish_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_price` decimal(6, 2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_oi_order` (`order_id`),
  KEY `idx_oi_dish` (`dish_id`),
  CONSTRAINT `fk_oi_dish` FOREIGN KEY (`dish_id`) REFERENCES `dishes` (`id`) ON DELETE
  SET NULL,
    CONSTRAINT `fk_oi_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 118 DEFAULT CHARSET = latin1 COLLATE = latin1_swedish_ci;
-- Dumping data for table web_projekti_restaurant.order_items: ~8 rows (approximately)
DELETE FROM `order_items`;
INSERT INTO `order_items` (
    `id`,
    `order_id`,
    `dish_id`,
    `quantity`,
    `unit_price`
  )
VALUES (108, 33, 54, 11, 7654.00),
  (109, 33, 55, 11, 12.00),
  (111, 34, 56, 2, 9999.00),
  (112, 34, 53, 2, 9999.00),
  (114, 35, 57, 6, 45.00),
  (115, 35, 43, 4, 5563.00),
  (116, 36, 45, 2, 12.00),
  (117, 37, 44, 1, 7654.00);
-- Dumping structure for table web_projekti_restaurant.reservations
DROP TABLE IF EXISTS `reservations`;
CREATE TABLE IF NOT EXISTS `reservations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `pickup_date` date NOT NULL,
  `pickup_time` time NOT NULL,
  `seats` int(11) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_res_slot` (`pickup_date`, `pickup_time`),
  KEY `idx_res_order` (`order_id`),
  CONSTRAINT `fk_res_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 35 DEFAULT CHARSET = latin1 COLLATE = latin1_swedish_ci;
-- Dumping data for table web_projekti_restaurant.reservations: ~5 rows (approximately)
DELETE FROM `reservations`;
INSERT INTO `reservations` (
    `id`,
    `order_id`,
    `pickup_date`,
    `pickup_time`,
    `seats`,
    `created_at`
  )
VALUES (
    30,
    33,
    '2026-05-06',
    '20:00:00',
    2,
    '2026-05-06 18:13:34'
  ),
  (
    31,
    34,
    '2026-05-08',
    '13:00:00',
    3,
    '2026-05-06 18:19:12'
  ),
  (
    32,
    35,
    '2026-05-07',
    '11:30:00',
    21,
    '2026-05-06 18:24:32'
  ),
  (
    33,
    36,
    '2026-05-06',
    '21:30:00',
    2,
    '2026-05-06 21:10:53'
  ),
  (
    34,
    37,
    '2026-05-06',
    '21:30:00',
    2,
    '2026-05-06 21:11:08'
  );
-- Dumping structure for table web_projekti_restaurant.users
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(60) NOT NULL,
  `email` varchar(120) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('user', 'admin') NOT NULL DEFAULT 'user',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  UNIQUE KEY `uq_users_username` (`username`)
) ENGINE = InnoDB AUTO_INCREMENT = 22 DEFAULT CHARSET = latin1 COLLATE = latin1_swedish_ci;
-- Dumping data for table web_projekti_restaurant.users: ~11 rows (approximately)
DELETE FROM `users`;
INSERT INTO `users` (
    `id`,
    `username`,
    `email`,
    `phone`,
    `password_hash`,
    `role`,
    `created_at`,
    `updated_at`
  )
VALUES (
    4,
    'kakka1234',
    'kakka1234@gmail.com',
    NULL,
    '$2b$12$QrKoV9OcQpkA2xh77rZp7emG9qGYeoMrQuD6umQHP88gOt.u3OFHq',
    'admin',
    '2026-04-22 21:11:59',
    '2026-04-29 17:35:21'
  ),
  (
    10,
    'isokakka',
    'isokakka@gmail.com',
    '0449627752',
    '$2b$12$RZafVN8sswKoCQU63X4TnOID4V417L8BHmPBN0MR4QzsILC/pHq.C',
    'admin',
    '2026-04-27 13:32:37',
    '2026-05-06 11:50:53'
  ),
  (
    12,
    'aaagbdbgaa',
    'aaagbabfa@test.com',
    NULL,
    '$2b$12$UurCCK90tgfr.MbAR/TNt.EzV7nAb7h/kn1rXcWAvnW70NTNqghRa',
    'admin',
    '2026-04-29 18:14:15',
    '2026-04-30 15:21:11'
  ),
  (
    13,
    'maraim',
    'maraim@gmail.com',
    NULL,
    '$2b$12$vvHrGf/8KWv1QaDcsKPmHOMDgPH6/X1AMBXa98Jp4gKI7DTXc6GV.',
    'admin',
    '2026-04-30 15:22:30',
    '2026-04-30 15:22:41'
  ),
  (
    15,
    'maraim1',
    'maraim1@gmail.com',
    NULL,
    '$2b$12$XFgviohtBPzFWAd9ddpQDucAuh1T1kX2S9np8T4.ReX.wMKVKMEBW',
    'user',
    '2026-04-30 15:25:16',
    '2026-04-30 15:25:16'
  ),
  (
    16,
    'andrei',
    'andrei@gmail.com',
    NULL,
    '$2b$12$omDY9AiznX4d8NiVrmfjMeUujh8nqUqOtznaCLHeIaCnS33uYmysW',
    'user',
    '2026-05-04 13:13:22',
    '2026-05-04 13:13:22'
  ),
  (
    17,
    'kkkk',
    'kkkk@gamil.com',
    NULL,
    '$2b$12$uitLNlEqenXgLKHCfMqa3OuIRUvEenhTh/REVgl310QmmPzOD4z3W',
    'admin',
    '2026-05-04 16:43:33',
    '2026-05-04 16:43:40'
  ),
  (
    18,
    'jokukakka',
    'kokukakka@gmail.com',
    NULL,
    '$2b$12$t6kUI0vv1g.Zb9qv0USEFunlXAQYRT4cJemWDl4ZoZCqlvyA00SZq',
    'admin',
    '2026-05-04 16:53:55',
    '2026-05-04 16:54:09'
  ),
  (
    19,
    'km1',
    'km1@gmail.com',
    NULL,
    '$2b$12$/Mk8vFM/Zeqk.MrX7poxBeQ9KpWsbQKOgkEbTx/ubZdWY/BFJKtma',
    'admin',
    '2026-05-04 16:53:58',
    '2026-05-04 16:54:06'
  ),
  (
    20,
    'pipi',
    'pipi@gmail.com',
    NULL,
    '$2b$12$FQjA6bpmDPmDn9k37Fac3Oupgq/5tNu7oS086du0LIF91Aygr7CIq',
    'user',
    '2026-05-06 15:50:12',
    '2026-05-06 15:50:12'
  ),
  (
    21,
    'pisun',
    'pisun@gmail.com',
    '12345',
    '$2b$12$jp8qHp8h1oESAM7WeQKjq.EehR.z3BLUM5wDlTUHe9oqBTa1ljJ0O',
    'user',
    '2026-05-06 18:23:51',
    '2026-05-06 18:24:01'
  );
-- Dumping structure for table web_projekti_restaurant.wsk_cats
DROP TABLE IF EXISTS `wsk_cats`;
CREATE TABLE IF NOT EXISTS `wsk_cats` (
  `cat_id` int(11) NOT NULL AUTO_INCREMENT,
  `cat_name` text NOT NULL,
  `weight` float NOT NULL,
  `owner` int(11) NOT NULL,
  `filename` text NOT NULL,
  `birthdate` date DEFAULT NULL,
  PRIMARY KEY (`cat_id`),
  KEY `owner` (`owner`),
  CONSTRAINT `fk_owner_user_id` FOREIGN KEY (`owner`) REFERENCES `wsk_users` (`user_id`)
) ENGINE = InnoDB AUTO_INCREMENT = 51 DEFAULT CHARSET = utf8mb3 COLLATE = utf8mb3_general_ci;
-- Dumping data for table web_projekti_restaurant.wsk_cats: ~5 rows (approximately)
DELETE FROM `wsk_cats`;
INSERT INTO `wsk_cats` (
    `cat_id`,
    `cat_name`,
    `weight`,
    `owner`,
    `filename`,
    `birthdate`
  )
VALUES (
    45,
    'Garfield',
    7,
    37,
    'garfield.jpg',
    '2020-05-05'
  ),
  (
    46,
    'Garfield',
    7,
    37,
    'garfield.jpg',
    '2020-05-05'
  ),
  (
    47,
    'Garfield',
    7,
    37,
    'garfield.jpg',
    '2020-05-05'
  ),
  (
    48,
    'Garfield',
    7,
    37,
    'garfield.jpg',
    '2020-05-05'
  ),
  (
    49,
    'Garfield',
    7,
    37,
    'garfield.jpg',
    '2020-05-05'
  );
-- Dumping structure for table web_projekti_restaurant.wsk_users
DROP TABLE IF EXISTS `wsk_users`;
CREATE TABLE IF NOT EXISTS `wsk_users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  `username` text NOT NULL,
  `email` text NOT NULL,
  `password` text NOT NULL,
  `role` text NOT NULL DEFAULT 'user',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`) USING HASH
) ENGINE = InnoDB AUTO_INCREMENT = 49 DEFAULT CHARSET = utf8mb3 COLLATE = utf8mb3_general_ci;
-- Dumping data for table web_projekti_restaurant.wsk_users: ~8 rows (approximately)
DELETE FROM `wsk_users`;
INSERT INTO `wsk_users` (
    `user_id`,
    `name`,
    `username`,
    `email`,
    `password`,
    `role`
  )
VALUES (
    1,
    'Administrator',
    'admin',
    'admin@metropolia.fi',
    '$2a$10$5RzpyimIeuzNqW7G8seBiOzBiWBvrSWroDomxMa0HzU6K2ddSgixS',
    'admin'
  ),
  (
    37,
    'Test User',
    'john',
    'john@metropolia.fi',
    '$2a$10$5RzpyimIeuzNqW7G8seBiOzBiWBvrSWroDomxMa0HzU6K2ddSgixS',
    'user'
  ),
  (
    41,
    'kakka User',
    'kakka',
    'kakka@example.com',
    '$2b$10$nWYUwpx8Ol66PvNKStfhi.6XdnhR8Y4jb8SgxW//ZQkyqUWOh1Os6',
    'admin'
  ),
  (
    43,
    'kakka User',
    'kakka2',
    'kakka@example.com',
    '$2b$10$vgVkf3o6O1RrD5aOK9xhMO.kc.053h8mecDdMLnWMQvXKIOft.1Ym',
    'admin'
  ),
  (
    45,
    'kakka User',
    'johndoe',
    'kakka@example.com',
    '$2b$10$40ZmhEHAmOmYBKjc5WX0de42ts2cnrv5yiZExactXxqqnQu0CGf0e',
    'user'
  ),
  (
    46,
    'kakka User',
    'smallkakka',
    'smallkakka@example.com',
    '$2b$10$owu/132nT0uYkoUcv4VixORQScXRMavDEe/bMv.gS0f9DQoxNqKKe',
    'user'
  ),
  (
    47,
    'user a',
    'user a',
    'usera@example.com',
    '$2b$10$DmFw1TY.9BPfya9SHvrce./CV.mwu6tlQ/gaxAzSRsIzQJZeUTy4m',
    'user'
  ),
  (
    48,
    'user b',
    'user b',
    'userb@example.com',
    '$2b$10$ZmDlksgC4FCd3XSghxpnj.L.fBmCejj2LkkdDTHbDRV1T2YHiQcx.',
    'user'
  );
/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */
;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */
;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */
;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */
;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */
;