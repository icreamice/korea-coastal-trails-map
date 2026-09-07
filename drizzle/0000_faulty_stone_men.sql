CREATE TABLE `visits` (
	`user_id` text NOT NULL,
	`course_id` text NOT NULL,
	`visited_on` text DEFAULT '' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `course_id`)
);
