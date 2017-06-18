-- MySQL dump 10.13  Distrib 5.6.28, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: lu4r
-- ------------------------------------------------------
-- Server version	5.6.28-0ubuntu0.15.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Agents`
--

DROP TABLE IF EXISTS `Agents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Agents` (
  `id` int(10) unsigned NOT NULL,
  `atom` varchar(64) NOT NULL,
  `type` varchar(64) NOT NULL,
  `x` int(10) unsigned NOT NULL DEFAULT '0',
  `y` int(10) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `agents_type_idx` (`type`),
  CONSTRAINT `agents_type` FOREIGN KEY (`type`) REFERENCES `Typologies` (`type`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Agents`
--

LOCK TABLES `Agents` WRITE;
/*!40000 ALTER TABLE `Agents` DISABLE KEYS */;
INSERT INTO `Agents` VALUES (0,'R2D2','robot',0,0);
/*!40000 ALTER TABLE `Agents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Entities`
--

DROP TABLE IF EXISTS `Entities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Entities` (
  `id` int(10) unsigned NOT NULL,
  `atom` varchar(64) NOT NULL,
  `type` varchar(64) NOT NULL,
  `x` int(10) unsigned NOT NULL DEFAULT '0',
  `y` int(10) unsigned NOT NULL DEFAULT '0',
  `map` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `entities_type_idx` (`type`),
  KEY `entities_map_idx` (`map`),
  CONSTRAINT `entities_map` FOREIGN KEY (`map`) REFERENCES `Maps` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `entities_type` FOREIGN KEY (`type`) REFERENCES `Typologies` (`type`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Entities`
--

LOCK TABLES `Entities` WRITE;
/*!40000 ALTER TABLE `Entities` DISABLE KEYS */;
INSERT INTO `Entities` VALUES (0,'book 1','book',425,50,0),(1,'table 1','table',425,50,0),(2,'bed 1','bed',800,300,0),(3,'chair 1','chair',575,75,0),(4,'table 2','table',50,325,0),(5,'ball 1','ball',550,550,0),(6,'tv 1','tv',75,275,0);
/*!40000 ALTER TABLE `Entities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Maps`
--

DROP TABLE IF EXISTS `Maps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Maps` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `agent` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `maps_agent_idx` (`agent`),
  CONSTRAINT `maps_agent` FOREIGN KEY (`agent`) REFERENCES `Agents` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Maps`
--

LOCK TABLES `Maps` WRITE;
/*!40000 ALTER TABLE `Maps` DISABLE KEYS */;
INSERT INTO `Maps` VALUES (0,'Map 0',0);
/*!40000 ALTER TABLE `Maps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Typologies`
--

DROP TABLE IF EXISTS `Typologies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Typologies` (
  `type` varchar(64) NOT NULL,
  `preferred_lexical_reference` varchar(64) NOT NULL,
  `alternative_lexical_references` varchar(256) DEFAULT NULL,
  `img` varchar(64) NOT NULL,
  `slot` float DEFAULT '1',
  `states` varchar(256) DEFAULT NULL,
  `is_agent` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Typologies`
--

LOCK TABLES `Typologies` WRITE;
/*!40000 ALTER TABLE `Typologies` DISABLE KEYS */;
INSERT INTO `Typologies` VALUES ('ball','ball','','ball.png',1,NULL,'\0'),('bed','bed','','bed.svg',3,NULL,'\0'),('book','book','volume, manual','book.png',1,NULL,'\0'),('chair','chair','','chair-1.svg',2,NULL,'\0'),('robot','robot','android,automa','android.png',2.5,NULL,''),('table','table','desk','table.svg',3,NULL,'\0'),('tv','tv','TV,televisor,monitor,screen','tv.svg',2,'off,on','\0');
/*!40000 ALTER TABLE `Typologies` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-06-18 17:18:41
