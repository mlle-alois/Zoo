-- phpMyAdmin SQL Dump
-- version 4.7.9
-- https://www.phpmyadmin.net/
--
-- Host: mysql-zoo.alwaysdata.net
-- Generation Time: Apr 20, 2021 at 11:11 PM
-- Server version: 10.5.8-MariaDB
-- PHP Version: 7.2.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `zoo_zoo`
--

-- --------------------------------------------------------

--
-- Table structure for table `ANIMAL`
--

CREATE TABLE `ANIMAL` (
  `animal_id` int(5) NOT NULL,
  `animal_name` varchar(100) DEFAULT NULL,
  `animal_age` int(3) DEFAULT NULL,
  `space_id` int(4) DEFAULT NULL,
  `species_id` int(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `ANIMAL`
--

INSERT INTO `ANIMAL` (`animal_id`, `animal_name`, `animal_age`, `space_id`, `species_id`) VALUES
(1, 'Léo', 2, 1, 1),
(2, 'Simba', 3, 1, 1),
(3, 'Nala', 3, 1, 1),
(4, 'Happy feet', 5, 2, 4),
(5, 'Baraka', 10, 0, 2),
(6, 'Zebra', 7, 0, 3),
(7, 'Rayada', 2, 0, 3),
(8, 'Petit tonerre', 15, 0, 2),
(9, 'Grinn', 4, 0, 2);

-- --------------------------------------------------------

--
-- Table structure for table `ASSOCIATE_SPACE_MEDIA`
--

CREATE TABLE `ASSOCIATE_SPACE_MEDIA` (
  `media_id` int(7) NOT NULL,
  `space_id` int(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `DATE_HOUR`
--

CREATE TABLE `DATE_HOUR` (
  `date_hour` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `DATE_HOUR`
--

INSERT INTO `DATE_HOUR` (`date_hour`) VALUES
('2021-04-06 22:40:15'),
('2021-04-06 22:45:13'),
('2021-04-11 09:53:53'),
('2021-04-11 09:55:58'),
('2021-04-11 10:06:02'),
('2021-04-11 10:07:44'),
('2021-04-11 16:38:26'),
('2021-04-11 16:39:01'),
('2021-04-11 16:42:20'),
('2021-04-11 17:05:15'),
('2021-04-11 17:08:23'),
('2021-04-11 17:58:44'),
('2021-04-11 17:58:54'),
('2021-04-11 18:05:17'),
('2021-04-11 18:06:12'),
('2021-04-11 18:07:29'),
('2021-04-11 18:17:18'),
('2021-04-11 20:30:57'),
('2021-04-11 20:32:44'),
('2021-04-12 21:23:33'),
('2021-04-12 21:24:37'),
('2021-04-12 21:25:08'),
('2021-04-12 21:39:43'),
('2021-04-12 21:41:15'),
('2021-04-13 18:09:57'),
('2021-04-15 18:00:00'),
('2021-04-15 20:11:42'),
('2021-04-15 20:30:35'),
('2021-04-15 20:36:48'),
('2021-04-16 18:00:00'),
('2021-04-16 20:22:14'),
('2021-04-16 20:22:52'),
('2021-04-16 20:23:33'),
('2021-04-16 20:24:02'),
('2021-04-16 20:25:09'),
('2021-04-16 20:25:39'),
('2021-04-16 20:27:10'),
('2021-04-16 20:28:09'),
('2021-04-16 20:28:36'),
('2021-04-16 20:30:59'),
('2021-04-16 20:55:50'),
('2021-04-16 20:56:02'),
('2021-04-16 21:00:00'),
('2021-04-16 21:07:03'),
('2021-04-16 21:07:42'),
('2021-04-16 21:08:26'),
('2021-04-16 21:11:32'),
('2021-04-16 21:12:28'),
('2021-04-16 21:12:56'),
('2021-04-16 21:18:21'),
('2021-04-16 21:22:14'),
('2021-04-16 21:22:40'),
('2021-04-16 21:22:43'),
('2021-04-16 21:30:30'),
('2021-04-16 21:30:34'),
('2021-04-17 14:20:52'),
('2021-04-18 13:21:17');

-- --------------------------------------------------------

--
-- Table structure for table `GIVE_ACCESS_PASS_TYPE_SPACE`
--

CREATE TABLE `GIVE_ACCESS_PASS_TYPE_SPACE` (
  `pass_type_id` int(2) NOT NULL,
  `space_id` int(4) NOT NULL,
  `num_order_access` int(2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `GIVE_ACCESS_PASS_TYPE_SPACE`
--

INSERT INTO `GIVE_ACCESS_PASS_TYPE_SPACE` (`pass_type_id`, `space_id`, `num_order_access`) VALUES
(1, 0, NULL),
(1, 1, 0),
(2, 0, 2),
(2, 1, 1),
(2, 2, 3),
(3, 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `MAINTENANCE`
--

CREATE TABLE `MAINTENANCE` (
  `maintenance_id` int(5) NOT NULL,
  `date_hour_start` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_hour_end` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `space_id` int(4) DEFAULT NULL,
  `manager_id` int(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `MAINTENANCE`
--

INSERT INTO `MAINTENANCE` (`maintenance_id`, `date_hour_start`, `date_hour_end`, `space_id`, `manager_id`) VALUES
(1, '2021-04-13 22:00:00', '2021-04-16 00:20:48', 1, 4),
(2, '2021-04-15 01:24:16', '2021-04-16 01:38:21', 1, 4),
(3, '2021-04-16 02:05:30', '2021-04-16 02:05:30', 1, 4),
(4, '2021-04-16 02:35:43', '2021-04-16 02:35:51', 0, 4),
(5, '2021-04-16 02:36:02', '2021-04-16 21:36:02', 1, 4);

-- --------------------------------------------------------

--
-- Table structure for table `MEDIA`
--

CREATE TABLE `MEDIA` (
  `media_id` int(7) NOT NULL,
  `media_path` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `MEDIA`
--

INSERT INTO `MEDIA` (`media_id`, `media_path`) VALUES
(1, 'path1'),
(3, 'newPath1');

-- --------------------------------------------------------

--
-- Table structure for table `PASS`
--

CREATE TABLE `PASS` (
  `pass_id` int(4) NOT NULL,
  `date_hour_purchase` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `date_hour_peremption` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `pass_type_id` int(2) DEFAULT NULL,
  `user_id` int(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `PASS`
--

INSERT INTO `PASS` (`pass_id`, `date_hour_purchase`, `date_hour_peremption`, `pass_type_id`, `user_id`) VALUES
(1, '2021-04-10 12:25:22', '2022-04-05 20:00:00', 1, 5),
(3, '2021-04-10 14:39:31', '2022-04-05 20:00:00', 2, 5),
(4, '2021-04-10 14:40:35', '2022-04-05 20:00:00', 2, 5),
(5, '2021-04-10 14:41:44', '2022-04-05 20:00:00', 1, 5),
(6, '2021-04-12 21:25:01', '2022-03-30 20:00:00', 2, 5),
(7, '2021-04-12 21:20:59', '2022-04-01 20:00:00', 3, 5),
(8, '2021-04-12 21:21:26', '2022-04-01 20:00:00', 4, 5),
(9, '2021-04-12 21:21:30', '2022-04-01 20:00:00', 5, 5);

-- --------------------------------------------------------

--
-- Table structure for table `PASS_TYPE`
--

CREATE TABLE `PASS_TYPE` (
  `pass_type_id` int(2) NOT NULL,
  `pass_type_name` varchar(150) DEFAULT NULL,
  `pass_type_price` float DEFAULT NULL,
  `pass_type_is_available` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `PASS_TYPE`
--

INSERT INTO `PASS_TYPE` (`pass_type_id`, `pass_type_name`, `pass_type_price`, `pass_type_is_available`) VALUES
(1, 'UNIQUE DAY', 15, 1),
(2, 'ESCAPE GAME', 10, 0),
(3, 'WEEK-END', 30, 1),
(4, 'NIGHT', 10, 1),
(5, '1 DAY PER MONTH', 28, 1);

-- --------------------------------------------------------

--
-- Table structure for table `PRESENCE`
--

CREATE TABLE `PRESENCE` (
  `presence_id` int(7) NOT NULL,
  `dateHourStart_presence` timestamp NULL DEFAULT NULL,
  `dateHourEnd_presence` timestamp NULL DEFAULT NULL,
  `user_id` int(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `PRESENCE`
--

INSERT INTO `PRESENCE` (`presence_id`, `dateHourStart_presence`, `dateHourEnd_presence`, `user_id`) VALUES
(1, '2021-04-16 22:35:45', '2021-04-18 16:36:52', 6),
(2, '2021-04-16 17:35:45', '2021-04-19 18:35:45', 6),
(3, '2021-04-16 17:35:46', '2021-04-18 18:35:45', 7),
(4, '2021-04-16 17:35:47', '2021-04-18 18:35:45', 8),
(5, '2021-04-16 17:35:48', '2021-04-18 18:35:45', 9),
(6, '2021-04-16 17:35:50', '2021-04-18 18:35:45', 10);

-- --------------------------------------------------------

--
-- Table structure for table `SESSION`
--

CREATE TABLE `SESSION` (
  `session_id` int(6) NOT NULL,
  `token` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `deletedAt` timestamp NULL DEFAULT NULL,
  `user_id` int(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `SESSION`
--

INSERT INTO `SESSION` (`session_id`, `token`, `createdAt`, `updatedAt`, `deletedAt`, `user_id`) VALUES
(1, '$2b$05$P0Z8KIVaohTIJ3JUbNiV3Ogi5dNxHAWMvW1bMsvawbvoam5pHu2le', '2021-03-30 21:07:13', '2021-03-30 21:07:13', '0000-00-00 00:00:00', 2),
(3, '$2b$05$Tbc6R68GI3t89gSYmwzcG.nENO.dT19dX.MNR9huplGmo/niMATt.', '2021-03-30 22:03:02', '2021-03-30 22:03:02', '0000-00-00 00:00:00', NULL),
(11, '$2b$05$JcFzApPxBqAYCAFfXPD2EeXTV3WTVCJuj6N4RfQCfZoWbJSl4gRwS', '2021-04-03 20:50:15', '2021-04-03 20:50:15', '0000-00-00 00:00:00', 7),
(12, '$2b$05$IZ0b.hf2lg/O4/yZ1FFSJ.1ojDXNK3p6q8.wOhCkiOrqlrEc2jDma', '2021-04-03 20:52:05', '2021-04-03 20:52:05', '0000-00-00 00:00:00', 8),
(13, '$2b$05$I5Csm9NdzpLOPmP4Q1PDYenTMSqtu.ctSM4kzVRpHApZQXbRbOc2q', '2021-04-03 20:53:04', '2021-04-03 20:53:04', '0000-00-00 00:00:00', 9),
(15, '$2b$05$zFkaf20rPKEHIHEqVcZ2K.hgAff8VP36iS7ZeZubM99xeIjhZErgW', '2021-04-03 22:13:54', '2021-04-03 22:13:54', '0000-00-00 00:00:00', 10),
(25, '$2b$05$7LfZWmbuKYTfX3oDBrpl..1laDdj80PIgesVwiVp2ze5g4Rnz4Noy', '2021-04-10 11:37:13', '2021-04-10 11:37:13', '0000-00-00 00:00:00', 4),
(28, '$2b$05$9q.CiVCXyKQFu9SfAnzE3.xDMSoz2.GFi6y4elf3YNGHB3TNsITwu', '2021-04-11 14:32:10', '2021-04-11 14:32:10', '0000-00-00 00:00:00', 12),
(34, '$2b$05$0YqAXIFpoWEzxX4q6Rx8seCLH7NpYRxS6njf7wlrDiOy/Mduv9fyO', '2021-04-18 13:44:36', '2021-04-18 13:53:10', NULL, 6),
(37, '$2b$05$/Bt4c2dASgT9my25/fUfwepnfnyaLzkcUi6NWrEWYF/x2CFRI0WWG', '2021-04-20 13:58:01', '2021-04-20 14:10:27', NULL, 1),
(38, '$2b$05$7M0DvkGf53AziU1.STV5wePRqvyZ4kPn.KA79hmyHzYGxBLQT0oai', '2021-04-20 20:48:19', '2021-04-20 20:53:51', NULL, 5);

-- --------------------------------------------------------

--
-- Table structure for table `SPACE`
--

CREATE TABLE `SPACE` (
  `space_id` int(4) NOT NULL,
  `space_name` varchar(100) DEFAULT NULL,
  `space_description` text DEFAULT NULL,
  `space_capacity` int(3) DEFAULT NULL,
  `opening_time` time DEFAULT NULL,
  `closing_time` time DEFAULT NULL,
  `handicapped_access` tinyint(1) DEFAULT NULL,
  `space_type_id` int(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `SPACE`
--

INSERT INTO `SPACE` (`space_id`, `space_name`, `space_description`, `space_capacity`, `opening_time`, `closing_time`, `handicapped_access`, `space_type_id`) VALUES
(0, 'L\'enclos des équidés', 'Zèbres et chevaux', 20, '08:00:00', '18:00:00', 1, 1),
(1, 'Les rois de la savane', 'Lions', 3, '19:00:00', '09:00:00', 1, 4),
(2, 'Pôle nord', 'Il y fait très froid', 5, '08:00:00', '18:00:00', 1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `SPACE_TYPE`
--

CREATE TABLE `SPACE_TYPE` (
  `space_type_id` int(3) NOT NULL,
  `space_type_libelle` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `SPACE_TYPE`
--

INSERT INTO `SPACE_TYPE` (`space_type_id`, `space_type_libelle`) VALUES
(1, 'Enclos'),
(2, 'Banquise'),
(3, 'Aquarium'),
(4, 'Cage');

-- --------------------------------------------------------

--
-- Table structure for table `SPECIES`
--

CREATE TABLE `SPECIES` (
  `species_id` int(4) NOT NULL,
  `species_name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `SPECIES`
--

INSERT INTO `SPECIES` (`species_id`, `species_name`) VALUES
(1, 'Lion'),
(2, 'Cheval'),
(3, 'Zebre'),
(4, 'Pingouin');

-- --------------------------------------------------------

--
-- Table structure for table `TREATMENT`
--

CREATE TABLE `TREATMENT` (
  `treatment_id` int(7) NOT NULL,
  `treatment_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `treatment_observation` text DEFAULT NULL,
  `animal_id` int(5) DEFAULT NULL,
  `treatment_type_id` int(3) DEFAULT NULL,
  `veterinary_id` int(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `TREATMENT`
--

INSERT INTO `TREATMENT` (`treatment_id`, `treatment_date`, `treatment_observation`, `animal_id`, `treatment_type_id`, `veterinary_id`) VALUES
(1, '2021-04-03 16:36:52', 'ça avait l\'air de faire mal', NULL, 1, 8),
(3, '2021-04-04 15:34:21', ' ah ouais chaud', NULL, 1, 8),
(4, '2021-04-03 16:36:52', 'ça avait l\'air de faire mal', NULL, 1, 8);

-- --------------------------------------------------------

--
-- Table structure for table `TREATMENT_TYPE`
--

CREATE TABLE `TREATMENT_TYPE` (
  `treatment_type_id` int(3) NOT NULL,
  `treatment_type_libelle` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `TREATMENT_TYPE`
--

INSERT INTO `TREATMENT_TYPE` (`treatment_type_id`, `treatment_type_libelle`) VALUES
(1, 'Bandage sur genoux'),
(2, 'Piqûre'),
(3, 'Vaccin');

-- --------------------------------------------------------

--
-- Table structure for table `USER`
--

CREATE TABLE `USER` (
  `user_id` int(4) NOT NULL,
  `user_mail` varchar(255) DEFAULT NULL,
  `user_password` varchar(255) DEFAULT NULL,
  `user_name` varchar(80) DEFAULT NULL,
  `user_firstname` varchar(80) DEFAULT NULL,
  `user_phone_number` varchar(15) DEFAULT NULL,
  `user_type_id` int(2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `USER`
--

INSERT INTO `USER` (`user_id`, `user_mail`, `user_password`, `user_name`, `user_firstname`, `user_phone_number`, `user_type_id`) VALUES
(1, 'alois.zimmermann45@gmail.com', '$2b$05$nJ1Lbwp0N69HUC9ujvxNaOGzFopJxjBv21AEh4h.j0KnDotN8U0my', 'Zimmermann--Rosenthal', 'Aloïs', '0782106011', 2),
(2, 'yolo@gmail.com', '$2b$05$3qIVM69EvWnPKQnW00O/.u9//diPFaoT65fkVq59BWTQFtG9X4/Im', 'Lo', 'Yo', '3', 1),
(4, 'alois.zimmerman@gmail.com', '$2b$05$4BIuqnmhgofEzspk9OPc.e8InT5r.1xuQSkXfpQaJC3DrN84je4o6', 'yo', 'plait', '1', 5),
(5, 'oui@oui', '$2b$05$6u/arcbrMy0mK68I4c.9DOIG9hLm9IL8BL9lcn0aRgyRWReR6j.Rq', 'oui', 'oui', '001', 6),
(6, 'non@non.fr', '$2b$05$gmsEog1jIrzPsior1wsytO.z83nGRrmw.PdM1KD96em2QGSpOEfXO', 'non', 'non', '0646590726', 6),
(7, 'AgentTest1', '$2b$05$vlqV9VFV.WEXqtu6nEBFVuhQkAUkFu/xejG7hxyXwI2e1VX5I8KIO', 'Agent', 'D\'entretien', '0646590726', 1),
(8, 'VeterinaireTest1', '$2b$05$wijEvanWQXThOAj1JuqgruvVfGhtOHzoj5uY86OL.Ed7c9zxYjCIO', 'Veterinaire', 'De metier', '0646590726', 2),
(9, 'Entretien1', '$2b$05$pa9GGm1ZIUoVxvoUe50Ci.vqAUxOUATf1egyYCX6Ls/lPQ3hJavlq', 'entretien', 'De metier', '0646590726', 3),
(10, 'VendeurTest1', '$2b$05$vzdlhFyGj0MGWO05QdDmi.9HmiKkUVTJ1LeifD2ilxPQZtwqPa6V.', 'Vendeur', 'De metier', '0646590726', 4),
(12, 'VetoTest1', '$2b$05$IbE21eHy/7/m9354lWBe7OvsFGCHWsdPnToUCYDkpMuM9kCwpH3i2', 'Vetor', 'De metier', '0646590726', 2);

-- --------------------------------------------------------

--
-- Table structure for table `USER_TYPE`
--

CREATE TABLE `USER_TYPE` (
  `user_type_id` int(5) NOT NULL,
  `user_type_libelle` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `USER_TYPE`
--

INSERT INTO `USER_TYPE` (`user_type_id`, `user_type_libelle`) VALUES
(1, 'Agent d\'accueil'),
(2, 'Vétérinaire'),
(3, 'Agent d\'entretien'),
(4, 'Vendeur'),
(5, 'Client'),
(6, 'Admin');

-- --------------------------------------------------------

--
-- Table structure for table `USE_PASS_DATE`
--

CREATE TABLE `USE_PASS_DATE` (
  `pass_id` int(4) NOT NULL,
  `date_hour` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `USE_PASS_DATE`
--

INSERT INTO `USE_PASS_DATE` (`pass_id`, `date_hour`) VALUES
(5, '2021-04-12 21:24:37'),
(6, '2021-04-16 18:00:00'),
(7, '2021-04-17 14:20:52'),
(7, '2021-04-18 13:21:17'),
(8, '2021-04-13 18:09:57'),
(9, '2021-04-12 21:41:15');

-- --------------------------------------------------------

--
-- Table structure for table `VISIT_SPACE_PASS_HOUR`
--

CREATE TABLE `VISIT_SPACE_PASS_HOUR` (
  `pass_id` int(4) NOT NULL,
  `date_hour_enter` timestamp NOT NULL DEFAULT current_timestamp(),
  `space_id` int(4) NOT NULL,
  `date_hour_exit` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ANIMAL`
--
ALTER TABLE `ANIMAL`
  ADD PRIMARY KEY (`animal_id`),
  ADD KEY `ANIMAL_ibfk_1` (`space_id`),
  ADD KEY `ANIMAL_ibfk_2` (`species_id`);

--
-- Indexes for table `ASSOCIATE_SPACE_MEDIA`
--
ALTER TABLE `ASSOCIATE_SPACE_MEDIA`
  ADD PRIMARY KEY (`media_id`,`space_id`),
  ADD KEY `ASSOCIATE_SPACE_MEDIA_ibfk_2` (`space_id`);

--
-- Indexes for table `DATE_HOUR`
--
ALTER TABLE `DATE_HOUR`
  ADD PRIMARY KEY (`date_hour`);

--
-- Indexes for table `GIVE_ACCESS_PASS_TYPE_SPACE`
--
ALTER TABLE `GIVE_ACCESS_PASS_TYPE_SPACE`
  ADD PRIMARY KEY (`pass_type_id`,`space_id`),
  ADD KEY `space_id` (`space_id`);

--
-- Indexes for table `MAINTENANCE`
--
ALTER TABLE `MAINTENANCE`
  ADD PRIMARY KEY (`maintenance_id`),
  ADD KEY `MAINTENANCE_ibfk_1` (`space_id`),
  ADD KEY `MAINTENANCE_ibfk_2` (`manager_id`);

--
-- Indexes for table `MEDIA`
--
ALTER TABLE `MEDIA`
  ADD PRIMARY KEY (`media_id`);

--
-- Indexes for table `PASS`
--
ALTER TABLE `PASS`
  ADD PRIMARY KEY (`pass_id`),
  ADD KEY `pass_type_id` (`pass_type_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `PASS_TYPE`
--
ALTER TABLE `PASS_TYPE`
  ADD PRIMARY KEY (`pass_type_id`);

--
-- Indexes for table `PRESENCE`
--
ALTER TABLE `PRESENCE`
  ADD PRIMARY KEY (`presence_id`),
  ADD KEY `PRESENCE_ibfk_1` (`user_id`);

--
-- Indexes for table `SESSION`
--
ALTER TABLE `SESSION`
  ADD PRIMARY KEY (`session_id`),
  ADD KEY `SESSION_ibfk_1` (`user_id`);

--
-- Indexes for table `SPACE`
--
ALTER TABLE `SPACE`
  ADD PRIMARY KEY (`space_id`),
  ADD KEY `SPACE_ibfk_1` (`space_type_id`);

--
-- Indexes for table `SPACE_TYPE`
--
ALTER TABLE `SPACE_TYPE`
  ADD PRIMARY KEY (`space_type_id`);

--
-- Indexes for table `SPECIES`
--
ALTER TABLE `SPECIES`
  ADD PRIMARY KEY (`species_id`);

--
-- Indexes for table `TREATMENT`
--
ALTER TABLE `TREATMENT`
  ADD PRIMARY KEY (`treatment_id`),
  ADD KEY `TREATMENT_ibfk_1` (`animal_id`),
  ADD KEY `TREATMENT_ibfk_2` (`treatment_type_id`),
  ADD KEY `TREATMENT_ibfk_3` (`veterinary_id`);

--
-- Indexes for table `TREATMENT_TYPE`
--
ALTER TABLE `TREATMENT_TYPE`
  ADD PRIMARY KEY (`treatment_type_id`);

--
-- Indexes for table `USER`
--
ALTER TABLE `USER`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `user_mail` (`user_mail`),
  ADD KEY `USER_ibfk_1` (`user_type_id`);

--
-- Indexes for table `USER_TYPE`
--
ALTER TABLE `USER_TYPE`
  ADD PRIMARY KEY (`user_type_id`);

--
-- Indexes for table `USE_PASS_DATE`
--
ALTER TABLE `USE_PASS_DATE`
  ADD PRIMARY KEY (`pass_id`,`date_hour`),
  ADD KEY `date_hour` (`date_hour`);

--
-- Indexes for table `VISIT_SPACE_PASS_HOUR`
--
ALTER TABLE `VISIT_SPACE_PASS_HOUR`
  ADD PRIMARY KEY (`pass_id`,`date_hour_enter`,`space_id`),
  ADD KEY `date_hour_enter` (`date_hour_enter`),
  ADD KEY `space_id` (`space_id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ANIMAL`
--
ALTER TABLE `ANIMAL`
  ADD CONSTRAINT `ANIMAL_ibfk_1` FOREIGN KEY (`space_id`) REFERENCES `SPACE` (`space_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ANIMAL_ibfk_2` FOREIGN KEY (`species_id`) REFERENCES `SPECIES` (`species_id`) ON DELETE CASCADE;

--
-- Constraints for table `ASSOCIATE_SPACE_MEDIA`
--
ALTER TABLE `ASSOCIATE_SPACE_MEDIA`
  ADD CONSTRAINT `ASSOCIATE_SPACE_MEDIA_ibfk_1` FOREIGN KEY (`media_id`) REFERENCES `MEDIA` (`media_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ASSOCIATE_SPACE_MEDIA_ibfk_2` FOREIGN KEY (`space_id`) REFERENCES `SPACE` (`space_id`) ON DELETE CASCADE;

--
-- Constraints for table `GIVE_ACCESS_PASS_TYPE_SPACE`
--
ALTER TABLE `GIVE_ACCESS_PASS_TYPE_SPACE`
  ADD CONSTRAINT `GIVE_ACCESS_PASS_TYPE_SPACE_ibfk_1` FOREIGN KEY (`pass_type_id`) REFERENCES `PASS_TYPE` (`pass_type_id`),
  ADD CONSTRAINT `GIVE_ACCESS_PASS_TYPE_SPACE_ibfk_2` FOREIGN KEY (`space_id`) REFERENCES `SPACE` (`space_id`);

--
-- Constraints for table `MAINTENANCE`
--
ALTER TABLE `MAINTENANCE`
  ADD CONSTRAINT `MAINTENANCE_ibfk_1` FOREIGN KEY (`space_id`) REFERENCES `SPACE` (`space_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `MAINTENANCE_ibfk_2` FOREIGN KEY (`manager_id`) REFERENCES `USER` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `PASS`
--
ALTER TABLE `PASS`
  ADD CONSTRAINT `PASS_ibfk_1` FOREIGN KEY (`pass_type_id`) REFERENCES `PASS_TYPE` (`pass_type_id`),
  ADD CONSTRAINT `PASS_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `USER` (`user_id`);

--
-- Constraints for table `PRESENCE`
--
ALTER TABLE `PRESENCE`
  ADD CONSTRAINT `PRESENCE_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `USER` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `SESSION`
--
ALTER TABLE `SESSION`
  ADD CONSTRAINT `SESSION_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `USER` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `SPACE`
--
ALTER TABLE `SPACE`
  ADD CONSTRAINT `SPACE_ibfk_1` FOREIGN KEY (`space_type_id`) REFERENCES `SPACE_TYPE` (`space_type_id`) ON DELETE SET NULL;

--
-- Constraints for table `TREATMENT`
--
ALTER TABLE `TREATMENT`
  ADD CONSTRAINT `TREATMENT_ibfk_1` FOREIGN KEY (`animal_id`) REFERENCES `ANIMAL` (`animal_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `TREATMENT_ibfk_2` FOREIGN KEY (`treatment_type_id`) REFERENCES `TREATMENT_TYPE` (`treatment_type_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `TREATMENT_ibfk_3` FOREIGN KEY (`veterinary_id`) REFERENCES `USER` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `USER`
--
ALTER TABLE `USER`
  ADD CONSTRAINT `USER_ibfk_1` FOREIGN KEY (`user_type_id`) REFERENCES `USER_TYPE` (`user_type_id`) ON DELETE SET NULL;

--
-- Constraints for table `USE_PASS_DATE`
--
ALTER TABLE `USE_PASS_DATE`
  ADD CONSTRAINT `USE_PASS_DATE_ibfk_1` FOREIGN KEY (`pass_id`) REFERENCES `PASS` (`pass_id`),
  ADD CONSTRAINT `USE_PASS_DATE_ibfk_2` FOREIGN KEY (`date_hour`) REFERENCES `DATE_HOUR` (`date_hour`);

--
-- Constraints for table `VISIT_SPACE_PASS_HOUR`
--
ALTER TABLE `VISIT_SPACE_PASS_HOUR`
  ADD CONSTRAINT `VISIT_SPACE_PASS_HOUR_ibfk_1` FOREIGN KEY (`pass_id`) REFERENCES `PASS` (`pass_id`),
  ADD CONSTRAINT `VISIT_SPACE_PASS_HOUR_ibfk_2` FOREIGN KEY (`date_hour_enter`) REFERENCES `DATE_HOUR` (`date_hour`),
  ADD CONSTRAINT `VISIT_SPACE_PASS_HOUR_ibfk_3` FOREIGN KEY (`space_id`) REFERENCES `SPACE` (`space_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
