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
-- Temporary view structure for view `vista_servicios_clientes`
--

DROP TABLE IF EXISTS `vista_servicios_clientes`;
/*!50001 DROP VIEW IF EXISTS `vista_servicios_clientes`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_servicios_clientes` AS SELECT 
 1 AS `id_servicio`,
 1 AS `Cliente`,
 1 AS `Tipo_Servicio`,
 1 AS `Fecha`,
 1 AS `Origen`,
 1 AS `Destino`,
 1 AS `Pasajeros`,
 1 AS `Valor_Total`,
 1 AS `Estado`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vista_saldo_servicios`
--

DROP TABLE IF EXISTS `vista_saldo_servicios`;
/*!50001 DROP VIEW IF EXISTS `vista_saldo_servicios`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_saldo_servicios` AS SELECT 
 1 AS `id_servicio`,
 1 AS `Cliente`,
 1 AS `Valor_Total`,
 1 AS `Total_Pagado`,
 1 AS `Saldo_Pendiente`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `vista_servicios_clientes`
--

/*!50001 DROP VIEW IF EXISTS `vista_servicios_clientes`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_servicios_clientes` AS select `s`.`id_servicio` AS `id_servicio`,concat(`c`.`nombres`,' ',`c`.`apellidos`) AS `Cliente`,`ts`.`nombre_servicio` AS `Tipo_Servicio`,`s`.`fecha_servicio` AS `Fecha`,`s`.`origen_ruta` AS `Origen`,`s`.`destino_ruta` AS `Destino`,`s`.`cantidad_pasajeros` AS `Pasajeros`,`s`.`valor_total` AS `Valor_Total`,`s`.`estado_servicio` AS `Estado` from ((`servicio` `s` join `cliente` `c` on((`s`.`id_cliente` = `c`.`id_cliente`))) join `tipo_servicio` `ts` on((`s`.`id_tipo_servicio` = `ts`.`id_tipo_servicio`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vista_saldo_servicios`
--

/*!50001 DROP VIEW IF EXISTS `vista_saldo_servicios`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_saldo_servicios` AS select `s`.`id_servicio` AS `id_servicio`,concat(`c`.`nombres`,' ',`c`.`apellidos`) AS `Cliente`,`s`.`valor_total` AS `Valor_Total`,coalesce(sum(`p`.`monto_pago`),0) AS `Total_Pagado`,(`s`.`valor_total` - coalesce(sum(`p`.`monto_pago`),0)) AS `Saldo_Pendiente` from ((`servicio` `s` join `cliente` `c` on((`s`.`id_cliente` = `c`.`id_cliente`))) left join `pago` `p` on((`s`.`id_servicio` = `p`.`id_servicio`))) group by `s`.`id_servicio`,`c`.`nombres`,`c`.`apellidos`,`s`.`valor_total` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-24 18:12:51
