-- CreateTable
CREATE TABLE `notifications` (
    `_id` VARCHAR(191) NOT NULL,
    `ntf_user_id` VARCHAR(191) NOT NULL,
    `ntf_type` ENUM('NEW_LISTING', 'BID_OUTBID', 'SUBSCRIPTION_SUCCESS', 'VEHICLE_SUBMITTED', 'AUCTION_CLOSING_SOON', 'GENERAL') NOT NULL,
    `ntf_title` VARCHAR(191) NOT NULL,
    `ntf_body` TEXT NOT NULL,
    `ntf_data` JSON NULL,
    `ntf_channel` ENUM('PUSH', 'IN_APP', 'BOTH') NOT NULL DEFAULT 'BOTH',
    `ntf_is_read` BOOLEAN NOT NULL DEFAULT false,
    `ntf_read_at` DATETIME(3) NULL,
    `ntf_push_sent` BOOLEAN NOT NULL DEFAULT false,
    `ntf_push_sent_at` DATETIME(3) NULL,
    `ntf_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ntf_updated_at` DATETIME(3) NOT NULL,

    INDEX `notifications_ntf_user_id_ntf_is_read_idx`(`ntf_user_id`, `ntf_is_read`),
    INDEX `notifications_ntf_user_id_ntf_created_at_idx`(`ntf_user_id`, `ntf_created_at`),
    INDEX `notifications_ntf_type_idx`(`ntf_type`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `broadcast_logs` (
    `_id` VARCHAR(191) NOT NULL,
    `bl_type` ENUM('NEW_LISTING', 'BID_OUTBID', 'SUBSCRIPTION_SUCCESS', 'VEHICLE_SUBMITTED', 'AUCTION_CLOSING_SOON', 'GENERAL') NOT NULL,
    `bl_title` VARCHAR(191) NOT NULL,
    `bl_body` TEXT NOT NULL,
    `bl_data` JSON NULL,
    `bl_total_sent` INTEGER NOT NULL DEFAULT 0,
    `bl_total_failed` INTEGER NOT NULL DEFAULT 0,
    `bl_triggered_by` VARCHAR(191) NOT NULL,
    `bl_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `bl_updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
