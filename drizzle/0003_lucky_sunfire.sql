CREATE TABLE `daily_emotional_summary` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`date` timestamp NOT NULL,
	`emotion_counts` text NOT NULL,
	`avg_intensity` float NOT NULL,
	`avg_valence` float NOT NULL,
	`dominant_mode` varchar(50),
	`crisis_count` int DEFAULT 0,
	`message_count` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `daily_emotional_summary_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emotional_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`message_id` int,
	`message_preview` text,
	`primary_emotion` varchar(50) NOT NULL,
	`secondary_emotions` text,
	`intensity` float NOT NULL,
	`valence` float NOT NULL,
	`conversational_mode` varchar(50),
	`crisis_detected` int DEFAULT 0,
	`crisis_category` varchar(50),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emotional_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `daily_emotional_summary` ADD CONSTRAINT `daily_emotional_summary_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `emotional_logs` ADD CONSTRAINT `emotional_logs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;