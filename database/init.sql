IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'AdevaDemoDB')
BEGIN
    CREATE DATABASE AdevaDemoDB;
END
GO

USE AdevaDemoDB;
GO

-- Drop tables if they exist to start fresh
IF OBJECT_ID('dbo.Transactions', 'U') IS NOT NULL DROP TABLE dbo.Transactions;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
GO

-- Create Users Table
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(255) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    Password NVARCHAR(255) NOT NULL,
    Phone NVARCHAR(50) NULL,
    Age INT NULL,
    Country NVARCHAR(50) NOT NULL,
    Gender NVARCHAR(50) NOT NULL,
    Interests NVARCHAR(MAX) NULL,
    Comments NVARCHAR(MAX) NULL,
    Terms BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- Create Transactions Table
CREATE TABLE Transactions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NULL, -- Optional mapping to a user
    Amount DECIMAL(18,2) NOT NULL,
    CardLastFour NVARCHAR(4) NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Success',
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- Seed Data (Datos Iniciales)
INSERT INTO Users (FullName, Email, Password, Phone, Age, Country, Gender, Interests, Comments, Terms)
VALUES 
('Usuario Semilla 1', 'semilla1@example.com', 'pass123', '+34 611 111 111', 28, 'es', 'male', 'sports, technology', 'Comentario de prueba 1', 1),
('Usuario Semilla 2', 'semilla2@example.com', 'pass456', '+52 555 555 555', 35, 'mx', 'female', 'music, reading', 'Comentario de prueba 2', 1);
GO
