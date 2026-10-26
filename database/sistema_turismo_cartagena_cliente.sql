-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: sistema_turismo_cartagena
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '4c5f7fc2-32c9-11f1-bb95-bcf171f567a6:1-96';

--
-- Table structure for table `cliente`
--

DROP TABLE IF EXISTS `cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente` (
  `id_cliente` int NOT NULL AUTO_INCREMENT,
  `tipo_documento` varchar(20) DEFAULT NULL,
  `numero_documento` varchar(50) DEFAULT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `nacionalidad` varchar(50) DEFAULT NULL,
  `observaciones` text,
  `id_origen_cliente` int DEFAULT NULL,
  `id_agencia` int DEFAULT NULL,
  `id_vendedor` int DEFAULT NULL,
  PRIMARY KEY (`id_cliente`),
  KEY `id_origen_cliente` (`id_origen_cliente`),
  KEY `id_agencia` (`id_agencia`),
  KEY `id_vendedor` (`id_vendedor`),
  KEY `idx_cliente_documento` (`numero_documento`),
  CONSTRAINT `cliente_ibfk_1` FOREIGN KEY (`id_origen_cliente`) REFERENCES `origen_cliente` (`id_origen_cliente`),
  CONSTRAINT `cliente_ibfk_2` FOREIGN KEY (`id_agencia`) REFERENCES `agencia` (`id_agencia`),
  CONSTRAINT `cliente_ibfk_3` FOREIGN KEY (`id_vendedor`) REFERENCES `vendedor` (`id_vendedor`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente`
--

LOCK TABLES `cliente` WRITE;
/*!40000 ALTER TABLE `cliente` DISABLE KEYS */;
INSERT INTO `cliente` VALUES (1,'CC','100001','Juan','Martínez','3109999999','juan@gmail.com','Colombiano','Cliente frecuente',1,1,NULL),(2,'CC','100002','María','López','3022222222','maria@gmail.com','Argentina','Prefiere transporte privado',2,2,NULL),(3,'CE','100003','Carlos','Ramírez','3033333333','carlos@gmail.com','Mexicano','Tour familiar',3,1,NULL),(4,'CC','100004','Luisa','Torres','3044444444','luisa@gmail.com','Colombiana','Cliente VIP',4,NULL,1),(5,'CE','100005','Andrés','Gómez','3055555555','andres@gmail.com','Peruano','Traslado aeropuerto',5,NULL,2);
/*!40000 ALTER TABLE `cliente` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-24 18:12:49
