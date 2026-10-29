CREATE DATABASE IF NOT EXISTS b2bstays_site CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE b2bstays_site;

CREATE TABLE IF NOT EXISTS enquiries (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  company       VARCHAR(160) NOT NULL,
  business_type VARCHAR(40)  NOT NULL,
  email         VARCHAR(190) NOT NULL,
  phone         VARCHAR(40)  NOT NULL,
  topic         VARCHAR(20)  NOT NULL DEFAULT 'demo',
  message       TEXT         NOT NULL,
  ip_address    VARCHAR(45)  NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ip_created (ip_address, created_at)
) ENGINE=InnoDB;
