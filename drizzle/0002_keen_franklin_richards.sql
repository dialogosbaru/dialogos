CREATE TABLE `emergency_activations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(64),
	`trigger_phrase` text NOT NULL,
	`category` varchar(50) NOT NULL,
	`severity` varchar(20) NOT NULL,
	`confidence` int NOT NULL,
	`user_message` text NOT NULL,
	`responded` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emergency_activations_id` PRIMARY KEY(`id`)
);
