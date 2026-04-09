-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 08, 2026 at 05:19 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ps5_store`
--

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `total` decimal(10,2) DEFAULT 0.00,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`id`, `userId`, `total`, `createdAt`, `updatedAt`) VALUES
(1, 1, 0.00, '2026-04-08 01:58:45', '2026-04-08 02:14:30'),
(2, 2, 0.00, '2026-04-08 02:16:21', '2026-04-08 02:49:58');

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(11) NOT NULL,
  `cartId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `totalAmount` decimal(10,2) NOT NULL,
  `status` enum('pending','paid','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `paymentMethod` varchar(255) DEFAULT NULL,
  `transactionId` varchar(255) DEFAULT NULL,
  `street` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `zip` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `orderId` int(11) NOT NULL,
  `productId` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) DEFAULT 'https://via.placeholder.com/300x400',
  `genre` enum('Action','RPG','Sports','Racing','Adventure','Puzzle','Shooter','Strategy','Other') DEFAULT 'Other',
  `rating` float DEFAULT 0,
  `stock` int(11) NOT NULL DEFAULT 0,
  `releaseDate` datetime DEFAULT NULL,
  `developer` varchar(255) DEFAULT NULL,
  `publisher` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `title`, `description`, `price`, `image`, `genre`, `rating`, `stock`, `releaseDate`, `developer`, `publisher`, `createdAt`, `updatedAt`) VALUES
(1, 'god of war', 'Step into the world of gods and monsters in God of War, an epic action-adventure game that follows Kratos, a powerful warrior with a troubled past, and his son Atreus on a dangerous journey through the realms of Norse mythology.\n\nExperience intense combat, breathtaking visuals, and a deeply emotional story as you battle fierce enemies, solve puzzles, and uncover ancient secrets. With a dynamic combat system, powerful weapons like the Leviathan Axe, and stunning environments, God of War delivers an unforgettable gaming experience.\n\nPerfect for players who enjoy story-driven adventures, challenging gameplay, and cinematic action.', 250.00, 'https://upload.wikimedia.org/wikipedia/en/a/a7/God_of_War_4_cover.jpg', 'Action', 0, 100, NULL, 'adhma', 'adhma', '2026-04-08 02:06:52', '2026-04-08 03:18:07'),
(2, 'Marvel''s Spider-Man 2', 'Swing between Peter Parker and Miles Morales in a blockbuster superhero adventure built around fast traversal, cinematic combat, and a darker threat spreading across New York. This is a premium action game for PlayStation fans who love spectacle and momentum.', 279.00, 'https://upload.wikimedia.org/wikipedia/en/e/eb/Spider-Man_2_cover_art.jpg', 'Action', 0, 85, '2023-10-20 00:00:00', 'Insomniac Games', 'Sony Interactive Entertainment', '2026-04-08 05:19:00', '2026-04-08 05:19:00'),
(3, 'Horizon Forbidden West', 'Join Aloy on a massive open-world journey through dangerous frontier lands filled with machine beasts, tribal conflict, and hidden technology. Explore, craft, and battle through one of PlayStation''s most visually striking adventures.', 239.00, 'https://upload.wikimedia.org/wikipedia/en/6/69/Horizon_Forbidden_West_cover_art.jpg', 'Adventure', 0, 90, '2022-02-18 00:00:00', 'Guerrilla Games', 'Sony Interactive Entertainment', '2026-04-08 05:19:00', '2026-04-08 05:19:00'),
(4, 'Gran Turismo 7', 'A driving celebration for PlayStation players, Gran Turismo 7 delivers realistic handling, gorgeous cars, and a rewarding progression loop that works for both competitive racers and collectors chasing dream garages.', 229.00, 'https://upload.wikimedia.org/wikipedia/en/1/15/Gran_Turismo_7_cover_art.jpg', 'Racing', 0, 70, '2022-03-04 00:00:00', 'Polyphony Digital', 'Sony Interactive Entertainment', '2026-04-08 05:19:00', '2026-04-08 05:19:00'),
(5, 'EA Sports FC 24', 'Take football to the next level with polished presentation, deep team building, and fast online competition. Whether you play solo seasons or with friends, it brings the energy of the stadium to your console.', 199.00, 'https://upload.wikimedia.org/wikipedia/en/f/f5/EA_Sports_FC_24_cover.jpg', 'Sports', 0, 120, '2023-09-29 00:00:00', 'EA Vancouver', 'EA Sports', '2026-04-08 05:19:00', '2026-04-08 05:19:00'),
(6, 'NBA 2K24', 'Step onto the court with realistic presentation, detailed player motion, and plenty of game modes for competitive and casual basketball fans. Build a team, chase championships, and enjoy fast sports action on PlayStation.', 189.00, 'https://upload.wikimedia.org/wikipedia/en/0/03/NBA_2K24_cover_art.jpg', 'Sports', 0, 95, '2023-09-08 00:00:00', 'Visual Concepts', '2K', '2026-04-08 05:19:00', '2026-04-08 05:19:00'),
(7, 'Elden Ring', 'Enter a vast fantasy world full of mystery, challenge, and unforgettable boss fights. Elden Ring blends exploration, build freedom, and punishing combat into one of the most celebrated RPG experiences available on PlayStation.', 259.00, 'https://upload.wikimedia.org/wikipedia/en/b/b9/Elden_Ring_Box_art.jpg', 'RPG', 0, 88, '2022-02-25 00:00:00', 'FromSoftware', 'Bandai Namco Entertainment', '2026-04-08 05:19:00', '2026-04-08 05:19:00'),
(8, 'Final Fantasy XVI', 'Summon devastating powers and dive into a mature fantasy war story filled with giant battles, sharp action combat, and cinematic storytelling. It is an ideal pick for players who want story and spectacle together.', 269.00, 'https://upload.wikimedia.org/wikipedia/en/7/70/Final_Fantasy_XVI_cover_art.png', 'RPG', 0, 76, '2023-06-22 00:00:00', 'Square Enix', 'Square Enix', '2026-04-08 05:19:00', '2026-04-08 05:19:00'),
(9, 'Resident Evil 4', 'Survive a tense rescue mission in a reimagined horror-action classic packed with intense combat, clever level design, and constant pressure. It delivers strong pacing and unforgettable encounters from start to finish.', 219.00, 'https://upload.wikimedia.org/wikipedia/en/d/dc/Resident_Evil_4_2023_cover_art.jpg', 'Shooter', 0, 82, '2023-03-24 00:00:00', 'Capcom', 'Capcom', '2026-04-08 05:19:00', '2026-04-08 05:19:00'),
(10, 'Ratchet & Clank: Rift Apart', 'Jump between dimensions in a colorful, high-speed adventure that shows off PlayStation''s flair for personality, polished combat, and dazzling world design. It is perfect for players who want fun, charm, and visual pop.', 209.00, 'https://upload.wikimedia.org/wikipedia/en/3/38/Ratchet_%26_Clank_Rift_Apart_cover_art.jpg', 'Adventure', 0, 64, '2021-06-11 00:00:00', 'Insomniac Games', 'Sony Interactive Entertainment', '2026-04-08 05:19:00', '2026-04-08 05:19:00'),
(11, 'Call of Duty: Modern Warfare III', 'Drop into explosive multiplayer firefights and blockbuster missions with fast weapon handling, competitive modes, and nonstop action. It is built for players who want instant intensity and big online moments.', 249.00, 'https://upload.wikimedia.org/wikipedia/en/0/02/Call_of_Duty_Modern_Warfare_3_cover_art.jpg', 'Shooter', 0, 110, '2023-11-10 00:00:00', 'Sledgehammer Games', 'Activision', '2026-04-08 05:19:00', '2026-04-08 05:19:00');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `firstName` varchar(255) DEFAULT '',
  `lastName` varchar(255) DEFAULT '',
  `role` enum('customer','admin') DEFAULT 'customer',
  `phone` varchar(255) DEFAULT NULL,
  `street` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `zip` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `firstName`, `lastName`, `role`, `phone`, `street`, `city`, `state`, `zip`, `country`, `createdAt`, `updatedAt`) VALUES
(1, 'adhamnader963', 'adhamnader963@gmail.com', '$2a$10$u9j7tNo9PwGOMhk4jw.E2.rUJnSFkgQqtJgLOgQZ9k.6QeRjyfdwq', '', '', 'admin', NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-08 01:30:03', '2026-04-08 01:58:26'),
(2, 'adhaam', 'adhamnader069@gmail.com', '$2a$10$kz5NW2gb0cS6RDNxtnLVhe9Y26xpcsOXqXyAAK0aRCZJqL5S8sYAi', '', '', 'customer', NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-08 02:16:21', '2026-04-08 02:16:21');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cartId` (`cartId`),
  ADD KEY `productId` (`productId`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orderId` (`orderId`),
  ADD KEY `productId` (`productId`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reviews_user_id_product_id` (`userId`,`productId`),
  ADD KEY `productId` (`productId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cartId`) REFERENCES `carts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
