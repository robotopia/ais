-- MariaDB dump 10.19-11.0.2-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: ppc_invoices
-- ------------------------------------------------------
-- Server version	11.0.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `account` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bsb` varchar(255) DEFAULT NULL,
  `number` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `activity`
--

DROP TABLE IF EXISTS `activity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activity` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `qty` float DEFAULT NULL,
  `activity_type_id` int(11) NOT NULL,
  `notes` varchar(1023) DEFAULT NULL,
  `invoice_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activity_type_id` (`activity_type_id`),
  KEY `invoice_id` (`invoice_id`),
  CONSTRAINT `activity_ibfk_1` FOREIGN KEY (`activity_type_id`) REFERENCES `activity_type` (`id`),
  CONSTRAINT `activity_ibfk_2` FOREIGN KEY (`invoice_id`) REFERENCES `invoice` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=276 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `activity_type`
--

DROP TABLE IF EXISTS `activity_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activity_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `description` varchar(255) DEFAULT NULL,
  `rate` decimal(10,2) NOT NULL DEFAULT 100.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `activity_type_view`
--

DROP TABLE IF EXISTS `activity_type_view`;
/*!50001 DROP VIEW IF EXISTS `activity_type_view`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `activity_type_view` AS SELECT
 1 AS `id`,
  1 AS `description`,
  1 AS `rate_display`,
  1 AS `rate` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `activity_view`
--

DROP TABLE IF EXISTS `activity_view`;
/*!50001 DROP VIEW IF EXISTS `activity_view`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `activity_view` AS SELECT
 1 AS `id`,
  1 AS `date`,
  1 AS `qty`,
  1 AS `activity_type_id`,
  1 AS `notes`,
  1 AS `invoice_id`,
  1 AS `activity_type`,
  1 AS `invoice` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `billing`
--

DROP TABLE IF EXISTS `billing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `billing` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `addr1` varchar(255) DEFAULT NULL,
  `addr2` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `abn` varchar(255) DEFAULT NULL,
  `is_gst_registered` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `client`
--

DROP TABLE IF EXISTS `client`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `client` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `bill_email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `invoice`
--

DROP TABLE IF EXISTS `invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `invoice` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` date DEFAULT NULL,
  `issued` date DEFAULT NULL,
  `due` date DEFAULT NULL,
  `paid` date DEFAULT NULL,
  `pdf` varchar(255) DEFAULT NULL,
  `billing_id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `bill_to` int(11) NOT NULL,
  `pdf_viewed` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `billing_id` (`billing_id`),
  KEY `account_id` (`account_id`),
  CONSTRAINT `invoice_ibfk_1` FOREIGN KEY (`billing_id`) REFERENCES `billing` (`id`),
  CONSTRAINT `invoice_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `invoice_item_view`
--

DROP TABLE IF EXISTS `invoice_item_view`;
/*!50001 DROP VIEW IF EXISTS `invoice_item_view`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `invoice_item_view` AS SELECT
 1 AS `id`,
  1 AS `invoice_id`,
  1 AS `date`,
  1 AS `qty`,
  1 AS `description`,
  1 AS `rate`,
  1 AS `amount`,
  1 AS `invoice_name` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `invoice_view`
--

DROP TABLE IF EXISTS `invoice_view`;
/*!50001 DROP VIEW IF EXISTS `invoice_view`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `invoice_view` AS SELECT
 1 AS `id`,
  1 AS `billing_id`,
  1 AS `account_id`,
  1 AS `bill_to`,
  1 AS `bill_to_name`,
  1 AS `bill_email`,
  1 AS `name`,
  1 AS `issued`,
  1 AS `due`,
  1 AS `paid`,
  1 AS `pdf`,
  1 AS `pdf_viewed`,
  1 AS `billing_name`,
  1 AS `addr1`,
  1 AS `addr2`,
  1 AS `phone`,
  1 AS `email`,
  1 AS `abn`,
  1 AS `is_gst_registered`,
  1 AS `bsb`,
  1 AS `number`,
  1 AS `account_name`,
  1 AS `total_amount`,
  1 AS `abn_display` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `tax_period`
--

DROP TABLE IF EXISTS `tax_period`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tax_period` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `start` date NOT NULL,
  `end` date NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `tax_period_view`
--

DROP TABLE IF EXISTS `tax_period_view`;
/*!50001 DROP VIEW IF EXISTS `tax_period_view`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `tax_period_view` AS SELECT
 1 AS `id`,
  1 AS `start`,
  1 AS `end`,
  1 AS `name`,
  1 AS `taxable_income` */;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `activity_type_view`
--

/*!50001 DROP VIEW IF EXISTS `activity_type_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`smcsweeney`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `activity_type_view` AS select `activity_type`.`id` AS `id`,`activity_type`.`description` AS `description`,concat('$',`activity_type`.`rate`) AS `rate_display`,`activity_type`.`rate` AS `rate` from `activity_type` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `activity_view`
--

/*!50001 DROP VIEW IF EXISTS `activity_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`smcsweeney`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `activity_view` AS select `activity`.`id` AS `id`,`activity`.`date` AS `date`,`activity`.`qty` AS `qty`,`activity`.`activity_type_id` AS `activity_type_id`,`activity`.`notes` AS `notes`,`activity`.`invoice_id` AS `invoice_id`,`activity_type`.`description` AS `activity_type`,`invoice`.`name` AS `invoice` from ((`activity` left join `activity_type` on(`activity`.`activity_type_id` = `activity_type`.`id`)) left join `invoice` on(`activity`.`invoice_id` = `invoice`.`id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `invoice_item_view`
--

/*!50001 DROP VIEW IF EXISTS `invoice_item_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`smcsweeney`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `invoice_item_view` AS select `a`.`id` AS `id`,`a`.`invoice_id` AS `invoice_id`,`a`.`date` AS `date`,`a`.`qty` AS `qty`,`at`.`description` AS `description`,`at`.`rate` AS `rate`,`a`.`qty` * `at`.`rate` AS `amount`,`i`.`name` AS `invoice_name` from ((`activity` `a` left join `activity_type` `at` on(`a`.`activity_type_id` = `at`.`id`)) left join `invoice` `i` on(`a`.`invoice_id` = `i`.`id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `invoice_view`
--

/*!50001 DROP VIEW IF EXISTS `invoice_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`smcsweeney`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `invoice_view` AS select `i`.`id` AS `id`,`i`.`billing_id` AS `billing_id`,`i`.`account_id` AS `account_id`,`i`.`bill_to` AS `bill_to`,`c`.`name` AS `bill_to_name`,`c`.`bill_email` AS `bill_email`,`i`.`name` AS `name`,`i`.`issued` AS `issued`,`i`.`due` AS `due`,`i`.`paid` AS `paid`,`i`.`pdf` AS `pdf`,`i`.`pdf_viewed` AS `pdf_viewed`,`b`.`name` AS `billing_name`,`b`.`addr1` AS `addr1`,`b`.`addr2` AS `addr2`,`b`.`phone` AS `phone`,`b`.`email` AS `email`,`b`.`abn` AS `abn`,`b`.`is_gst_registered` AS `is_gst_registered`,`a`.`bsb` AS `bsb`,`a`.`number` AS `number`,`a`.`name` AS `account_name`,sum(`act`.`qty` * `at`.`rate`) AS `total_amount`,if(`b`.`is_gst_registered`,`b`.`abn`,concat(`b`.`abn`,' (Not GST registered)')) AS `abn_display` from (((((`invoice` `i` left join `billing` `b` on(`i`.`billing_id` = `b`.`id`)) left join `account` `a` on(`i`.`account_id` = `a`.`id`)) left join `client` `c` on(`i`.`bill_to` = `c`.`id`)) left join `activity` `act` on(`i`.`id` = `act`.`invoice_id`)) left join `activity_type` `at` on(`act`.`activity_type_id` = `at`.`id`)) group by `i`.`id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `tax_period_view`
--

/*!50001 DROP VIEW IF EXISTS `tax_period_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`smcsweeney`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `tax_period_view` AS select `t`.`id` AS `id`,`t`.`start` AS `start`,`t`.`end` AS `end`,`t`.`name` AS `name`,concat('$',sum(`i`.`total_amount`)) AS `taxable_income` from (`tax_period` `t` left join `invoice_view` `i` on(`i`.`paid` >= `t`.`start` and `i`.`paid` <= `t`.`end`)) group by `t`.`id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-08-20 13:41:17
